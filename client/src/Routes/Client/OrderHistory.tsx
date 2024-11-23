import React, { useState } from "react";

const OrderHistory = () => {
	const [orders, setOrders] = useState([
		{
			id: 1,
			customerName: "John Doe",
			orderDate: "2024-11-10",
			status: "Shipped",
			totalPrice: 200,
			items: [
				{ name: "Table", quantity: 1, price: 100 },
				{ name: "Chair", quantity: 2, price: 50 },
			],
		},
		{
			id: 2,
			customerName: "Jane Smith",
			orderDate: "2024-11-12",
			status: "Pending",
			totalPrice: 150,
			items: [{ name: "Sofa", quantity: 1, price: 150 }],
		},
	]);
	interface Order {
		id: string;
		customerName: string;
		orderDate: string;
		totalPrice: number;
		status: string;
		items: [
			{
				name: string;
				quantity: number;
				price: number;
			}
		];
	}
	const [showModal, setShowModal] = useState(false);
	const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
	const [filterStatus, setFilterStatus] = useState("");
	const [filterDate, setFilterDate] = useState("");

	const handleViewOrder = (order) => {
		setCurrentOrder(order);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const filteredOrders = orders.filter((order) => {
		return (
			(!filterStatus || order.status === filterStatus) &&
			(!filterDate || order.orderDate === filterDate)
		);
	});

	return (
		<div className="w-3/4 bg-white p-8 overflow-y-auto">
			<h1 className="text-2xl font-semibold text-gray-700 mb-6">
				Order History
			</h1>

			{/* Filter Section */}
			<div className="flex mb-6">
				<select
					onChange={(e) => setFilterStatus(e.target.value)}
					className="p-2 border rounded-lg mr-4"
					// placeholder="Filter by status"
				>
					<option value="">All Status</option>
					<option value="Shipped">Shipped</option>
					<option value="Pending">Pending</option>
					<option value="Delivered">Delivered</option>
				</select>
				<input
					type="date"
					onChange={(e) => setFilterDate(e.target.value)}
					className="p-2 border rounded-lg"
					placeholder="Filter by date"
				/>
			</div>

			{/* Table */}
			<table className="min-w-full table-auto border-collapse">
				<thead>
					<tr>
						<th className="px-4 py-2 text-left border-b">
							Order ID
						</th>
						<th className="px-4 py-2 text-left border-b">
							Customer Name
						</th>
						<th className="px-4 py-2 text-left border-b">
							Order Date
						</th>
						<th className="px-4 py-2 text-left border-b">
							Total Price
						</th>
						<th className="px-4 py-2 text-left border-b">Status</th>
						<th className="px-4 py-2 text-left border-b">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{filteredOrders.map((order) => (
						<tr key={order.id}>
							<td className="px-4 py-2 border-b">{order.id}</td>
							<td className="px-4 py-2 border-b">
								{order.customerName}
							</td>
							<td className="px-4 py-2 border-b">
								{order.orderDate}
							</td>
							<td className="px-4 py-2 border-b">
								${order.totalPrice}
							</td>
							<td className="px-4 py-2 border-b">
								{order.status}
							</td>
							<td className="px-4 py-2 border-b">
								<button
									onClick={() => handleViewOrder(order)}
									className="bg-blue-500 text-white py-1 px-4 rounded-lg"
								>
									View
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Modal for View Order Details */}
			{showModal && currentOrder && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
					<div className="bg-white p-6 rounded-lg w-96">
						<h2 className="text-xl font-semibold mb-4">
							Order #{currentOrder.id} Details
						</h2>
						<div>
							<p className="mb-2">
								<strong>Customer Name:</strong>{" "}
								{currentOrder.customerName}
							</p>
							<p className="mb-2">
								<strong>Order Date:</strong>{" "}
								{currentOrder.orderDate}
							</p>
							<p className="mb-2">
								<strong>Total Price:</strong> $
								{currentOrder.totalPrice}
							</p>
							<p className="mb-4">
								<strong>Status:</strong> {currentOrder.status}
							</p>
							<h3 className="font-semibold mb-2">Items:</h3>
							<ul className="list-disc pl-5">
								{currentOrder.items.map((item, index) => (
									<li key={index} className="mb-1">
										{item.name} (x{item.quantity}) - $
										{item.price}
									</li>
								))}
							</ul>
						</div>
						<div className="flex justify-between mt-4">
							<button
								onClick={handleCloseModal}
								className="bg-gray-500 text-white py-2 px-4 rounded-lg"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrderHistory;
