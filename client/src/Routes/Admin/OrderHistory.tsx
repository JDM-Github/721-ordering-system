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
	Typography,
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OrderHistory = ({ user }) => {
	const [orders, setOrders] = useState([]);
	const [openModal, setOpenModal] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);

	const [openRecieptModal, setOpenRecieptModal] = useState(false);
	const [receipt, setReceipt] = useState<any>(null);
	const navigate = useNavigate();

	const handleViewReciept = (receiptJson) => {
		setReceipt(receiptJson);
		setOpenRecieptModal(true);
	};
	const handleCloseReceiptModal = () => {
		setOpenRecieptModal(false);
		setReceipt(null);
	};

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
				{ userId: user?.id }
			);
			if (data.success) {
				const ord = data.orderSummaries.map((order) => ({
					id: order.id,
					orderId: order.orderId,
					referenceNumber: order.referenceNumber,
					status: order.status,
					address: order.user.address,
					contactNumber: order.user.contactNumber,
					orderStatus: order.orderStatus,
					downPaymentStatus: order.downPaymentStatus,
					paymentLink: order.paymentLink,
					orderReceiptJson: order.orderReceiptJson,
					createdAt: new Date(order.createdAt).toLocaleDateString(),
					products: order.products.map((product) => ({
						product: product,
						productId: product.productId,
						productName: product.productName,
						price: product.price,
						quantity: product.quantity,
						customization: product.customization,
						productImages: product.productImages,
					})),
				}));
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

	const handlePayOrder = (param) => {
		window.location.href = param;
	};
	const handlePayRemainingBalance = (param) => {
		window.location.href = param;
	};
	const removeOrder = async (id) => {
		const toastId = toast.loading("Processing your request...");
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/delete-order",
				{ id: id }
			);

			if (data.success) {
				toast.update(toastId, {
					render: "Order has been deleted.",
					type: "success",
					isLoading: false,
					autoClose: 3000,
				});
				loadRequest();
			} else {
				toast.update(toastId, {
					render: data.message || "Unable to load order history",
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
			}
		} catch (error) {
			toast.update(toastId, {
				render: error.message || "Unable to load order history",
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
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
			field: "downPaymentStatus",
			headerName: "Downpayment Status",
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
			renderCell: (params) => {
				const {
					id,
					downPaymentStatus,
					orderStatus,
					orderId,
					paymentLink,
				} = params.row;

				return (
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
						{!((downPaymentStatus === "PENDING" &&
							orderStatus === "------") ||
							(downPaymentStatus === "------" &&
								orderStatus === "PENDING")) && (
							<Button
								variant="contained"
								color="primary"
								onClick={() =>
									handleViewReciept(
										params.row.orderReceiptJson
									)
								}
								style={{
									backgroundColor: "#FF7300FF",
									marginRight: "10px",
								}}
							>
								View Receipt
							</Button>
						)}
						{((downPaymentStatus === "PENDING" &&
							orderStatus === "------") ||
							(downPaymentStatus === "------" &&
								orderStatus === "PENDING")) && (
							<Button
								variant="contained"
								color="primary"
								onClick={() => handlePayOrder(paymentLink)}
								style={{
									backgroundColor: "#FFA500",
									marginRight: "10px",
								}}
							>
								Pay Order
							</Button>
						)}
						{orderId !== "" &&
							downPaymentStatus === "PAID" &&
							orderStatus === "PENDING" && (
								<Button
									variant="contained"
									color="primary"
									onClick={() =>
										handlePayRemainingBalance(paymentLink)
									}
									style={{ backgroundColor: "#FF1E00FF" }}
								>
									Pay Remaining Balance
								</Button>
							)}
						{((downPaymentStatus === "PENDING" &&
							orderStatus === "------") ||
							(downPaymentStatus === "------" &&
								orderStatus === "PENDING")) && (
							<Button
								variant="contained"
								color="primary"
								onClick={() => removeOrder(id)}
								style={{ backgroundColor: "#FF1E00FF" }}
							>
								Cancel Order
							</Button>
						)}
						{(downPaymentStatus === "EXPIRED" ||
							orderStatus === "EXPIRED") && (
							<Button
								variant="contained"
								color="primary"
								onClick={() => removeOrder(id)}
								style={{ backgroundColor: "#FF1E00FF" }}
							>
								Delete Order
							</Button>
						)}
					</>
				);
			},
			width: 400,
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
				open={openRecieptModal && receipt !== null}
				onClose={handleCloseReceiptModal}
				maxWidth="sm"
				fullWidth
			>
				{receipt !== null && (
					<>
						<DialogTitle>Receipt Details</DialogTitle>
						<DialogContent dividers>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Reference Number:</strong>{" "}
								{receipt.referenceNumber}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Email:</strong> {receipt.user.email}
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Address:</strong> {receipt.user.address}
							</Typography>

							<Typography
								variant="h6"
								gutterBottom
								style={{ marginTop: "20px" }}
							>
								Products
							</Typography>
							<Table>
								<TableBody>
									{receipt.products.map((product, index) => (
										<TableRow key={index}>
											<TableCell>
												{product.name}
											</TableCell>
											<TableCell>
												{product.quantity}
											</TableCell>
											<TableCell>{`PHP ${product.price}`}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							<Typography
								variant="h6"
								gutterBottom
								style={{ marginTop: "20px" }}
							>
								Payment Details
							</Typography>
							<Typography variant="subtitle1" gutterBottom>
								<strong>Total Amount:</strong> PHP{" "}
								{receipt.totalAmount}
							</Typography>
							{receipt.isDownpayment && (
								<>
									<Typography
										variant="subtitle1"
										gutterBottom
									>
										<strong>Downpayment Amount:</strong> PHP{" "}
										{receipt.downpaymentAmount}
									</Typography>
									<Typography
										variant="subtitle1"
										gutterBottom
									>
										<strong>Remaining Balance:</strong> PHP{" "}
										{receipt.remainingBalance}
									</Typography>
								</>
							)}
							<Typography variant="subtitle1" gutterBottom>
								<strong>Date:</strong>{" "}
								{new Date(receipt.date).toLocaleString()}
							</Typography>
						</DialogContent>
					</>
				)}
				<DialogActions>
					<Button onClick={handleCloseReceiptModal} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>

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
							<h3>Status: {selectedOrder.status}</h3>
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
		</ThemeProvider>
	);
};

export default OrderHistory;
