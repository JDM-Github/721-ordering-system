import React, { useEffect, useState } from "react";
import tinycolor from "tinycolor2";

export default function ProductImageWithLogo({
	color,
	product,
	selectedPattern, // Accepts "stripes", "dots", "gradient", or "none"
}) {
	const [colorRGB, setColorRGB] = useState({ r: 0, g: 0, b: 0 });

	useEffect(() => {
		const { r, g, b } = tinycolor(color).toRgb();
		setColorRGB({ r, g, b });
	}, [color]);

	// Determine the pattern ID based on the selected pattern
	const getPatternId = () => {
		switch (selectedPattern) {
			case "deemed":
				return "nonePattern";
			case "stripes":
				return "striped-pattern";
			case "dots":
				return "pattern-circles";
			case "gradient":
				return "gradient-pattern";
			case "diagonal":
				return "diagonal-lines";
			case "grid":
				return "grid-pattern";
			case "checkerboard":
				return "checkerboard";
			case "wave":
				return "wave-pattern";
			case "hexagon":
				return "hexagon-pattern";
			case "crosshatch":
				return "crosshatch-pattern";
			case "ldots":
				return "large-dots";
			default:
				return "none";
		}
	};

	const patternUrl =
		"https://patternify.com/api/create?type=dot&color=000000&bg=ffffff";

	return (
		<>
			<svg width="0" height="0">
				<defs>
					{/* Filter for Tint */}
					<filter id="tint">
						<feColorMatrix
							type="matrix"
							values={`0 0 0 0 ${colorRGB.r / 255} 
                                    0 0 0 0 ${colorRGB.g / 255} 
                                    0 0 0 0 ${colorRGB.b / 255} 
                                    0 0 0 1 0`}
						/>
					</filter>

					<pattern
						id="nonePattern"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect width="10" height="10" fill="black" />
					</pattern>

					{/* Striped Pattern */}
					<pattern
						id="striped-pattern"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect width="10" height="10" fill="black" />
						<path
							d="M-2,2 l6,-6 M0,10 l10,-10 M8,12 l6,-6"
							stroke="gray"
							strokeWidth="2"
						/>
					</pattern>

					{/* Dotted Pattern */}
					<pattern
						id="pattern-circles"
						x="0"
						y="0"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect width="10" height="10" fill="black" />
						<circle cx="5" cy="5" r="2" fill="gray" />
					</pattern>

					<pattern
						id="diagonal-lines"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect width="10" height="10" fill="black" />
						<path d="M0,10 L10,0" stroke="gray" strokeWidth="1" />
						<path d="M-5,5 L5,-5" stroke="gray" strokeWidth="1" />
						<path d="M5,15 L15,5" stroke="gray" strokeWidth="1" />
					</pattern>

					<pattern
						id="grid-pattern"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect width="10" height="10" fill="black" />
						<rect
							width="10"
							height="10"
							fill="none"
							stroke="gray"
							strokeWidth="1"
						/>
					</pattern>

					<pattern
						id="checkerboard"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect x="0" y="0" width="5" height="5" fill="black" />
						<rect x="5" y="5" width="5" height="5" fill="black" />
					</pattern>

					<pattern
						id="wave-pattern"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect width="10" height="10" fill="black" />
						<path
							d="M0,10 Q5,0 10,10 T20,10"
							fill="none"
							stroke="gray"
							strokeWidth="1"
						/>
					</pattern>

					<pattern
						id="hexagon-pattern"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect width="10" height="10" fill="black" />
						<polygon
							points="5,0 10,2.5 10,7.5 5,10 0,7.5 0,2.5"
							fill="none"
							stroke="gray"
							strokeWidth="1"
						/>
					</pattern>

					<pattern
						id="crosshatch-pattern"
						width="10"
						height="10"
						patternUnits="userSpaceOnUse"
					>
						<rect width="10" height="10" fill="black" />
						<path
							d="M0,0 L10,10 M10,0 L0,10"
							stroke="gray"
							strokeWidth="1"
						/>
					</pattern>

					<pattern
						id="large-dots"
						width="20"
						height="20"
						patternUnits="userSpaceOnUse"
					>
						<rect width="20" height="20" fill="black" />
						<circle cx="10" cy="10" r="5" fill="gray" />
					</pattern>

					{/* Gradient Pattern */}
					<linearGradient
						id="gradient-pattern"
						gradientTransform="rotate(45)"
					>
						<stop offset="0%" stopColor="gray" />
						<stop offset="100%" stopColor="black" />
					</linearGradient>
				</defs>
			</svg>

			<div className="relative w-full h-full">
				{/* Base Image */}
				<img
					src={
						product.productImage
							? product.productImage
							: "https://placehold.co/600x400"
					}
					alt={product?.productName}
					className="w-full h-full object-fill rounded-lg"
				/>

				{/* Tinted Image */}
				<img
					src={
						product.productImage
							? product.productImage
							: "https://placehold.co/600x400"
					}
					alt={product?.productName}
					className="w-full h-full object-fill rounded-lg absolute top-0 left-0"
					style={{
						filter: "url(#tint)",
						opacity: 0.6,
						mixBlendMode: "multiply",
					}}
				/>

				{/* <div
					className="image-container"
					style={{
						backgroundImage: "url('pattern_url')",
					}}
				>
					<img src="image_url" alt="Product" />
				</div> */}
				{/* Pattern Overlay */}
				<svg
					className="absolute top-0 left-0 w-full h-full rounded-lg"
					viewBox="0 0 100 100"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						width="100%"
						height="100%"
						fill={`url(#${getPatternId()})`}
						style={{ mixBlendMode: "overlay" }}
					/>
				</svg>
			</div>
		</>
	);
}
