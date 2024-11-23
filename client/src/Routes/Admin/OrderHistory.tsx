import React, { useState } from "react";
import { ReactTabulator } from "react-tabulator"; // import Tabulator
import "react-tabulator/lib/styles.css"; // import Tabulator styles
import "react-tabulator/lib/css/bootstrap/tabulator_bootstrap.min.css"; // optional, if you want to use the bootstrap theme

// Sample order data
const orderData = [
	{
		id: 1,
		itemName: "BB Top",
		quantity: 2,
		size: "M",
		price: "$29.99",
		status: "Shipped",
		notes: "N/A",
	},
	{
		id: 2,
		itemName: "Jacket",
		quantity: 1,
		size: "L",
		price: "$49.99",
		status: "Pending",
		notes: "Custom design",
	},
	{
		id: 3,
		itemName: "T-shirt",
		quantity: 3,
		size: "S",
		price: "$19.99",
		status: "Delivered",
		notes: "Urgent delivery",
	},
	// Add more sample data as needed
];

const OrderHistory = () => {
	const [orders, setOrders] = useState(orderData);

	// Configure Tabulator columns
	const columns = [
		{
			title: "Order ID",
			field: "id",
			width: 100,
			sorter: "number",
			headerHozAlign: "center",
			hozAlign: "center",
		},
		{
			title: "Item Name",
			field: "itemName",
			width: 200,
			headerHozAlign: "center",
			hozAlign: "center",
		},
		{
			title: "Quantity",
			field: "quantity",
			width: 100,
			sorter: "number",
			headerHozAlign: "center",
			hozAlign: "center",
		},
		{
			title: "Size",
			field: "size",
			width: 100,
			headerHozAlign: "center",
			hozAlign: "center",
		},
		{
			title: "Price",
			field: "price",
			width: 100,
			sorter: "number",
			headerHozAlign: "center",
			hozAlign: "center",
		},
		{
			title: "Status",
			field: "status",
			width: 120,
			headerHozAlign: "center",
			hozAlign: "center",
		},
		{
			title: "Notes",
			field: "notes",
			width: 200,
			headerHozAlign: "center",
			hozAlign: "center",
		},
		{
			title: "Action",
			field: "action",
			width: 150,
			formatter: (cell) => {
				// Create a View button and add event listener to call viewOrder
				const button = document.createElement("button");
				button.classList.add(
					"view-btn",
					"text-white",
					"bg-orange-500",
					"py-2",
					"px-4",
					"rounded-lg",
					"hover:bg-orange-600",
					"transition-all"
				);
				button.innerText = "View";
				button.onclick = () => viewOrder(cell.getRow().getData().id); // Call viewOrder on button click
				return button;
			},
			headerHozAlign: "center",
			hozAlign: "center",
		},
	];

	const viewOrder = (id) => {
		alert(`Viewing order with ID: ${id}`);
	};

	return (
		<div className="container mx-auto px-20 h-[100vh] py-8">
			<h1 className="text-3xl font-bold mb-6">Order History</h1>

			<ReactTabulator
				data={orders}
				columns={columns}
				layout="fitDataFill"
				options={{
					pagination: "local",
					paginationSize: 5,
					paginationSizeSelector: [5, 10, 20],
					placeholder: "No orders available",
					responsiveLayout: "hide",
					theme: "bootstrap",
				}}
				className="order-history-table w-full rounded-lg shadow-lg border border-gray-200"
			/>
		</div>
	);
};

export default OrderHistory;
