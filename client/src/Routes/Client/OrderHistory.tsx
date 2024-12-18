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

const OrderHistory = () => {
	const [orders, setOrders] = useState([]);
	const [openModal, setOpenModal] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const navigate = useNavigate();

	const handleViewOrder = (order) => {
		setSelectedOrder(order);
		setOpenModal(true);
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		setSelectedOrder(null);
	};

	const handleViewProduct = (productId) => {
		navigate(`/product/${productId}`);
	};

	const updateStatus = async (id) => {
		const isConfirmed = window.confirm(
			"Are you sure you want to update the order status?"
		);
		if (!isConfirmed) {
			return;
		}
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/order-update-status",
				{ id }
			);
			if (data.success) {
				toast.success("Order status updated successfully");
				loadRequest();
			} else {
				toast.error(data.message || "Order status has error");
				return;
			}
		} catch (error) {
			toast.error(error.message || "Order status has error");
			return;
		}
	};

	const loadRequest = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/get-all-order",
				{}
			);
			if (data.success) {
				const ord = data.orderSummaries.map((order) => ({
					id: order.id,
					referenceNumber: order.referenceNumber,
					status: order.status,
					isCompleted: order.isCompleted,
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
				<>
					<Button
						variant="contained"
						color="primary"
						onClick={() => handleViewOrder(params.row)}
						style={{
							backgroundColor: "#FFA500",
							marginRight: "10px",
						}}
					>
						View Order
					</Button>
					{!params.row.isCompleted && (
						<Button
							variant="contained"
							color="primary"
							onClick={() => updateStatus(params.row.id)}
							style={{ backgroundColor: "#FF2600FF" }}
						>
							{params.row.status}
						</Button>
					)}
					{params.row.isCompleted && (
						<Button
							variant="contained"
							color="primary"
							onClick={() => handleViewOrder(params.row)}
							style={{ backgroundColor: "#FFFB00FF" }}
							disabled={true}
						>
							Completed
						</Button>
					)}
				</>
			),
			width: 300,
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
						rows={orders}
						columns={columns}
						disableColumnSelector
						disableRowSelectionOnClick
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
													secondary={`Price: ₱${product.price} | Quantity: ${product.quantity}`}
												/>

												<Button
													variant="outlined"
													color="primary"
													onClick={() =>
														handleViewProduct(
															product.productId
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
							<Button
								variant="outlined"
								color="primary"
								// onClick={() =>
								// 	// handleViewProduct(product.productId)
								// }
								style={{ marginLeft: 10 }}
							>
								View Receipt
							</Button>
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
