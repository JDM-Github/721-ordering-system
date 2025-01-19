import React, { useEffect, useState } from "react";

const ImageComponent = ({
	containerRef,
	imageComp,
	uniqueId,
	activeImage,
	setActiveImage,
	updateImageComponent,
	disabled = false,
	pattern = false,
	isreloaded,
	setisreloaded,
}) => {
	const [doesMove, setDoesMove] = useState(false);
	const [isMoving, setIsMoving] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
	const [startResize, setStartResize] = useState({ x: 0, y: 0 });

	useEffect(() => {
		if (disabled) return;
		if (isDragging) {
			const handleMouseMove = (event) => {
				if (!isResizing) {
					if (!doesMove) {
						const containerRect =
							containerRef.current.getBoundingClientRect();
						updateImageComponent(imageComp.uniqueId, {
							pixelx:
								imageComp.pixelx -
								containerRect.left -
								imageComp.width / 2,
							pixely:
								imageComp.pixely -
								containerRect.top -
								imageComp.height / 2,
						});
					}
					setDoesMove(true);
					updateImageComponent(imageComp.uniqueId, {
						pixelx:
							event.clientX + imageComp.width / 2 - startDrag.x,
						pixely:
							event.clientY + imageComp.height / 2 - startDrag.y,
					});
					if (!isMoving) setIsMoving(true);
				} else handleResize(event);
			};
			window.addEventListener("mouseup", handleMouseUp);
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("touchend", handleMouseUp);
			window.addEventListener("touchmove", handleMouseMove);
			return () => {
				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("mouseup", handleMouseUp);
				window.removeEventListener("touchend", handleMouseUp);
				window.removeEventListener("touchmove", handleMouseMove);
			};
		}
	}, [isDragging]);

	const handleMouseDown = (event) => {
		if (disabled) return;
		if (containerRef.current) {
			setDoesMove(false);
			const target = event.currentTarget;
			const rect = target.getBoundingClientRect();
			const absoluteX = rect.left + window.scrollX;
			const absoluteY = rect.top + window.scrollY;

			setStartDrag({
				x: event.clientX - absoluteX,
				y: event.clientY - absoluteY,
			});
			setStartResize({
				x: event.clientX,
				y: event.clientY,
			});
			setIsDragging(true);
			setActiveImage(uniqueId);
		}
	};

	const handleMouseUp = () => {
		if (disabled) return;
		setIsDragging(false);
		setIsResizing(false);
		setIsMoving(false);

		if (containerRef.current) {
			const containerRect = containerRef.current.getBoundingClientRect();
			let x =
				(imageComp.pixelx - containerRect.left - imageComp.width / 2) /
				containerRect.width;
			let y =
				(imageComp.pixely - containerRect.top - imageComp.height / 2) /
				containerRect.height;

			let width = imageComp.width / containerRect.width;
			let height = imageComp.height / containerRect.height;
			if (doesMove) {
				updateImageComponent(imageComp.uniqueId, {
					x: x,
					y: y,
					pixelx:
						imageComp.pixelx -
						containerRect.left -
						imageComp.width / 2,
					pixely:
						imageComp.pixely -
						containerRect.top -
						imageComp.height / 2,
				});
			}
			updateImageComponent(imageComp.uniqueId, {
				widthPercent: width,
				heightPercent: height,
			});
			setDoesMove(false);
		}
	};

	const getImageCompPosition = () => {
		if (isreloaded) {
			setisreloaded(false);
			return {
				left: `${imageComp.pixelx}px`,
				top: `${imageComp.pixely}px`,
			};
		}

		if (containerRef.current) {
			const containerRect = containerRef.current.getBoundingClientRect();
			const width = imageComp.widthPercent * containerRect.width;
			const height = imageComp.heightPercent * containerRect.height;

			if (isMoving && isDragging && !isResizing) {
				return {
					left: `calc(${imageComp.pixelx}px - ${containerRect.left}px - ${width}px / 2)`,
					top: `calc(${imageComp.pixely}px - ${containerRect.top}px - ${height}px / 2)`,
					width: `${width}px`,
					height: `${height}px`,
				};
			}
			if (isResizing) {
				return {
					left: `calc(${imageComp.x * containerRect.width}px - ${
						imageComp.width
					} / 2)`,
					top: `calc(${imageComp.y * containerRect.height}px - ${
						imageComp.height
					} / 2)`,
					width: `${imageComp.width}px`,
					height: `${imageComp.height}px`,
				};
			}

			return {
				left: `calc(${
					imageComp.x * containerRect.width
				}px - ${width} / 2)`,
				top: `calc(${
					imageComp.y * containerRect.height
				}px - ${height} / 2)`,
				width: `${width}px`,
				height: `${height}px`,
			};
		}
		return {
			left: `${imageComp.pixelx}px`,
			top: `${imageComp.pixely}px`,
			width: `${imageComp.width}px`,
			height: `${imageComp.height}px`,
		};
	};

	const [isResizing, setIsResizing] = useState(false);
	const [resizeDirection, setResizeDirection] = useState("");
	const handleResizeMouseDown = (direction) => {
		setIsResizing(true);
		setResizeDirection(direction);
	};

	const handleResize = (event) => {
		if (!containerRef.current) return;

		switch (resizeDirection) {
			case "bottom":
				updateImageComponent(imageComp.uniqueId, {
					height: Math.max(
						10,
						imageComp.height + event.clientY - startResize.y
					),
				});
				break;
			case "right":
				updateImageComponent(imageComp.uniqueId, {
					width: Math.max(
						10,
						imageComp.width + event.clientX - startResize.x
					),
				});
				break;
			case "bottomRight":
				updateImageComponent(imageComp.uniqueId, {
					width: Math.max(
						10,
						imageComp.width + event.clientX - startResize.x
					),
					height: Math.max(
						10,
						imageComp.height + event.clientY - startResize.y
					),
				});
				break;
			default:
				break;
		}
	};

	return (
		<>
			{imageComp.isActive && imageComp.img && (
				<div
					ref={(el) => el && el.focus()}
					data-id={uniqueId}
					className={`absolute cursor-move ${
						isDragging || isResizing || activeImage === uniqueId
							? "border-2 border-red-500"
							: ""
					}`}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
					style={{
						...getImageCompPosition(),
					}}
				>
					<div
						className="absolute w-2 h-full top-0 -right-1 cursor-ew-resize"
						onMouseDown={() => handleResizeMouseDown("right")}
					></div>
					<div
						className="absolute h-2 w-full -bottom-1 left-0 cursor-ns-resize"
						onMouseDown={() => handleResizeMouseDown("bottom")}
					></div>
					<div
						className="absolute w-2 h-2 -bottom-1 -right-1 cursor-nwse-resize"
						onMouseDown={() => handleResizeMouseDown("bottomRight")}
					></div>

					<img
						src={
							imageComp.img instanceof File
								? imageComp.imgFileUrl
								: imageComp.img
						}
						alt="Image"
						className="rounded-lg pointer-events-none"
						style={{
							width: "100%",
							height: "100%",
							...(pattern && {
								objectFit: "contain",
								mixBlendMode: "multiply",
								opacity: 0.8,
							}),
						}}
					/>
				</div>
			)}
		</>
	);
};

export default ImageComponent;
