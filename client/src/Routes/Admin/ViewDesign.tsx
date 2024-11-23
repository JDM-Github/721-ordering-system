import React, { useState } from "react";
import RequestHandler from "../../Functions/RequestHandler";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import ProductImageWithLogo from "../../Component/ProductImageWithLogo.tsx";

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

export default function ViewDesign() {
	const location = useLocation();
	const { order, orders } = location.state || {};
	const navigate = useNavigate();
	const [color, setColor] = useState<string>(order.customization.color);
	const [pattern, setPattern] = useState<string>(order.customization.pattern);
	const [customName, setCustomName] = useState<string>(
		order.customization.customName
	);
	const [customNumber, setCustomNumber] = useState<string>(
		order.customization.customNumber
	);
	const [quantity, setQuantity] = useState<number>(order.quantity);
	const [notes, setNotes] = useState<string>(order.customization.notes);
	const [selectedSize, setSelectedSize] = useState<string | null>(
		order.customization.selectedSize
	);
	const [product, setProduct] = useState<Product>(order.Product);
	const [logo, setLogo] = useState<File | string | null>(
		order.customization.logo
	);
	const [logoPosition, setLogoPosition] = useState(
		order.customization.logoPosition
	);
	const [logoPositionPixel, setLogoPositionPixel] = useState(
		order.customization.logoPositionPixel
	);

	const saveData = async () => {
		const id = product?.id;
		const toastId = toast.loading("Saving your customization...");
		let logoURL = "";
		if (logo && logo instanceof File) {
			const formData = new FormData();
			formData.append("file", logo);

			try {
				const data = await RequestHandler.handleRequest(
					"post",
					"file/upload-image",
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				if (data.success) {
					logoURL = data.uploadedDocument;
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
				console.error("Error submitting the document:", error);
				toast.update(toastId, {
					render: "Error submitting the document",
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
				return;
			}
		} else {
			logoURL = logo ? logo : "";
		}
		const dataToSave = {
			id,
			color,
			pattern,
			customName,
			customNumber,
			notes,
			selectedSize,
			product,
			logoPosition,
			logoPositionPixel,
			logo: logoURL,
		};

		try {
			const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
				type: "application/json",
			});
			saveAs(blob, `customization-${id || "unknown"}.json`);
			toast.update(toastId, {
				render: "Customization saved successfully!",
				type: "success",
				isLoading: false,
				autoClose: 3000,
			});
		} catch (error) {
			console.error("Error saving the file:", error);
			toast.update(toastId, {
				render: "Failed to save customization.",
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
		}
	};

	const [loading, setLoading] = useState(false);
	const handleSizeChange = (size: string) => setSelectedSize(size);
	const handleColorChange = (value: string) => setColor(value);
	const handlePatternChange = (value: string) => setPattern(value);

	const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setLogo(event.target.files[0]);
		}
	};

	const handleDownloadDesign = () => saveData();
	const [loadedData, setLoadedData] = useState<any>(null);
	return (
		<div className="bg-gray-50 flex justify-center items-center py-8 px-4">
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
					<ProductImageWithLogo
						product={product}
						logo={logo}
						logoPosition={logoPosition}
						setLogoPosition={setLogoPosition}
						logoPositionPixel={logoPositionPixel}
						setLogoPositionPixel={setLogoPositionPixel}
					/>

					<div className="flex flex-col justify-between">
						<div className="space-y-6">
							<div>
								<h3 className="text-xl font-semibold text-gray-700 mb-2">
									Select Color
								</h3>
								<div className="flex space-x-2">
									{product?.availableColors.map(
										(colorOption) => (
											<button
												disabled
												key={colorOption}
												onClick={() =>
													handleColorChange(
														colorOption
													)
												}
												className={`px-4 py-2 rounded-lg border ${
													color === colorOption
														? "bg-orange-500 text-white border-orange-500"
														: "bg-white text-gray-800 border-gray-300 hover:border-orange-500"
												} transition duration-200`}
											>
												{colorOption}
											</button>
										)
									)}
								</div>
							</div>

							{/* <div>
								<h3 className="text-xl font-semibold text-gray-700 mb-2">
									Select Pattern
								</h3>
								<div className="flex space-x-2">
									{product?.patterns.map((patternOption) => (
										<button
											disabled
											key={patternOption}
											onClick={() =>
												handlePatternChange(
													patternOption
												)
											}
											className={`px-4 py-2 rounded-lg border ${
												pattern === patternOption
													? "bg-orange-500 text-white border-orange-500"
													: "bg-white text-gray-800 border-gray-300 hover:border-orange-500"
											} transition duration-200`}
										>
											{patternOption}
										</button>
									))}
								</div>
							</div> */}

							<div className="mb-8">
								<h3 className="text-xl font-semibold text-gray-700 mb-3">
									Available Sizes
								</h3>
								<div className="flex space-x-2">
									{product?.size.map((size) => (
										<button
											disabled
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

							<div className="flex flex-col space-y-4">
								<input
									disabled
									type="text"
									placeholder="Enter Custom Name"
									value={customName}
									onChange={(e) =>
										setCustomName(e.target.value)
									}
									className="p-3 border border-gray-300 rounded-lg"
								/>
								<input
									disabled
									type="text"
									placeholder="Enter Custom Number"
									value={customNumber}
									onChange={(e) =>
										setCustomNumber(e.target.value)
									}
									className="p-3 border border-gray-300 rounded-lg"
								/>
							</div>

							<div>
								<h3 className="text-xl font-semibold text-gray-700 mb-2">
									Upload Logo
								</h3>
								<input
									disabled
									type="file"
									accept="image/*"
									onChange={handleLogoUpload}
									className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
								/>
								{logo && (
									<img
										src={
											logo instanceof File
												? URL.createObjectURL(logo)
												: logo
										}
										alt="Logo"
										className="w-[30%] h-[30%] object-contain py-2"
									/>
								)}
							</div>

							<div className="flex flex-col space-y-2">
								<input
									disabled
									type="number"
									value={quantity}
									min="1"
									max={product?.stocks}
									onChange={(e) =>
										setQuantity(
											!product
												? 0
												: Math.min(
														parseInt(
															e.target.value
														),
														product?.stocks
												  )
										)
									}
									className="p-3 border border-gray-300 rounded-lg w-32"
									placeholder="Quantity"
								/>
								<p className="text-sm text-gray-500">
									Max available: {product?.stocks}
								</p>
							</div>

							<textarea
								disabled
								placeholder="Additional notes (optional)"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="p-3 border border-gray-300 rounded-lg resize-none w-full"
								rows={3}
							/>
						</div>

						<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
							<button
								onClick={handleDownloadDesign}
								className="w-full sm:w-1/3 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
							>
								Download Design
							</button>
							<Link
								to={{
									pathname: `/order-summary`,
								}}
								state={{ orders }}
								className="text-center w-full sm:w-1/3 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
							>
								Go Back
							</Link>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
