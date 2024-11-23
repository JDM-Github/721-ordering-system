import React, { useState, useEffect } from "react";
const banner1 = require("../../Assets/banner-1.jpg");
const banner2 = require("../../Assets/banner-2.jpg");
const banner3 = require("../../Assets/banner-4.jpg");
const banner4 = require("../../Assets/banner-5.jpg");

const images = [banner1, banner2, banner3, banner4];

function Carousel() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const nextImage = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
	};

	const prevImage = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + images.length) % images.length
		);
	};

	useEffect(() => {
		const interval = setInterval(() => {
			nextImage();
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="relative w-10/12 md:w-8/12 mx-auto mt-12  shadow-lg rounded-lg overflow-hidden">
			{/* Carousel Image */}
			<img
				src={images[currentIndex]}
				alt={`Carousel Image ${currentIndex + 1}`}
				className="w-full h-auto object-cover transition-all duration-500 ease-in-out"
			/>

			{/* Left Arrow */}
			<button
				onClick={prevImage}
				className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75"
			>
				&#8249;
			</button>

			{/* Right Arrow */}
			<button
				onClick={nextImage}
				className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75"
			>
				&#8250;
			</button>
		</div>
	);
}

export default Carousel;
