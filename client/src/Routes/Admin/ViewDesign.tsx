import React, { useEffect, useState, useRef } from "react";
import RequestHandler from "../../Functions/RequestHandler";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ProductImageWithLogo from "../../Component/ProductImageWithLogo.tsx";
import ImageComponent from "../../Component/ImageComponent.tsx";
import LabelComponent from "../../Component/LabelComponent.tsx";

export default function ViewDesign() {
	const location = useLocation();
	const { order, orders } = location.state || {};
	const [color, setColor] = useState<string>("#ffffff");
	const [pattern, setPattern] = useState<string>("none");
	const [customName, setCustomName] = useState<string>("");
	const [customNumber, setCustomNumber] = useState<string>("");
	const [quantity, setQuantity] = useState<number>(1);
	const [notes, setNotes] = useState<string>("");
	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [product, setProduct] = useState<any>(null);
	const [activeImage, setActiveImage] = useState(null);
	const [imagePattern, setImagePattern] = useState<any>({
		uniqueId: "pattern-image",
		img: "",
		imgFileUrl: "",
		width: 500,
		height: 500,
		widthPercent: 1,
		heightPercent: 1,
		x: 0,
		y: 0,
		pixelx: 0,
		pixely: 0,
		isActive: true,
		isPattern: false,
	});
	const [isreloaded, setisreloaded] = useState(true);
	const [imageComponents, setImageComponents] = useState<any>([]);
	const [labelComponents, setLabelComponents] = useState<any>([]);
	const [backgroundColor, setBackgroundColor] = useState("#eee");
	const [index, setIndex] = useState(0);
	const [customization, setCustomization] = useState<any>({});

	const updateImageComponent = (uniqueId, updatedProperties) => {
		setImageComponents((prevComponents) =>
			prevComponents.map((comp) =>
				comp.uniqueId === uniqueId
					? { ...comp, ...updatedProperties }
					: comp
			)
		);
	};
	const updateLabelComponent = (uniqueId, updatedProperties) => {
		setLabelComponents((prevComponents) =>
			prevComponents.map((comp) =>
				comp.uniqueId === uniqueId
					? { ...comp, ...updatedProperties }
					: comp
			)
		);
	};
	const saveToLocalStorage = (key, value) => {
		localStorage.setItem(key, JSON.stringify(value));
	};
	const loadFromLocalStorage = (key) => {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : null;
	};
	const setTargetIndex = async (newIndex) => {
		setActiveImage(null);
		setisreloaded(true);

		const customize = {
			image: imageComponents,
			label: labelComponents,
			background: backgroundColor,
			color: color,
			pattern: pattern,
		};

		saveToLocalStorage(`customization-${index}`, customize);
		const newCustomization = loadFromLocalStorage(
			`customization-${newIndex}`
		);
		setIndex(newIndex);
		if (newCustomization) {
			setImageComponents(newCustomization.image);
			setLabelComponents(newCustomization.label);
			setBackgroundColor(newCustomization.background);
			setColor(newCustomization.color);
			setPattern(newCustomization.pattern);
		} else {
			setImageComponents([]);
			setLabelComponents([]);
			setBackgroundColor("#eee");
			setColor("#fff");
			setPattern("none");
		}
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Delete" && activeImage) {
				setImageComponents((prevComponents) =>
					prevComponents.filter(
						(comp) => comp.uniqueId !== activeImage
					)
				);
				setLabelComponents((prevComponents) =>
					prevComponents.filter(
						(comp) => comp.uniqueId !== activeImage
					)
				);
				setActiveImage(null);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [activeImage, setImageComponents, setLabelComponents, setActiveImage]);

	const saveData = async () => {
		const jsonData = JSON.stringify(customization.customization);
		const blob = new Blob([jsonData], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "customization.json";
		link.click();
	};

	const [loading, setLoading] = useState(false);
	const queryParams = new URLSearchParams(location.search);
	const productId = queryParams.get("id");
	const loadAllProducts = async () => {
		if (productId) {
			try {
				const data: any = await RequestHandler.handleRequest(
					"post",
					`product/get-order-summary?id=${productId}`,
					{ id: productId }
				);
				if (data.success === false) {
				} else {
					const customOrder = data.product;

					setCustomization({
						customization: { ...customOrder.customization },
						Product: { ...customOrder.Product }
					});

					setProduct(customOrder.Product);
					setSelectedSize(
						customOrder.customization.selectedSize || null
					);
					setCustomNumber(customOrder.customization.customNumber);
					setCustomName(customOrder.customization.customName);

					for (const key in localStorage) {
						if (key.startsWith("customization-")) {
							localStorage.removeItem(key);
						}
					}
					let haveSomething = false;
					for (const [
						index,
						ord,
					] of customOrder.customization.customize_list.entries()) {
						const customize = {
							image: ord.image,
							label: ord.label,
							background: ord.backgroundColor,
							color: ord.color,
							pattern: ord.pattern,
						};
						haveSomething = true;
						saveToLocalStorage(`customization-${index}`, customize);
					}
					if (haveSomething) {
						const newCustomization = loadFromLocalStorage(
							`customization-${0}`
						);
						setImageComponents(newCustomization.image);
						setLabelComponents(newCustomization.label);
						setBackgroundColor(newCustomization.background);
						setColor(newCustomization.color);
						setPattern(newCustomization.pattern);
					}
				}
			} catch (error) {}
		} else if (order) {
			setCustomization({
				customization: { ...order.product.customization },
				Product: { ...order.product },
			});

			setProduct(order.product);
			setSelectedSize(order.product.customization.selectedSize || null);
			setCustomNumber(order.product.customization.customNumber);
			setCustomName(order.product.customization.customName);
			for (const key in localStorage) {
				if (key.startsWith("customization-")) {
					localStorage.removeItem(key);
				}
			}
			let haveSomething = false;
			for (const [
				index,
				ord,
			] of order.product.customization.customize_list.entries()) {
				const customize = {
					image: ord.image,
					label: ord.label,
					background: ord.backgroundColor,
					color: ord.color,
					pattern: ord.pattern,
				};
				haveSomething = true;
				saveToLocalStorage(`customization-${index}`, customize);
			}
			if (haveSomething) {
				const newCustomization = loadFromLocalStorage(
					`customization-${0}`
				);
				setImageComponents(newCustomization.image);
				setLabelComponents(newCustomization.label);
				setBackgroundColor(newCustomization.background);
				setColor(newCustomization.color);
				setPattern(newCustomization.pattern);
			}
		}
	};
	useEffect(() => {
		loadAllProducts();
	}, []);

	const handleSizeChange = (size: string) => setSelectedSize(size);
	const handleDownloadDesign = () => saveData();
	const containerRef = useRef<HTMLImageElement | null>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	const handleDownloadPng = async () => {
		if (productId) {
			const toastId = toast.loading("Downloading image...", {
				position: "top-right",
			});

			try {
				const currentDomain = window.location.origin; 
				const data = await RequestHandler.handleRequest(
					"post",
					"product/screenshot",
					{
						url: `${currentDomain}/view-design?id=${productId}`,
						hiddenData: customization,
					}
				);
				if (data.success) {
					const pngBlob = new Blob(
						[
							Uint8Array.from(atob(data.screenshot), (c) =>
								c.charCodeAt(0)
							),
						],
						{
							type: "image/png",
						}
					);
					const pngUrl = URL.createObjectURL(pngBlob);
					const pngLink = document.createElement("a");
					pngLink.href = pngUrl;
					pngLink.download = "screenshot.png";
					pngLink.click();

					const psdBlob = new Blob(
						[
							Uint8Array.from(atob(data.psd), (c) =>
								c.charCodeAt(0)
							),
						],
						{
							type: "application/octet-stream",
						}
					);
					const psdUrl = URL.createObjectURL(psdBlob);
					const psdLink = document.createElement("a");
					psdLink.href = psdUrl;
					psdLink.download = "screenshot.psd";
					psdLink.click();

					toast.update(toastId, {
						render: "Screenshot downloaded successfully!",
						type: "success",
						isLoading: false,
						autoClose: 5000,
					});
				} else {
					toast.update(toastId, {
						render: "Cannot load screenshot",
						type: "error",
						isLoading: false,
						autoClose: 5000,
					});
				}
			} catch (error) {
				console.error("Error uploading image:", error);
				toast.update(toastId, {
					render: "Error submitting the document",
					type: "error",
					isLoading: false,
					autoClose: 5000,
				});
			}
		}
	};

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
					{/* Left Side: Product Image */}
					<div
						ref={cardRef}
						className="flex flex-col justify-between min-h-[70vh] overflow-y-hidden px-4 scrollbar-thin border border-gray-300 z-100"
					>
						<div className="relative flex justify-center align-items-center">
							<div
								className="w-full h-full min-h-[400px] max-h-[400px] min-w-[400px] max-w-[400px]"
								style={{ backgroundColor: backgroundColor }}
								ref={containerRef}
							>
								<ProductImageWithLogo
									index={index}
									color={color}
									product={product}
									imagePattern={imagePattern}
								/>
							</div>
							<div className="absolute w-full h-full min-h-[400px] max-h-[400px] min-w-[400px] max-w-[400px]">
								{labelComponents.map((labelComp, index) => (
									<LabelComponent
										key={labelComp.uniqueId}
										containerRef={containerRef}
										labelComp={labelComp}
										uniqueId={labelComp.uniqueId}
										activeImage={activeImage}
										setActiveImage={setActiveImage}
										updateLabelComponent={
											updateLabelComponent
										}
										isreloaded={isreloaded}
										setisreloaded={setisreloaded}
										disabled={true}
									/>
								))}
								{imageComponents.map((imageComp, index) => (
									<ImageComponent
										key={imageComp.uniqueId}
										containerRef={containerRef}
										imageComp={imageComp}
										uniqueId={imageComp.uniqueId}
										activeImage={activeImage}
										setActiveImage={setActiveImage}
										updateImageComponent={
											updateImageComponent
										}
										isreloaded={isreloaded}
										setisreloaded={setisreloaded}
										disabled={true}
									/>
								))}
							</div>
						</div>
					</div>

					<div className="flex flex-col justify-between h-[70vh] overflow-y-auto px-4 scrollbar-thin border border-gray-300">
						<div className="space-y-6">
							<div
								className="fixed top-1/2 left-0 transform -translate-y-1/2 flex flex-col space-y-4 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-lg p-2"
								style={{ backgroundColor: "#aaa" }}
							>
								{product.productImages &&
									product.productImages.map(
										(image, index) => (
											<img
												key={index}
												src={image}
												alt={`Thumbnail ${index}`}
												className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
													activeImage === index
														? "border-blue-500"
														: "border-white"
												}`}
												onClick={() =>
													setTargetIndex(index)
												}
											/>
										)
									)}
							</div>

							<div className="mb-8">
								<h1 className="text-3xl font-semibold text-gray-700 mb-3"></h1>
								<h3 className="text-xl font-semibold text-gray-700 mb-3">
									Available Sizes
								</h3>
								<div className="flex space-x-2">
									{product?.size.map((size) => (
										<button
											disabled={true}
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
									disabled={true}
									type="text"
									placeholder="Enter Custom Name"
									value={customName}
									onChange={(e) =>
										setCustomName(e.target.value)
									}
									className="p-3 border border-gray-300 rounded-lg"
								/>
								<input
									disabled={true}
									type="text"
									placeholder="Enter Custom Number"
									value={customNumber}
									onChange={(e) =>
										setCustomNumber(e.target.value)
									}
									className="p-3 border border-gray-300 rounded-lg"
								/>
							</div>

							<div className="flex flex-col space-y-2">
								<input
									disabled={true}
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
								disabled={true}
								placeholder="Additional notes (optional)"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="p-3 border border-gray-300 rounded-lg resize-none w-full"
								rows={3}
							/>

							{/* <button
								className="w-16 h-16 me-3 bg-red-500 rounded-full shadow hover:bg-red-600"
								onClick={reactToPrintFn}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-16 w-16 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 9V3h12v6m-3 6h3a2 2 0 012 2v4H4v-4a2 2 0 012-2h3m0 0v4h6v-4m-6 0h6"
									/>
								</svg>
							</button> */}
							{/* <button
								className="w-16 h-16 bg-red-500 rounded-full shadow hover:bg-red-600"
								onClick={handleDownloadPng}
							>
								<img
									src="https://static.vecteezy.com/system/resources/thumbnails/014/440/983/small_2x/image-icon-design-in-blue-circle-png.png"
									alt="Save Icon"
									className="w-16 h-16"
								/>
							</button> */}
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6 mb-3">
							{/* <button
								onClick={handleDownloadDesign}
								className="w-full sm:w-1/3 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
							>
								Download Design
							</button> */}
							<button
								onClick={() => window.history.back()}
								className="text-center w-full sm:w-1/3 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
							>
								Go Back
							</button>
							{/* {orders ? (
								<Link
									to={{
										pathname: `/order-summary`,
									}}
									state={{ orders }}
									className="text-center w-full sm:w-1/3 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
								>
									Go Back
								</Link>
							) : (
								<Link
									to={{
										pathname: `/history`,
									}}
									className="text-center w-full sm:w-1/3 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
								>
									Go Back
								</Link>
							)} */}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// {
// 	orders ? (
// 		<Link
// 			to={{
// 				pathname: `/order-summary`,
// 			}}
// 			state={{ orders }}
// 			className="text-center w-full sm:w-1/3 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
// 		>
// 			Go Back
// 		</Link>
// 	) : (
// 		<Link
// 			to={{
// 				pathname: `/history`,
// 			}}
// 			className="text-center w-full sm:w-1/3 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
// 		>
// 			Go Back
// 		</Link>
// 	);
// }
