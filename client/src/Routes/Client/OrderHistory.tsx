import React, { useEffect, useState } from "react";
import "react-tabulator/lib/styles.css";
import "react-tabulator/lib/css/bootstrap/tabulator_bootstrap.min.css";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const OrderHistory = () => {
	const [orders, setOrders] = useState([]);
	const navigate = useNavigate();

	const handleViewOrder = (order) => {
		alert(JSON.stringify(order));
		navigate("/view-design", {
			state: {
				order: order.productData,
				orders: null,
			},
		});
	};

	const loadRequest = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/get-all-order",
				{}
			);
			if (data.success) {
				const ord = data.products.map((product) => ({
					id: product.id,
					productName: product.Product.productName,
					price: product.Product.price,
					quantity: product.quantity,
					color: product.customization.color,
					size: product.customization.selectedSize,
					pattern: product.customization.pattern,
					createdAt: new Date(product.createdAt).toLocaleDateString(),
					productData: product,
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
		{ field: "id", headerName: "Order ID" },
		{ field: "productName", headerName: "Product Name" },
		{ field: "price", headerName: "Price" },
		{ field: "quantity", headerName: "Quantity" },
		{ field: "color", headerName: "Color" },
		{ field: "size", headerName: "Size" },
		{ field: "pattern", headerName: "Pattern" },
		{ field: "createdAt", headerName: "Order Date" },
		{
			field: "actions",
			headerName: "Actions",
			renderCell: (params) => (
				<>
					<Button
						variant="contained"
						color="primary"
						onClick={() => handleViewOrder(params.row)}
						style={{ backgroundColor: "#FFA500" }}
					>
						View Order
					</Button>
					<Button
						variant="contained"
						color="secondary"
						onClick={() => handleFinishOrder(params.row)}
						style={{ backgroundColor: "#4CAF50" }}
					>
						Finish
					</Button>
				</>
			),
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
			<div className="w-5/6 p-4" style={{ height: 600 }}>
				<div className="bg-white shadow-lg rounded-lg p-4 mb-3">
					<h1 className="border-l-4 ps-4 border-orange-500 text-2xl font-semibold text-gray-700">
						ORDER HISTORY
					</h1>
				</div>
				<div className="bg-white shadow-lg rounded-lg p-4">
					<DataGrid
						rows={orders}
						columns={columns}
						checkboxSelection
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
		</ThemeProvider>
	);
};

export default OrderHistory;
function handleFinishOrder(row: any): void {
	throw new Error("Function not implemented.");
}
