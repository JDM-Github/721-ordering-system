import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";

interface Product {
	id: string;
	productImage: string;
	productName: string;
	price: [number];
	status: string;
	stocks: number;
	size: [string];
	description: string;
	isCustomizable: boolean;
}

const ProductView: React.FC = () => {
	interface User {
		id: string;
	}
	const [user, setUser] = useState<User | null>(null);
	useEffect(() => {
		const userDetails = JSON.parse(localStorage.getItem("user") ?? "{}");
		setUser(userDetails);
	}, []);

	const location = useLocation();
	const navigate = useNavigate();
	const [selectedSize, setSelectedSize] = useState<string>();
	const [quantity, setQuantity] = useState<number>(1);

	const [loading, setLoading] = useState(false);
	const [product, setProduct] = useState<Product | null>(null);

	const queryParams = new URLSearchParams(location.search);
	const productId = queryParams.get("id");
	const loadAllProducts = async () => {
		setLoading(true);
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				`product/get-product?id=${productId}`,
				{}
			);
			setLoading(false);
			if (data.success === false) {
				alert(JSON.stringify(data));
			} else {
				setProduct(data.product);
			}
		} catch (error) {
			alert(`An error occurred while archiving data. ${error}`);
		}
	};
	useEffect(() => {
		loadAllProducts();
	}, []);

	const handleSizeChange = (size: string) => {
		setSelectedSize(size);
	};

	const handleQuantityChange = (value: number) => {
		if (product)
			if (value >= 1 && value <= product.stocks) {
				setQuantity(value);
			}
	};

	const handleAddToCart = async () => {
		if (!user || Object.keys(user).length === 0) {
			toast.error("Please log in to save your order.");
			return;
		}
		if (!product) {
			toast.error("Invalid Product.");
		}

		if (!selectedSize) {
			toast.error("Please select a size before adding to cart.");
			return;
		}

		const toastId = toast.loading("Adding customize product to cart...");
		const customization = {
			id: "",
			color: "",
			pattern: "",
			customName: "",
			customNumber: "",
			notes: "",
			selectedSize,
			product,
			logoPosition: { x: 0, y: 0 },
			logoPositionPixel: { x: 0, y: 0 },
			logo: "",
		};

		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/add-to-cart",
				{
					userId: user.id,
					productId: product?.id,
					customization,
					quantity,
				}
			);

			if (data.success) {
				navigate("/cart");
				toast.update(toastId, {
					render: "Product Order added successfully!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
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
			console.error("Error submitting the adding product order:", error);
			toast.update(toastId, {
				render: "Error submitting the adding product order.",
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
			return;
		}
	};
	const handleCustomize = () => navigate(`/customize?id=${productId}`);

	return (
		<div className="bg-gray-50 flex justify-center items-center py-16 px-4">
			{loading ? (
				<div className="col-span-full flex justify-center items-center min-h-[80vh]">
					<div className="text-orange-500 font-semibold text-lg">
						Loading...
					</div>
				</div>
			) : product === null ? (
				<div className="col-span-full text-center text-gray-500 text-xl min-h-[80vh]">
					Invalid Product
				</div>
			) : (
				<div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12">
					<div className="flex justify-center items-center">
						<img
							src={
								product?.productImage
								// product?.productImage != ""
								// 	? product?.productImage
								// 	: "https://via.placeholder.com/200x200/33FF57/FFFFFF?text=Product+"
							}
							alt={product?.productName}
							className="w-full h-full max-h-96 object-cover rounded-lg"
						/>
					</div>

					<div className="flex flex-col justify-between">
						<div>
							<h1 className="text-4xl font-bold text-orange-500 mb-6">
								{product?.productName}
							</h1>
							<hr className="my-5" />

							<div className="flex items-center space-x-4 mb-6">
								<span
									className={`px-4 py-1 text-sm font-semibold rounded-full ${
										product?.status === "Available"
											? "bg-green-100 text-green-600"
											: "bg-red-100 text-red-600"
									}`}
								>
									{product?.status}
								</span>
								<p className="text-gray-600">
									Stock:{" "}
									{product && (
										<span
											className={`font-semibold ${
												product.stocks > 0
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{product.stocks} left
										</span>
									)}
								</p>
							</div>

							<div className="mb-8">
								<h3 className="text-xl font-semibold text-gray-700 mb-3">
									Available Sizes
								</h3>
								<div className="flex space-x-2">
									{product &&
										product.size.map((size) => (
											<button
												key={size}
												onClick={() =>
													handleSizeChange(size)
												}
												className={`px-4 py-2 rounded-lg border ${
													selectedSize === size
														? "bg-orange-500 text-white border-orange-500"
														: "bg-white text-gray-800 border-gray-300 hover:border-orange-500"
												} transition duration-200`}
											>
												{size}
											</button>
										))}
								</div>
							</div>

							<div className="mb-8">
								<h3 className="text-xl font-semibold text-gray-700 mb-3">
									Description
								</h3>
								<p className="text-gray-600">
									{product?.description}
								</p>
							</div>

							<div className="mb-8">
								<h3 className="text-xl font-semibold text-gray-700 mb-3">
									Select Quantity
								</h3>
								<div className="flex items-center space-x-4">
									<input
										type="number"
										value={quantity}
										min="1"
										max={product?.stocks}
										onChange={(e) =>
											handleQuantityChange(
												parseInt(e.target.value)
											)
										}
										className="w-20 p-2 border border-gray-300 rounded-lg"
									/>
									<p className="text-sm text-gray-500">
										Max: {product?.stocks}
									</p>
								</div>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
							{product.isCustomizable && (
								<button
									onClick={handleCustomize}
									className="w-full sm:w-1/2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
								>
									Customize Your Own
								</button>
							)}
							<button
								onClick={handleAddToCart}
								className="w-full sm:w-1/2 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
							>
								Add to Cart
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductView;
