import React, { useState } from "react";
import RequestHandler from "../Functions/RequestHandler";
import { toast } from "react-toastify";

type OriginalType = {
	id?: number | string;
	productName?: string;
	productImages?: string[];
	productAllNames?: string[];
	price?: number;
	size?: string[];
	stocks?: number;
	description?: string;
	isCustomizable?: boolean;
};
type AddProductModalProps = {
	original?: OriginalType | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: () => void;
};

const AddProductModal = ({
	original = null,
	isOpen,
	onClose,
	onSave,
}: AddProductModalProps) => {
	const [id, setId] = useState(original?.id || null);
	const [productName, setProductName] = useState(original?.productName || "");
	const [productImages, setProductImages] = useState(
		original?.productImages || [""]
	);
	const [productAllNames, setProductAllNames] = useState(
		original?.productAllNames || [""]
	);
	const [price, setPrice] = useState(original?.price || 0);
	const [size, setSize] = useState(original?.size || ["S", "M", "L", "XL"]);
	const [stocks, setStocks] = useState(original?.stocks || 0);
	const [description, setDescription] = useState(original?.description || "");
	const [isCustomizable, setIsCustomizable] = useState(
		original?.isCustomizable || false
	);

	const handleAddToList = (setter, list) => setter([...list, ""]);
	const handleRemoveFromList = (setter, list, index) => {
		const updatedList = list.filter((_, i) => i !== index);
		setter(updatedList);
	};
	const handleListChange = (setter, list, index, value) => {
		const updatedList = [...list];
		updatedList[index] = value;
		setter(updatedList);
	};

	const handleSave = async () => {
		let imageUrls: any = [];

		const uploadImagePromises = productImages.map(async (image) => {
			const formData = new FormData();
			formData.append("file", image);

			try {
				const imageUploadData: any = await RequestHandler.handleRequest(
					"post",
					"file/upload-image",
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);
				if (imageUploadData.success) {
					imageUrls.push(imageUploadData.uploadedDocument);
				} else {
					toast.error(
						imageUploadData.message || "Image upload failed"
					);
					throw new Error("Image upload failed");
				}
			} catch (error) {
				console.error("Error uploading the image:", error);
				toast.error("Error uploading one or more images.");
				throw error;
			}
		});

		try {
			await Promise.all(uploadImagePromises);
			const newProduct = {
				id,
				productName,
				productImages: imageUrls,
				productAllNames,
				price,
				size,
				stocks,
				description,
				isCustomizable,
			};
			const data = await RequestHandler.handleRequest(
				"post",
				"product/add-product",
				newProduct
			);
			if (!data.success) {
				alert(JSON.stringify(data));
			} else {
				onSave();
				toast.success("Product saved successfully!");
			}
		} catch (error) {
			toast.error("An error occurred while saving the product.");
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
				<h2 className="text-2xl font-semibold mb-4">
					{id ? "Edit Product" : "Add New Product"}
				</h2>
				<div className="space-y-4">
					{/* Product Name */}
					<div>
						<label
							htmlFor="productName"
							className="block text-sm font-medium text-gray-700"
						>
							Product Name
						</label>
						<input
							type="text"
							id="productName"
							value={productName}
							onChange={(e) => setProductName(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Enter product name"
						/>
					</div>

					{/* Product Images */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Product Images
						</label>
						{productImages.map((image, index) => (
							<div
								key={index}
								className="flex items-center space-x-2 mt-1"
							>
								<input
									type="file"
									accept="image/*"
									onChange={(e) =>
										handleListChange(
											setProductImages,
											productImages,
											index,
											e.target.files[0]
										)
									}
									className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
								<button
									onClick={() =>
										handleRemoveFromList(
											setProductImages,
											productImages,
											index
										)
									}
									className="text-red-600 hover:text-red-800"
								>
									Remove
								</button>
							</div>
						))}
						<button
							onClick={() =>
								handleAddToList(setProductImages, productImages)
							}
							className="mt-2 text-indigo-600 hover:text-indigo-800"
						>
							Add Image
						</button>
					</div>

					{/* Product Names */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							All Names
						</label>
						{productAllNames.map((name, index) => (
							<div
								key={index}
								className="flex items-center space-x-2 mt-1"
							>
								<input
									type="text"
									value={name}
									onChange={(e) =>
										handleListChange(
											setProductAllNames,
											productAllNames,
											index,
											e.target.value
										)
									}
									className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
									placeholder="Enter alternative name"
								/>
								<button
									onClick={() =>
										handleRemoveFromList(
											setProductAllNames,
											productAllNames,
											index
										)
									}
									className="text-red-600 hover:text-red-800"
								>
									Remove
								</button>
							</div>
						))}
						<button
							onClick={() =>
								handleAddToList(
									setProductAllNames,
									productAllNames
								)
							}
							className="mt-2 text-indigo-600 hover:text-indigo-800"
						>
							Add Name
						</button>
					</div>

					{/* Price */}
					<div>
						<label
							htmlFor="price"
							className="block text-sm font-medium text-gray-700"
						>
							Price
						</label>
						<input
							type="number"
							id="price"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Enter product price"
						/>
					</div>

					{/* Size */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Available Sizes
						</label>
						{size.map((s, index) => (
							<div
								key={index}
								className="flex items-center space-x-2 mt-1"
							>
								<input
									type="text"
									value={s}
									onChange={(e) =>
										handleListChange(
											setSize,
											size,
											index,
											e.target.value
										)
									}
									className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
									placeholder="Enter size"
								/>
								<button
									onClick={() =>
										handleRemoveFromList(
											setSize,
											size,
											index
										)
									}
									className="text-red-600 hover:text-red-800"
								>
									Remove
								</button>
							</div>
						))}
						<button
							onClick={() => handleAddToList(setSize, size)}
							className="mt-2 text-indigo-600 hover:text-indigo-800"
						>
							Add Size
						</button>
					</div>

					{/* Stocks */}
					<div>
						<label
							htmlFor="stocks"
							className="block text-sm font-medium text-gray-700"
						>
							Stocks
						</label>
						<input
							type="number"
							id="stocks"
							value={stocks}
							onChange={(e) => setStocks(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Enter stock quantity"
						/>
					</div>

					{/* Description */}
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700"
						>
							Description
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Enter product description"
						/>
					</div>

					{/* Customizable */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="isCustomizable"
							checked={isCustomizable}
							onChange={(e) =>
								setIsCustomizable(e.target.checked)
							}
							className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
						/>
						<label
							htmlFor="isCustomizable"
							className="ml-2 text-sm text-gray-700"
						>
							Customizable
						</label>
					</div>

					{/* Buttons */}
					<div className="flex justify-end space-x-4 mt-4">
						<button
							onClick={onClose}
							className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
						>
							Cancel
						</button>
						<button
							onClick={handleSave}
							className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddProductModal;
