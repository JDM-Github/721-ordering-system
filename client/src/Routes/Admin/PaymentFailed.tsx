import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PaymentFailed() {
	const navigate = useNavigate();
	useEffect(() => {
		toast.error("Payment failed.");
		navigate("/");
	});
	return <div>PAYMENT FAILED</div>;
}
