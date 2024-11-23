import React, { useEffect, useState } from "react";
import RequestHandler from "../../Functions/RequestHandler";

interface Product {
	id: string;
	productImage: string;
	productName: string;
	price: [number];
	status: string;
	stocks: number;
	size: [string];
	description: string;
	availableColors: [string];
	patterns: [string];
}

const Inventory = () => {
	const [activeTab, setActiveTab] = useState("rawMaterials");
	const [showArchived, setShowArchived] = useState(false);
	const [rawMaterials, setRawMaterials] = useState([
		{
			id: 1,
			name: "Wood",
			quantity: 120,
			price: 10,
			status: "In Stock",
			archived: false,
			imageUrl: "https://via.placeholder.com/100",
		},
		{
			id: 2,
			name: "Metal",
			quantity: 50,
			price: 25,
			status: "Out of Stock",
			archived: false,
			imageUrl: "https://via.placeholder.com/100",
		},
	]);

	const [loading, setLoading] = useState(false);
	const [finishedProducts, setProducts] = useState<Product[]>([]);
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

	const [showModal, setShowModal] = useState(false);
	const [isAddModal, setIsAddModal] = useState(false);

	const [currentProduct, setCurrentProduct] = useState<Product>();
	const [image, setImage] = useState<Blob>();
	const [imageShowcase, setImageShowcase] = useState<string | null>(null);

	const handleTabClick = (tab) => {
		setActiveTab(tab);
	};

	const toggleArchivedFilter = () => {
		setShowArchived(!showArchived);
	};

	const archiveProduct = (id) => {
		if (activeTab === "rawMaterials") {
			setRawMaterials(
				rawMaterials.map((item) =>
					item.id === id ? { ...item, archived: true } : item
				)
			);
		} else {
			setProducts(
				finishedProducts.map((item) =>
					item.id === id ? { ...item, archived: true } : item
				)
			);
		}
	};

	// const addProduct = (product) => {
	// 	if (activeTab === "rawMaterials") {
	// 		setRawMaterials([...rawMaterials, product]);
	// 	} else {
	// 		setFinishedProducts([...finishedProducts, product]);
	// 	}
	// 	setShowModal(false); // Close modal after adding product
	// };

	// const editProduct = (product) => {
	// 	if (activeTab === "rawMaterials") {
	// 		setRawMaterials(
	// 			rawMaterials.map((item) =>
	// 				item.id === product.id ? product : item
	// 			)
	// 		);
	// 	} else {
	// 		setFinishedProducts(
	// 			finishedProducts.map((item) =>
	// 				item.id === product.id ? product : item
	// 			)
	// 		);
	// 	}
	// 	setShowModal(false); // Close modal after editing product
	// };

	const filterProducts = (products) => {
		return products.filter((item) =>
			showArchived ? item.archived : !item.archived
		);
	};

	const openModalForAdd = () => {
		// setCurrentProduct({
		// 	id: Date.now(),
		// 	name: "",
		// 	quantity: 0,
		// 	price: 0,
		// 	status: "In Stock",
		// 	archived: false,
		// 	imageUrl: "",
		// });
		// setImage(null);
		// setShowModal(true);
	};

	const openModalForEdit = (product: Product) => {
		setCurrentProduct(product);
		setImageShowcase(product.productImage);
		setIsAddModal(false);
		setShowModal(true);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImage(file);
			// const reader = new FileReader();
			// reader.onloadend = () => {
			// 	setImage(reader.result);
			// };
			// reader.readAsDataURL(file);
		}
	};

	const handleInputChange = (e) => {
		// setCurrentProduct({
		// 	...currentProduct,
		// 	[e.target.name]: e.target.value,
		// });
	};

	return (
		<div className="w-3/4 bg-white p-8 overflow-y-auto">
			<h1 className="text-2xl font-semibold text-gray-700 mb-6">
				Inventory
			</h1>

			<div className="flex space-x-6 mb-6">
				<button
					className={`py-2 px-4 rounded-lg ${
						activeTab === "rawMaterials"
							? "bg-orange-500 text-white"
							: "bg-gray-200 text-gray-600"
					}`}
					onClick={() => handleTabClick("rawMaterials")}
				>
					Raw Materials
				</button>
				<button
					className={`py-2 px-4 rounded-lg ${
						activeTab === "finishedProducts"
							? "bg-orange-500 text-white"
							: "bg-gray-200 text-gray-600"
					}`}
					onClick={() => handleTabClick("finishedProducts")}
				>
					Finished Products
				</button>
			</div>

			<div className="flex items-center mb-4">
				<input
					type="checkbox"
					checked={showArchived}
					onChange={toggleArchivedFilter}
					className="mr-2"
				/>
				<span className="text-gray-700">Show Archived</span>
			</div>

			<button
				onClick={openModalForAdd}
				className="bg-green-500 text-white py-2 px-4 rounded-lg mb-4"
			>
				Add{" "}
				{activeTab === "rawMaterials"
					? "Raw Material"
					: "Finished Product"}
			</button>

			{/* Product Table */}
			<table className="min-w-full table-auto border-collapse">
				<thead>
					{activeTab === "rawMaterials" ? (
						<tr>
							<th className="px-4 py-2 text-left border-b">ID</th>
							<th className="px-4 py-2 text-left border-b">
								Name
							</th>
							<th className="px-4 py-2 text-left border-b">
								Image
							</th>
							<th className="px-4 py-2 text-left border-b">
								Quantity
							</th>
							<th className="px-4 py-2 text-left border-b">
								Price
							</th>
							<th className="px-4 py-2 text-left border-b">
								Status
							</th>
							<th className="px-4 py-2 text-left border-b">
								Actions
							</th>
						</tr>
					) : (
						<tr>
							<th className="px-4 py-2 text-left border-b">ID</th>
							<th className="px-4 py-2 text-left border-b">
								Name
							</th>
							<th className="px-4 py-2 text-left border-b">
								Image
							</th>
							<th className="px-4 py-2 text-left border-b">
								Quantity
							</th>
							<th className="px-4 py-2 text-left border-b">
								Price
							</th>
							<th className="px-4 py-2 text-left border-b">
								Status
							</th>
							<th className="px-4 py-2 text-left border-b">
								Customizable
							</th>
							<th className="px-4 py-2 text-left border-b">
								Actions
							</th>
						</tr>
					)}
				</thead>
				<tbody>
					{activeTab === "rawMaterials"
						? filterProducts(rawMaterials).map((item) => (
								<tr key={item.id}>
									<td className="px-4 py-2 border-b">
										{item.id}
									</td>
									<td className="px-4 py-2 border-b">
										{item.productName}
									</td>
									<td className="px-4 py-2 border-b">
										<img
											src={item.productImage}
											alt={item.productName}
											className="w-16 h-16 object-cover rounded-lg"
										/>
									</td>
									<td className="px-4 py-2 border-b">
										{item.quantity}
									</td>
									<td className="px-4 py-2 border-b">
										${item.price}
									</td>
									<td className="px-4 py-2 border-b">
										{item.status}
									</td>
									{/* isCustomizable */}
									<td className="px-4 py-2 border-b">
										<button
											onClick={() =>
												openModalForEdit(item)
											}
											className="bg-blue-500 text-white py-1 px-4 rounded-lg mr-2"
										>
											Edit
										</button>
										<button
											onClick={() =>
												archiveProduct(item.id)
											}
											className="bg-red-500 text-white py-1 px-4 rounded-lg"
										>
											Archive
										</button>
									</td>
								</tr>
						  ))
						: filterProducts(finishedProducts).map((item) => (
								<tr key={item.id}>
									<td className="px-4 py-2 border-b">
										{item.id}
									</td>
									<td className="px-4 py-2 border-b">
										{item.productName}
									</td>
									<td className="px-4 py-2 border-b">
										<img
											src={item.productImage}
											alt={item.productName}
											className="w-16 h-16 object-cover rounded-lg"
										/>
									</td>
									<td className="px-4 py-2 border-b">
										{item.stocks}
									</td>
									<td className="px-4 py-2 border-b">
										₱ {item.price}
									</td>
									<td className="px-4 py-2 border-b">
										{item.status}
									</td>
									<td className="px-4 py-2 border-b">
										{item.isCustomizable
											? "CUSTOMIZABLE"
											: "UNCUSTOMIZABLE"}
									</td>
									<td className="px-4 py-2 border-b">
										<button
											onClick={() =>
												openModalForEdit(item)
											}
											className="bg-blue-500 text-white py-1 px-4 rounded-lg mr-2"
										>
											Edit
										</button>
										<button
											onClick={() =>
												archiveProduct(item.id)
											}
											className="bg-red-500 text-white py-1 px-4 rounded-lg"
										>
											Archive
										</button>
									</td>
								</tr>
						  ))}
				</tbody>
			</table>

			{/* Modal for Adding / Editing Product */}
			{showModal && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
					<div className="bg-white p-6 rounded-lg w-[400px] max-w-[100%]">
						<h2 className="text-xl font-semibold mb-4">
							{!isAddModal ? "Edit Product" : "Add Product"}
						</h2>
						<div>
							<label className="block text-gray-600 mb-2">
								Name
							</label>
							<input
								type="text"
								name="name"
								value={currentProduct?.productName}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-lg mb-4"
								placeholder="Product Name"
							/>
							<label className="block text-gray-600 mb-2">
								Quantity
							</label>
							<input
								type="number"
								name="quantity"
								value={currentProduct?.stocks}
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-lg mb-4"
								placeholder="Quantity"
							/>
							<label className="block text-gray-600 mb-2">
								Price
							</label>
							<input
								type="number"
								name="price"
								onChange={handleInputChange}
								className="w-full p-2 border border-gray-300 rounded-lg mb-4"
								placeholder="Price"
							/>
							<label className="block text-gray-600 mb-2">
								Image
							</label>
							<input
								type="file"
								onChange={handleImageChange}
								className="w-full p-2 border border-gray-300 rounded-lg mb-4"
							/>
							{(image || imageShowcase) && (
								<div className="mb-4">
									<img
										src={
											imageShowcase
												? imageShowcase
												: image
												? URL.createObjectURL(image)
												: ""
										}
										alt="Preview"
										className="w-24 h-24 object-cover rounded-lg"
									/>
								</div>
							)}
						</div>

						<div className="flex justify-between mt-4">
							<button
								onClick={() => setShowModal(false)}
								className="bg-gray-500 text-white py-2 px-4 rounded-lg"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									// currentProduct?.id
									// 	? editProduct(currentProduct)
									// 	: addProduct({
									// 			...currentProduct,
									// 			imageUrl:
									// 				image ||
									// 				"https://via.placeholder.com/100",
									// 	  });
								}}
								className="bg-blue-500 text-white py-2 px-4 rounded-lg"
							>
								{currentProduct?.id
									? "Save Changes"
									: "Add Product"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Inventory;
