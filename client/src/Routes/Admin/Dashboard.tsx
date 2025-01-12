import React, { useEffect } from "react";
import Carousel from "./Carousel.tsx";
import ProductSection from "./ProductSection.tsx";
import { toast } from "react-toastify";

export default function Dashboard() {
	useEffect(() => {
		const queryParams = new URLSearchParams(window.location.search);
		const message = queryParams.get("message");

		if (message === "payment-success") {
			toast.success("Order successfully placed!");
		} else if (message === "payment-failed") {
			toast.error("Order failed. Please try again!");
		} else if (message === "invalid-auth") {
			sessionStorage.clear();
			localStorage.removeItem("user");
			toast.error("You are not authorized to view this page.");
		}
	}, []);
	return (
		<>
			<Carousel />
			<ProductSection />
		</>
	);
}
