import React, { useEffect, useState } from "react";
import RequestHandler from "../../Functions/RequestHandler";
import { DataGrid } from "@mui/x-data-grid";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	Select,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
	const navigate = useNavigate();
	const authToken = sessionStorage.getItem("authToken");
	useEffect(() => {
		if (authToken !== "admin-token") {
			toast.error("You are not authorized to view this page.");
			navigate("/?message=invalid-auth");
		}
	}, []);
	const [orders, setOrders] = useState([]);
	const [openModal, setOpenModal] = useState(false);
	const [openRecieptModal, setOpenRecieptModal] = useState(false);
	const [receipt, setReceipt] = useState<any>(null);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);

	const handleViewOrder = (order) => {
		setSelectedOrder(order);
		setOpenModal(true);
	};

	const handleViewReciept = (receiptJson) => {
		setReceipt(receiptJson);
		setOpenRecieptModal(true);
	};
	const handleCloseReceiptModal = () => {
		setOpenRecieptModal(false);
		setReceipt(null);
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		setSelectedOrder(null);
	};
	

	const handleViewProduct = (order) => {
		navigate(`/view-design?id=${order.product.orderProductId}`);
	};

	const updateStatus = async (id, newStatus, userId, email) => {
		const isConfirmed = window.confirm(
			`Are you sure you want to update the order status to "${newStatus}"?`
		);
		if (!isConfirmed) {
			return;
		}
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/order-update-status",
				{ id, newStatus, userId, email }
			);
			if (data.success) {
				toast.success("Order status updated successfully");
				loadRequest();
			} else {
				toast.error(data.message || "Order status update failed");
			}
		} catch (error) {
			toast.error(error.message || "Order status update failed");
		}
	};

	const allStatuses = [
		"Pending",
		"Printing",
		"Sewing",
		"Packing",
		"Ready to pickup",
		"Completed",
	];

	const StatusColumn = ({ status, id, userId, email }) => {
		const [selectedStatus, setSelectedStatus] = React.useState(status);

		const handleStatusChange = (event) => {
			const newStatus = event.target.value;
			setSelectedStatus(newStatus);
			updateStatus(id, newStatus, userId, email);
		};

		return (
			<FormControl fullWidth size="small">
				<Select
					labelId={`status-select-label-${id}`}
					value={selectedStatus}
					onChange={handleStatusChange}
					style={{ width: "100px" }}
				>
					{allStatuses.map((statusOption, index) => (
						<MenuItem
							key={statusOption}
							value={statusOption}
							disabled={
								allStatuses.indexOf(selectedStatus) + 1 < index
							}
						>
							{statusOption}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		);
	};


	const loadRequest = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/get-all-order",
				{ paid: true }
			);
			if (data.success) {
				const ord = data.orderSummaries.map((order) => ({
					id: order.id,
					userId: order.user.id,
					referenceNumber: order.referenceNumber,
					address: order.user.address,
					contactNumber: order.user.contactNumber,
					status: order.status,
					isCompleted: order.isCompleted,
					orderStatus: order.orderStatus,
					orderReceiptJson: order.orderReceiptJson,
					// user: order.user,
					email: order.user.email,
					fullname: order.user.firstName + " " + order.user.lastName,
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

	const columns = [
		{ field: "id", headerName: "Order ID", width: 100 },
		{
			field: "email",
			headerName: "Email",
			width: 150,
		},
		{
			field: "fullname",
			headerName: "Full Name",
			width: 150,
		},
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
		{ field: "createdAt", headerName: "Order Date", width: 100 },
		{
			field: "actions",
			headerName: "Actions",
			renderCell: (params) => {
				return (
					<div className="flex align-items-center justify-center h-100 mt-3">
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
						<Button
							variant="contained"
							color="primary"
							onClick={() => handleViewReciept(params.row.orderReceiptJson)}
							style={{
								backgroundColor: "#FF7300FF",
								marginRight: "10px",
							}}
						>
							View Receipt
						</Button>
						{!params.row.isCompleted && (
							<StatusColumn
								status={params.row.status}
								id={params.row.id}
								userId={params.row.userId}
								email={params.row.email}
							/>
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
					</div>
				);
			},
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

	const handleDownload = () => {
		if (!selectedOrder) return;

		const orderData = {
			ReferenceNumber: selectedOrder.referenceNumber,
			ContactNumber: selectedOrder.contactNumber,
			Address: selectedOrder.address,
			Status: selectedOrder.status,
			Products: selectedOrder.products.map((product) => ({
				Name: product.productName,
				Price: `₱${product.price}`,
				Quantity: product.quantity,
			})),
		};

		const blob = new Blob([JSON.stringify(orderData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `Order_${selectedOrder.referenceNumber}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<ThemeProvider theme={theme}>
			<div className="flex justify-center w-full min-h-[80vh] p-4 max-h-[80vh]">
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
					<Button onClick={handleDownload} color="secondary">
						Download
					</Button>
				</DialogActions>
			</Dialog>
		</ThemeProvider>
	);
};

export default OrderHistory;
