import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import RequestHandler from "../../Functions/RequestHandler";

interface CartItem {
	id: string;
	productId: string;
	quantity: number;
	customization: {
		id: string;
		color: string;
		pattern: string;
		customName: string;
		customNumber: string;
		notes: string;
		selectedSize: string;
		logoPosition: { x: number; y: number };
		logoPositionPixel: { x: number; y: number };
		logo: string;
	};
	Product: {
		productImage: string;
		productName: string;
		price: number;
		size: [string];
		stocks: number;
		description: string;
		status: string;
		patterns: [string];
		availableColors: [string];
		isCustomizable: boolean;
	};
}

function OrderSummary() {
	const navigate = useNavigate();
	const location = useLocation();
	const { orders } = location.state || {};

	interface User {
		id: string;
		address: string;
		contactNumber: string;
		email: string;
	}
	const [user, setUser] = useState<User | null>(null);
	useEffect(() => {
		const userDetails = JSON.parse(localStorage.getItem("user") ?? "{}");
		setUser(userDetails);
	}, []);

	const [items, setItems] = useState<CartItem[]>(orders);
	const calculateSubtotal = () =>
		items.reduce(
			(total, item) => total + item.Product.price * item.quantity,
			0
		);
	const subtotal = calculateSubtotal();
	const total = subtotal;

	const createPaymentSession = async () => {
		try {
			const response = await RequestHandler.handleRequest(
				"post",
				"create-payment",
				{
					amount: calculateSubtotal(),
					userId: user?.id,
					orders,
				}
			);
			if (response.redirectUrl) {
				window.open(response.redirectUrl, "_blank");
				navigate("/");
			} else {
				console.error("Payment URL not found.");
				toast.error("Failed	to get the payment link.");
			}
		} catch (error) {
			console.error("Error creating payment session:", error);
			toast.error("Failed	to create payment session.");
		}
	};

	const handleCheckout = async () => {
		await createPaymentSession();
	};

	const handleNoteChange = (id: string, value: string) => {
		const updatedItems = items.map((item) =>
			item.id === id ? { ...item, note: value } : item
		);
		setItems(updatedItems);
	};

	const viewDesign = (id: string) => {
		alert(`Viewing design for Product ID: ${id}`);
	};

	return (
		<div className="container mx-auto px-4 py-8 min-h-[80vh]">
			<h1 className="text-3xl font-bold mb-2 text-gray-800 lg:px-20 text-orange-500">
				Order Summary
			</h1>
			{/* <hr /> */}

			{/* Order Items Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:px-20">
				{/* Order Details */}
				<div className="bg-white rounded-lg shadow-lg p-6 w-full">
					<h2 className="text-2xl font-semibold mb-4">
						Items in Your Order
					</h2>

					{items.map((item) => (
						<div
							key={item.id}
							className="flex flex-col md:flex-row justify-between items-start border-b pb-4 mb-4"
						>
							{/* Product Image */}
							<img
								src={item.Product.productImages[0]}
								alt={item.Product.productName}
								className="w-24 h-24 object-cover rounded-lg"
							/>
							{/* Product Details */}
							<div className="flex-1 ml-0 md:ml-4 mt-4 md:mt-0">
								<h3 className="text-lg font-semibold">
									{item.Product.productName.slice(0, 25) +
										"..."}
								</h3>
								<p className="text-gray-500">
									Size: {item.customization.selectedSize}
								</p>
								<p className="text-gray-500">
									Quantity: {item.quantity}
								</p>

								{/* Notes Section */}
								<div className="mt-2">
									<label
										htmlFor={`note-${item.id}`}
										className="text-sm text-gray-600"
									>
										Note:
									</label>
									<textarea
										id={`note-${item.id}`}
										value={item.customization.notes}
										onChange={(e) =>
											handleNoteChange(
												item.id,
												e.target.value
											)
										}
										className="w-full p-2 mt-1 border border-gray-300 rounded-md resize-none mb-2"
										rows={2}
										placeholder="Add any additional notes here..."
									/>
								</div>

								{/* View Design Button */}
								{item.Product.isCustomizable && (
									<Link
										to={{
											pathname: `/view-design`,
										}}
										state={{ order: item, orders }}
										className="mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
									>
										View Design
									</Link>
								)}
							</div>
							{/* Product Price */}
							<p className="text-lg font-medium mt-4 md:mt-0">
								₱
								{(item.Product.price * item.quantity).toFixed(
									2
								)}
							</p>
						</div>
					))}

					{/* Price Summary */}
					<div className="border-t pt-4">
						<div className="flex justify-between text-lg font-semibold mb-2">
							<span>Subtotal:</span>
							<span>₱{subtotal.toFixed(2)}</span>
						</div>
						{/* <div className="flex justify-between text-lg font-semibold mb-2">
							<span>Shipping:</span>
							<span>${shippingCost.toFixed(2)}</span>
						</div> */}
						<hr className="my-2" />
						<div className="flex justify-between text-xl font-bold">
							<span>Total:</span>
							<span>₱{total.toFixed(2)}</span>
						</div>
					</div>
				</div>

				{/* Delivery & Action Section */}

				{user && Object.keys(orders).length !== 0 && (
					<>
						<div className="w-full bg-white rounded-lg shadow-lg p-6 h-auto lg:block self-start">
							<h2 className="text-2xl font-semibold mb-4">
								Delivery Information
							</h2>
							<div className="text-gray-700 mb-4">
								<p className="mb-2">
									<strong>Address:</strong> {user.address}
								</p>
								<p className="mb-2">
									<strong>Contact:</strong>{" "}
									{user.contactNumber}
								</p>
								<p className="mb-2">
									<strong>Email:</strong> {user.email}
								</p>
								<p className="mb-2">
									<strong>Delivery Method:</strong> Standard
									Shipping (3-5 days) Estimated Days
								</p>
							</div>

							<div className="flex flex-col space-y-4">
								<button
									onClick={handleCheckout}
									className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition duration-200"
								>
									Proceed to Checkout
								</button>
								<button
									className="bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-200"
									onClick={() => navigate("/cart")}
								>
									Cancel Order
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default OrderSummary;
