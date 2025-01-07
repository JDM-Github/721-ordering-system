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
import FeedbackModal from "../../Component/FeedbackModal.tsx";

const CompletedOrder = ({ user }) => {
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

	const handleViewProduct = (order) => {
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
				{ userId: user?.id, status: "Completed" }
			);
			if (data.success) {
				const ord = data.orderSummaries.map((order) => ({
					id: order.id,
					userId: order.user.id,
					referenceNumber: order.referenceNumber,
					status: order.status,
					address: order.user.address,
					contactNumber: order.user.contactNumber,
					orderStatus: order.orderStatus,
					createdAt: new Date(order.createdAt).toLocaleDateString(),
					alreadyFeedback: order.alreadyFeedback,
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

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [targetOrder, setTargetOrder] = useState(null);

	const handleOpenModal = (order) => {
		setIsModalOpen(true);
		setTargetOrder(order);
	};
	const handleFeedbackCloseModal = () => setIsModalOpen(false);
	const handleFeedbackSubmit = async (feedback) => {
		handleFeedbackCloseModal();
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/add-feedback",
				{
					orderid: feedback.order.id,
					userId: feedback.order.userId,
					rate: feedback.rate,
					comment: feedback.comment,
				}
			);
			if (data.success) {
				toast.success("Feedback has been sent successfully");
				loadRequest();
			} else {
				toast.error(data.message || "Unable to load order history");
				return;
			}
		} catch (error) {
			toast.error(error.message || "Unable to load order history");
			return;
		}
	};

	const columns = [
		{ field: "id", headerName: "Order ID", width: 200 },
		{
			field: "referenceNumber",
			headerName: "Reference Number",
			width: 100,
		},
		{
			field: "status",
			headerName: "Status",
			width: 100,
		},
		{
			field: "orderStatus",
			headerName: "Order Status",
			width: 100,
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
					{!params.row.alreadyFeedback && (
						<Button
							variant="contained"
							color="primary"
							onClick={() => handleOpenModal(params.row)}
							style={{
								backgroundColor: "#FFA500",
								marginRight: "10px",
							}}
						>
							Add Feedback
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

			<Dialog
				open={openModal}
				onClose={handleCloseModal}
				fullWidth
				maxWidth="lg"
				PaperProps={{
					style: {
						minWidth: "60vw",
					},
				}}
			>
				<DialogTitle>Order Details</DialogTitle>
				<DialogContent>
					{selectedOrder && (
						<div>
							<h3>
								Reference Number:{" "}
								{selectedOrder.referenceNumber}
							</h3>
							<h3>
								Contact Number: {selectedOrder.contactNumber}
							</h3>
							<h3>Address: {selectedOrder.address}</h3>
							<h3>Status: {selectedOrder.orderStatus}</h3>
							<div
								style={{
									minHeight: "50vh",
									overflowY: "auto",
								}}
							>
								<List
									style={{
										borderRadius: "8px",
										padding: "5px",
									}}
								>
									{selectedOrder.products &&
									selectedOrder.products.length > 0 ? (
										selectedOrder.products.map(
											(product, index) => (
												<ListItem
													key={index}
													className="bg-gray-100"
													style={{
														display: "flex",
														alignItems: "center",
														justifyContent:
															"space-between",
														borderBottom:
															index !==
															selectedOrder
																.products
																.length -
																1
																? "1px solid #e0e0e0"
																: "none",
														padding: "10px 0",
													}}
												>
													<div
														style={{
															marginLeft: "20px",
															display: "flex",
															alignItems:
																"center",
															flex: 1,
														}}
													>
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
																		width: "80px",
																		height: "80px",
																		objectFit:
																			"cover",
																		borderRadius:
																			"8px",
																		marginRight:
																			"15px",
																	}}
																/>
															)}
														<div
															style={{ flex: 1 }}
														>
															<strong
																style={{
																	fontSize:
																		"16px",
																	color: "#333",
																}}
															>
																{
																	product.productName
																}
															</strong>
															<p
																style={{
																	fontSize:
																		"14px",
																	color: "#555",
																}}
															>
																Price: ₱
																{product.price}{" "}
																| Quantity:{" "}
																{
																	product.quantity
																}
															</p>
														</div>
													</div>
													<Button
														variant="outlined"
														color="primary"
														onClick={() =>
															handleViewProduct(
																product
															)
														}
														style={{
															marginRight: "20px",
															fontSize: "14px",
															padding: "5px 10px",
															textTransform:
																"none",
														}}
													>
														View
													</Button>
												</ListItem>
											)
										)
									) : (
										<ListItem
											style={{
												textAlign: "center",
												padding: "20px",
											}}
										>
											No products in this order.
										</ListItem>
									)}
								</List>
							</div>
						</div>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseModal} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
			<FeedbackModal
				isOpen={isModalOpen}
				closeModal={handleFeedbackCloseModal}
				submitFeedback={handleFeedbackSubmit}
				order={targetOrder}
			/>
		</ThemeProvider>
	);
};

export default CompletedOrder;
