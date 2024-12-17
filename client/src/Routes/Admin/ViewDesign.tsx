import React, { useEffect, useRef, useState } from "react";
import RequestHandler from "../../Functions/RequestHandler";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { saveAs } from "file-saver";
import ProductImageWithLogo from "../../Component/ProductImageWithLogo.tsx";
import ImageComponent from "../../Component/ImageComponent.tsx";
import LabelComponent from "../../Component/LabelComponent.tsx";

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

interface ImageComp {
	uniqueId: string;
	imgFileUrl: string;
	img: string | File;
	x: number;
	y: number;
	pixelx: number;
	pixely: number;
	width: number;
	height: number;
	widthPercent: number;
	heightPercent: number;
	isActive: boolean;
	isPattern: boolean;
}

interface LabelComp {
	uniqueId: string;
	x: number;
	y: number;
	pixelx: number;
	pixely: number;
	width: number;
	height: number;
	widthPercent: number;
	heightPercent: number;
	isActive: boolean;
	text: string;
}

export default function ViewDesign() {
	const location = useLocation();
	const { order, orders } = location.state || {};

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
	const [imageComponents, setImageComponents] = useState<ImageComp[]>(
		order.customization.image
	);
	const [labelComponents, setLabelComponents] = useState<LabelComp[]>(
		order.customization.label
	);
	const [loading, setLoading] = useState(false);
	const containerRef = useRef<HTMLImageElement | null>(null);

	const [index, setIndex] = useState(0);
	const [activeImage, setActiveImage] = useState(null);
	const [imagePattern, setImagePattern] = useState<ImageComp | null>({
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
					<div className="flex flex-col justify-between h-[60vh] overflow-y-hidden px-4 scrollbar-thin border border-gray-300 z-100">
						<div className="relative flex">
							<div
								className="w-full h-full max-h-[60vh]"
								ref={containerRef}
							>
								<ProductImageWithLogo
									index={index}
									color={color}
									product={product}
									imagePattern={imagePattern}
								/>
							</div>
							{labelComponents.map((labelComp, index) => (
								<LabelComponent
									key={labelComp.uniqueId}
									containerRef={containerRef}
									labelComp={labelComp}
									uniqueId={labelComp.uniqueId}
									activeImage={activeImage}
									setActiveImage={setActiveImage}
									updateLabelComponent={null}
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
									updateImageComponent={null}
									isreloaded={isreloaded}
									setisreloaded={setisreloaded}
									disabled={true}
								/>
							))}
						</div>
					</div>

					<div className="flex flex-col justify-between h-[70vh] overflow-y-auto px-4 scrollbar-thin border border-gray-300">
						<div className="space-y-6">
							<div className="mb-8">
								<h3 className="text-xl font-semibold text-gray-700 mb-3 mt-3">
									Available Sizes
								</h3>
								<div className="flex space-x-2">
									{product?.size.map((size) => (
										<button
											disabled
											key={size}
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
									className="p-3 border border-gray-300 rounded-lg"
								/>
								<input
									disabled
									type="text"
									placeholder="Enter Custom Number"
									value={customNumber}
									className="p-3 border border-gray-300 rounded-lg"
								/>
							</div>

							<div className="flex flex-col space-y-2">
								<input
									disabled
									type="number"
									value={quantity}
									min="1"
									max={product?.stocks}
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
								className="p-3 border border-gray-300 rounded-lg resize-none w-full"
								rows={3}
							/>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6 mb-3">
							<button
								// onClick={handleDownloadDesign}
								className="w-full sm:w-1/3 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
							>
								Download Design
							</button>
							{orders ? (
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
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
