import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RequestHandler from "../../Functions/RequestHandler";

interface Product {
	id: string;
	productName: string;
	productImage: string;
	productImages: [string];
	price: [number];
}

function ProductSection() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);
	const loadAllProducts = async () => {
		setLoading(true);
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				"product/get-all-product",
				{}
			);
			setLoading(false);
			if (data.success === false) {
				alert(JSON.stringify(data));
			} else {
				setProducts(data.products);
			}
		} catch (error) {
			alert(`An error occurred while archiving data. ${error}`);
		}
	};
	useEffect(() => {
		loadAllProducts();
	}, []);

	const handleProductClick = (productId) => {
		navigate(`/product?id=${productId}`);
	};

	return (
		<div className="py-8 px-4 w-4/5 mt-8 mx-auto min-h-[60vh]">
			<h2 className="text-3xl font-bold text-gray-800 mb-6 text-left">
				Our Products
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
				{loading ? (
					<div className="col-span-full flex justify-center items-center">
						<div className="text-orange-500 font-semibold text-lg">
							Loading...
						</div>
					</div>
				) : products.length === 0 ? (
					<div className="col-span-full text-center text-gray-500 text-xl">
						No Products Available
					</div>
				) : (
					products.map((product) => (
						<div
							key={product.id}
							className="bg-white border rounded-lg shadow-lg overflow-hidden"
							onClick={() => handleProductClick(product.id)}
						>
							<img
								src={product.productImages[0]}
								alt={product.productName}
								className="w-full h-64 object-cover"
							/>

							<div className="p-4">
								<h3 className="text-xl font-semibold text-gray-800">
									{product.productName}
								</h3>

								<p className="text-lg font-medium text-gray-600 mt-2">
									₱ {product.price}
								</p>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default ProductSection;
