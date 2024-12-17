import React, { useEffect, useState } from "react";
import RequestHandler from "../../Functions/RequestHandler";
import { DataGrid } from "@mui/x-data-grid";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemText,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OrderHistory = ({ user }) => {
	const [orders, setOrders] = useState([]);
	const [openModal, setOpenModal] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const navigate = useNavigate();

	const handleViewOrder = (order) => {
		setSelectedOrder(order);
		setOpenModal(true);
	};

	// Close the modal
	const handleCloseModal = () => {
		setOpenModal(false);
		setSelectedOrder(null);
	};

	const handleViewProduct = (order) => {
		// navigate(`/product/${productId}`);
		alert(JSON.stringify(order));
		navigate("/view-design", {
			state: {
				order: order,
				orders: null,
			},
		});
	};

	const loadRequest = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/get-all-order",
				{ userId: user?.id }
			);
			if (data.success) {
				const ord = data.orderSummaries.map((order) => ({
					id: order.id,
					referenceNumber: order.referenceNumber,
					createdAt: new Date(order.createdAt).toLocaleDateString(),
					products: order.products.map((product) => ({
						productId: product.productId,
						productName: product.productName,
						price: product.price,
						quantity: product.quantity,
						customization: product.customization,
						productImages: product.productImages,
					})),
				}));
				console.log(data.orderSummaries);
				setOrders(ord);
			} else {
				toast.error(data.message || "Unable to load order history");
				return;
			}
		} catch (error) {
			toast.error(error.message || "Unable to load order history");
			return;
		}
	};

	useEffect(() => {
		loadRequest();
	}, []);

	const columns = [
		{ field: "id", headerName: "Order ID", width: 200 },
		{
			field: "referenceNumber",
			headerName: "Reference Number",
			width: 200,
		},
		{ field: "createdAt", headerName: "Order Date", width: 150 },
		{
			field: "actions",
			headerName: "Actions",
			renderCell: (params) => (
				<Button
					variant="contained"
					color="primary"
					onClick={() => handleViewOrder(params.row)} // Open modal on click
					style={{ backgroundColor: "#FFA500" }}
				>
					View Order
				</Button>
			),
			width: 150,
		},
	];

	const theme = createTheme({
		palette: {
			primary: {
				main: "#FFA500",
			},
			background: {
				default: "#F5F5F5",
			},
		},
		typography: {
			fontFamily: "'Roboto', sans-serif",
		},
	});

	return (
		<ThemeProvider theme={theme}>
			<div className="flex justify-center w-full min-h-[80vh] p-4">
				<div className="bg-white shadow-lg rounded-lg p-4">
					<DataGrid
						disableColumnSelector
						disableRowSelectionOnClick
						rows={orders}
						columns={columns}
						style={{ borderRadius: "8px" }}
						sx={{
							"& .MuiDataGrid-root": {
								border: "none",
							},
							"& .MuiDataGrid-columnHeaders": {
								backgroundColor: "#FFA500",
								color: "black",
							},
							"& .MuiDataGrid-cell": {
								borderBottom: "1px solid #f1f1f1",
							},
							"& .MuiDataGrid-footerContainer": {
								backgroundColor: "#FFF",
								borderTop: "1px solid #f1f1f1",
							},
						}}
					/>
				</div>
			</div>

			<Dialog open={openModal} onClose={handleCloseModal}>
				<DialogTitle>Order Details</DialogTitle>
				<DialogContent>
					{selectedOrder && (
						<div>
							<h3>
								Reference Number:{" "}
								{selectedOrder.referenceNumber}
							</h3>
							<List>
								{selectedOrder.products &&
								selectedOrder.products.length > 0 ? (
									selectedOrder.products.map(
										(product, index) => (
											<ListItem key={index}>
												{product.productImages &&
													product
														.productImages[0] && (
														<img
															src={
																product
																	.productImages[0]
															}
															alt={
																product.productName
															}
															style={{
																width: "100px",
																height: "100px",
																objectFit:
																	"cover",
																marginRight:
																	"10px",
															}}
														/>
													)}
												<ListItemText
													primary={`Product Name: ${product.productName}`}
													secondary={`Price: $${product.price} | Quantity: ${product.quantity}`}
												/>

												<Button
													variant="outlined"
													color="primary"
													onClick={() =>
														handleViewProduct(
															product
														)
													}
													style={{ marginLeft: 10 }}
												>
													View Product
												</Button>
											</ListItem>
										)
									)
								) : (
									<ListItem>
										No products in this order.
									</ListItem>
								)}
							</List>
						</div>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseModal} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</ThemeProvider>
	);
};

export default OrderHistory;
