import React, { useState, useEffect } from "react";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

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
	};
}

const ShoppingCart: React.FC = () => {
	interface User {
		id: string;
	}
	const [orders, setOrders] = useState<CartItem[]>([]);
	const [user, setUser] = useState<User | null>(null);

	const loadAllCartProduct = async () => {
		if (!user || Object.keys(user).length === 0) {
			// toast.error("Please login to get cart products.");
			return;
		}
		const toastId = toast.loading("Loading all cart products.", {
			position: "top-center",
		});
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/get-all-cart",
				{
					userId: user?.id,
				}
			);
			if (data.success) {
				setOrders(data.orders);
				toast.update(toastId, {
					render: "Successfully load all cart products.",
					type: "success",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
			} else {
				toast.update(toastId, {
					render: data.message,
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
				return;
			}
		} catch (error) {
			toast.update(toastId, {
				render: "Error loading all cart products.",
				type: "error",
				isLoading: false,
				autoClose: 3000,
				position: "top-center",
			});
			return;
		}
	};

	useEffect(() => {
		const userDetails = JSON.parse(localStorage.getItem("user") ?? "{}");
		setUser(userDetails);
	}, []);

	useEffect(() => {
		loadAllCartProduct();
	}, [user]);

	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 3; // Number of items per page

	const removeItem = (id: number) => {
		// setCartItems(cartItems.filter((item) => item.id !== id));
	};

	const updateQuantity = (id, quantity: number) => {
		// setCartItems(
		// 	cartItems.map((item) =>
		// 		item.id === id ? { ...item, quantity } : item
		// 	)
		// );
	};

	const updateSize = (id, size: string) => {
		// setCartItems(
		// 	cartItems.map((item) => (item.id === id ? { ...item, size } : item))
		// );
	};

	const updateNotes = (id, notes: string) => {
		// setCartItems(
		// 	cartItems.map((item) =>
		// 		item.id === id ? { ...item, notes } : item
		// 	)
		// );
	};

	const calculateTotal = () => {
		return orders
			.filter((item) => selectedItems.includes(item.id))
			.reduce(
				(total, item) => total + item.Product.price * item.quantity,
				0
			);
	};

	const deleteAllSelected = () => {
		// setCartItems(
		// 	cartItems.filter((item) => !selectedItems.includes(item.id))
		// );
		// setSelectedItems([]);
	};

	const checkoutAllSelected = () => {
		// Placeholder for checkout logic
		alert("Proceeding to checkout with all selected items.");
		// OrderSummary()
	};

	const toggleSelectItem = (id) => {
		setSelectedItems((prevSelectedItems) =>
			prevSelectedItems.includes(id)
				? prevSelectedItems.filter((itemId) => itemId !== id)
				: [...prevSelectedItems, id]
		);
	};

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(orders.length / itemsPerPage);
	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

	return (
		<div className="min-h-screen pt-10 pb-28">
			<div className="flex justify-between w-4/5 sm:w-4/5 md:w-4/5 lg:w-4/5 xl:w-4/5 mx-auto">
				<div className="w-full lg:w-3/5 lg:me-8">
					<h3 className="text-xl sm:text-2xl font-semibold mb-4 ">
						Your Cart
					</h3>
					<hr />
					<div className="space-y-4">
						{currentItems.map((item) => (
							<div
								key={item.id}
								className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-200"
							>
								<div className="flex items-center space-x-2 mb-4 sm:mb-0 me-0 sm:me-8">
									<input
										type="checkbox"
										checked={selectedItems.includes(
											item.id
										)}
										onChange={() =>
											toggleSelectItem(item.id)
										}
										className="w-5 h-5"
									/>
								</div>

								{/* Product Image */}
								<div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden mb-4 sm:mb-0">
									<img
										src={item.Product.productImage}
										alt={item.Product.productName}
										className="w-full h-full object-cover"
									/>
								</div>

								{/* Product Details */}
								<div className="flex-grow mb-4 sm:mb-0 sm:ml-4">
									<h3 className="text-lg font-semibold">
										{item.Product.productName +
											(item.customization.customName !==
											""
												? " (" +
												  item.customization
														.customName +
												  (item.customization
														.customNumber !== ""
														? " | " +
														  item.customization
																.customNumber
														: "") +
												  ")"
												: "")}
									</h3>
									<p className="text-gray-500">
										Price: ₱{item.Product.price}
									</p>
									<div className="mt-2">
										<select
											id={`size-${item.id}`}
											value={
												item.customization.selectedSize
											}
											onChange={(e) =>
												updateSize(
													item.id,
													e.target.value
												)
											}
											className="w-full sm:w-24 p-2 border border-gray-300 rounded-md"
										>
											{item.Product.size.map((value) => (
												<option
													value={value}
													key={value}
												>
													{value}
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Notes */}
								<div className="w-full sm:w-auto mb-4 sm:mb-0 sm:me-8">
									<label
										className="text-sm text-gray-600 block mb-1"
										htmlFor={`notes-${item.id}`}
									>
										Notes:
									</label>
									<textarea
										id={`notes-${item.id}`}
										value={item.customization.notes}
										onChange={(e) =>
											updateNotes(item.id, e.target.value)
										}
										className="w-full p-2 border border-gray-300 rounded-md resize-none"
										rows={3}
									/>
								</div>

								{/* Quantity and Edit Button */}
								<div className="flex items-center space-x-2">
									<input
										type="number"
										value={item.quantity}
										min="1"
										onChange={(e) =>
											updateQuantity(
												item.id,
												parseInt(e.target.value)
											)
										}
										className="w-16 p-2 border border-gray-300 rounded-md"
									/>
									{/* <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
										Edit
									</button> */}
									<Link
										to={{
											pathname: `/edit`,
										}}
										state={{ order: item }}
										className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
									>
										Edit
									</Link>
								</div>
							</div>
						))}
					</div>

					<div className="flex justify-center mt-6">
						<button
							onClick={() => paginate(currentPage - 1)}
							disabled={currentPage === 1}
							className="px-4 py-2 bg-gray-300 text-black rounded-md mr-2 disabled:opacity-50"
						>
							Previous
						</button>
						<span className="px-4 py-2 text-black">
							Page {currentPage} of {totalPages}
						</span>
						<button
							onClick={() => paginate(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="px-4 py-2 bg-gray-300 text-black rounded-md ml-2 disabled:opacity-50"
						>
							Next
						</button>
					</div>
				</div>

				<div className="w-2/5 pl-10 ms-5 bg-white p-8 rounded-lg shadow-lg h-full hidden lg:block">
					<h2 className="text-3xl font-bold text-orange-500 mb-6">
						Checkout Information
					</h2>
					<div className="text-sm text-gray-700 mb-6">
						<p>
							<strong>Delivery handled by the customer</strong>
						</p>
						<p>3-7 Days before delivery</p>
					</div>

					<div className="mt-6 flex justify-between items-center font-semibold">
						<span>Total:</span>
						<span>₱{calculateTotal()}</span>
					</div>
					<div className="mt-6 flex flex-col space-y-4">
						<button
							onClick={deleteAllSelected}
							className="bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 transition duration-200"
						>
							Delete All Selected
						</button>
						{/* <button
							onClick={checkoutAllSelected}
							className="bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition duration-200"
						>
							Checkout All Selected
						</button> */}
						<Link
							to={{
								pathname: `/order-summary`,
							}}
							state={{
								orders: orders.filter((item) =>
									selectedItems.includes(item.id)
								),
							}}
							className="text-center bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition duration-200"
						>
							Checkout All Selected
						</Link>
					</div>
				</div>
			</div>

			<div className="fixed bottom-0 left-0 right-0 bg-orange-500 py-4 shadow-lg shadow-t">
				<div className="w-4/5 mx-auto flex justify-between items-center">
					<span className="text-xl font-semibold text-white">
						Total: ₱{calculateTotal()}
					</span>
					<button
						onClick={checkoutAllSelected}
						className="bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition duration-200 w-36"
					>
						Checkout All Selected
					</button>
				</div>
			</div>
		</div>
	);
};

export default ShoppingCart;
