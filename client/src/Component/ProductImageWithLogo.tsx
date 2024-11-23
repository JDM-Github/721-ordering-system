import React, { useEffect, useState, useRef } from "react";

export default function ProductImageWithLogo({
	product,
	logo,
	logoPosition,
	setLogoPosition,
	logoPositionPixel,
	setLogoPositionPixel,
}) {
	const containerRef = useRef<HTMLImageElement | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(!isDragging);
		if (!isDragging) {
			if (containerRef.current) {
				const containerRect =
					containerRef.current.getBoundingClientRect();
				const x = logoPosition.x * containerRect.width;
				const y = logoPosition.y * containerRect.height;
				setLogoPositionPixel({ x, y });
				setDragStart({
					x: e.clientX - x,
					y: e.clientY - y,
				});
			}
		} else {
			if (containerRef.current) {
				const containerRect =
					containerRef.current.getBoundingClientRect();
				const newX = Math.max(
					0,
					Math.min(logoPositionPixel.x, containerRect.width - 100)
				);
				const newY = Math.max(
					0,
					Math.min(logoPositionPixel.y, containerRect.height - 100)
				);
				const x = newX / containerRect.width;
				const y = newY / containerRect.height;
				setLogoPositionPixel({ x: newX, y: newY });
				setLogoPosition({ x, y });
			}
		}
	};

	useEffect(() => {
		if (isDragging) {
			const handleGlobalMouseMove = (e: MouseEvent) => {
				const newX = e.clientX - dragStart.x;
				const newY = e.clientY - dragStart.y;
				setLogoPositionPixel({
					x: newX,
					y: newY,
				});
			};
			window.addEventListener("mousemove", handleGlobalMouseMove);
			return () => {
				window.removeEventListener("mousemove", handleGlobalMouseMove);
			};
		}
	}, [isDragging, dragStart]);

	const getLogoPositionStyle = () => {
		if (containerRef.current) {
			const containerRect = containerRef.current.getBoundingClientRect();
			let left = logoPositionPixel.x;
			let top = logoPositionPixel.y;

			if (isDragging) {
				left = logoPositionPixel.x;
				top = logoPositionPixel.y;
			} else {
				left = logoPosition.x * containerRect.width;
				top = logoPosition.y * containerRect.height;
			}
			return { left: `${left}px`, top: `${top}px` };
		}
		return { left: "0px", top: "0px" };
	};

	return (
		<div className="relative flex">
			<div className="w-full h-full max-h-96" ref={containerRef}>
				<img
					src={
						product.productImage
							? product.productImage
							: "https://placehold.co/600x400"
					}
					alt={product?.productName}
					className="w-full h-full object-cover rounded-lg"
				/>
				{logo && (
					<img
						src={
							logo instanceof File
								? URL.createObjectURL(logo)
								: logo
						}
						alt="Logo"
						className="rounded-lg absolute cursor-move"
						style={{
							...getLogoPositionStyle(),
							width: "100px",
							height: "100px",
						}}
						onMouseDown={handleMouseDown}
					/>
				)}
			</div>
		</div>
	);
}
