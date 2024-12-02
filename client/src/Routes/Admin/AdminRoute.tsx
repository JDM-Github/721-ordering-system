import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard.tsx";
import Navigation from "./Navigation.tsx";
import RegistrationPage from "./RegistrationPage.tsx";
import LoginPage from "./LoginPage.tsx";
import Footer from "./Footer.tsx";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ShoppingCart from "./ShoppingCart.tsx";
import ProductView from "./ProductView.tsx";
import CustomizationPage from "./Customize.tsx";
import CustomizeSection from "./CustomizeSection.tsx";
import OrderSummary from "./OrderSummary.tsx";
import AccountInfo from "./AccountInfo.tsx";
import OrderHistory from "./OrderHistory.tsx";
import EditPageRoute from "./EditProduct.tsx";
import ViewDesign from "./ViewDesign.tsx";

export default function AdminRoute({ className }) {
	const [user, setUser] = useState({});
	useEffect(() => {
		const userDetails = JSON.parse(localStorage.getItem("user") ?? "{}");
		setUser(userDetails);
	}, []);
	return (
		<div className="admin">
			<Navigation user={user} setUser={setUser} />
			<div className="admin-content">
				{/* <TopBar clickHandler={undefined} /> */}
				<Routes>
					<Route index path="/" element={<Dashboard />} />
					<Route path="/register" element={<RegistrationPage />} />
					<Route
						path="/login"
						element={<LoginPage setUser={setUser} />}
					/>
					<Route path="/cart" element={<ShoppingCart />} />
					<Route path="/product" element={<ProductView />} />
					<Route path="/customize" element={<CustomizationPage />} />
					<Route path="/edit" element={<EditPageRoute />} />
					<Route path="/view-design" element={<ViewDesign />} />
					<Route
						path="/customize-templates"
						element={<CustomizeSection />}
					/>
					<Route path="/order-summary" element={<OrderSummary />} />
					<Route
						path="/account"
						element={
							<AccountInfo
								userData={user}
								setUserData={setUser}
							/>
						}
					/>
					<Route
						path="/history"
						element={<OrderHistory user={user} />}
					/>
					{/* <Route index path="/login" element={<AdminLogin />} />
					<Route index path="/users" element={<Users />} />
					<Route index path="/orders" element={<Orders />} /> */}
					{/* <Route
						index
						path="/complete-orders"
						element={<CompleteOrders />}
					/>
					<Route
						index
						path="/product-list"
						element={<ProductList />}
					/> */}
				</Routes>
				{/* <Copyright />
				<Chats /> */}
			</div>
			<Footer />
			<ToastContainer />
		</div>
	);
}
