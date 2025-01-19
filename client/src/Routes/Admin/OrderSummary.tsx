import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import RequestHandler from "../../Functions/RequestHandler";

function OrderSummary() {
	const navigate = useNavigate();
	const location = useLocation();
	const { orders } = location.state || {};

	const [user, setUser] = useState<any | null>(null);
	useEffect(() => {
		const userDetails = JSON.parse(localStorage.getItem("user") ?? "{}");
		setUser(userDetails);
	}, []);

	const [items, setItems] = useState<any>(orders);
	const calculateSubtotal = () =>
		items.reduce(
			(total, item) => total + item.Product.price * item.quantity,
			0
		);
	const subtotal = calculateSubtotal();
	const total = subtotal;

	const createPaymentSession = async (isDown = false) => {
		try {
			const response = await RequestHandler.handleRequest(
				"post",
				"create-payment",
				{
					amount: calculateSubtotal(),
					userId: user?.id,
					orders,
					isDownpayment: isDown,
				}
			);
			if (response.redirectUrl) {
				window.location.href = response.redirectUrl;
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
		await createPaymentSession(false);
	};

	const handleNoteChange = (id: string, value: string) => {
		const updatedItems = items.map((item) =>
			item.id === id ? { ...item, note: value } : item
		);
		setItems(updatedItems);
	};
	const handleDownPayment = async () => {
		await createPaymentSession(true);
	};

	const viewDesign = (id: string) => {
		alert(`Viewing design for Product ID: ${id}`);
	};

	return (
		<div className="container mx-auto px-4 py-8 min-h-[80vh]">
			<h1 className="text-3xl font-bold mb-2 text-gray-800 lg:px-20 text-orange-500">
				Order Summary
			</h1>

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
							<img
								src={item.Product.productImages[0]}
								alt={item.Product.productName}
								className="w-24 h-24 object-cover rounded-lg"
							/>
							<div className="flex-1 ml-0 md:ml-4 mt-4 md:mt-0">
								<h3 className="text-lg font-semibold">
									{item.Product.productName.slice(0, 25) +
										"..."}
								</h3>
								<div className="mt-2">
									{item.Product.size.map((size, index) => (
										<div key={size}>
											<p className="text-gray-500">
												{size} :{" "}
												{item.quantityPerSize[index]}
											</p>
										</div>
									))}
								</div>

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

								{/* {item.Product.isCustomizable && (
									<Link
										to={{
											pathname: `/view-design`,
										}}
										state={{ order: item, orders }}
										className="mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
									>
										View Design
									</Link>
								)} */}
							</div>
							<p className="text-lg font-medium mt-4 md:mt-0">
								₱
								{(item.Product.price * item.quantity).toFixed(
									2
								)}
							</p>
						</div>
					))}

					<div className="border-t pt-4">
						<div className="flex justify-between text-lg font-semibold mb-2">
							<span>Subtotal:</span>
							<span>₱{subtotal.toFixed(2)}</span>
						</div>
						<hr className="my-2" />
						<div className="flex justify-between text-xl font-bold">
							<span>Total:</span>
							<span>₱{total.toFixed(2)}</span>
						</div>
					</div>
				</div>

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
								<button
									onClick={handleDownPayment}
									className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200"
								>
									Pay 50% Downpayment
								</button>
							</div>

							<div className="mt-6 bg-gray-100 p-4 rounded-lg text-gray-700 text-sm">
								<h3 className="text-lg font-semibold text-gray-800 mb-2">
									Terms and Conditions
								</h3>
								<p className="mb-2">
									By proceeding with this order, you agree to
									our{" "}
									<strong>
										No Refund or Cancellation Policy
									</strong>
									. All purchases are final, and we are unable
									to process refunds or cancellations once the
									order has been confirmed. Please ensure that
									all details, including address and contact
									information, are accurate before proceeding.
								</p>
								<p className="mb-2">
									For any questions or concerns, please
									contact our support team at{" "}
									<a
										href="mailto:support@721sportswear.com"
										className="text-orange-500 underline"
									>
										support@721sportswear.com
									</a>
									.
								</p>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default OrderSummary;
