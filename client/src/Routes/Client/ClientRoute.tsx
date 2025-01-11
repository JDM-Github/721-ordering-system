import React, { useEffect } from "react";
import { Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Dashboard from "./Dashboard.tsx";
import Inventory from "./Inventory.tsx";
import OrderHistory from "./OrderHistory.tsx";
import AllFeedback from "./AllFeedback.tsx";

export default function ClientRoute() {
	const navigate = useNavigate();
	const authToken = sessionStorage.getItem("authToken");
	useEffect(() => {
		if (authToken !== "admin-token") {
			toast.error("You are not authorized to view this page.");
			navigate("/?message=invalid-auth");
		}
	}, []);
	return (
		<>
			<div className="min-h-screen bg-gray-100 flex">
				<div className="w-1/5 bg-gradient-to-tl from-orange-500 via-orange-600 to-orange-700 text-white p-6 flex flex-col shadow-lg rounded-lg">
					<div className="flex items-center mb-8">
						<div className="w-14 h-14 bg-white rounded-full flex justify-center items-center shadow-lg">
							<span className="text-2xl font-semibold text-orange-600">
								ADMIN
							</span>
						</div>
						<div className="ml-4">
							<h2 className="text-xl font-bold">ADMINISTRATOR</h2>
							<p className="text-sm text-gray-200">
								admin@example.com
							</p>
						</div>
					</div>
					{/* Navigation */}
					<div className="mt-4">
						<h3 className="text-lg font-semibold mb-6 text-gray-200">
							Navigation
						</h3>
						<ul className="space-y-5">
							{/* Dashboard Link */}
							<li>
								<NavLink
									to="/admin/dashboard"
									className={({ isActive }) =>
										`flex items-center py-3 px-5 rounded-lg transition duration-300 ${
											isActive
												? "bg-orange-800 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-5 h-5 mr-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 3h18M3 12h18M3 21h18"
										/>
									</svg>
									Dashboard
								</NavLink>
							</li>

							<li>
								<NavLink
									to="/admin/inventory"
									className={({ isActive }) =>
										`flex items-center py-3 px-5 rounded-lg transition duration-300 ${
											isActive
												? "bg-orange-800 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-5 h-5 mr-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 3h18M3 12h18M3 21h18"
										/>
									</svg>
									Inventory
								</NavLink>
							</li>

							<li>
								<NavLink
									to="/admin/history"
									className={({ isActive }) =>
										`flex items-center py-3 px-5 rounded-lg transition duration-300 ${
											isActive
												? "bg-orange-800 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-5 h-5 mr-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 3h18M3 12h18M3 21h18"
										/>
									</svg>
									Orders
								</NavLink>
							</li>

							<li>
								<NavLink
									to="/admin/feedback"
									className={({ isActive }) =>
										`flex items-center py-3 px-5 rounded-lg transition duration-300 ${
											isActive
												? "bg-orange-800 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-5 h-5 mr-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 3h18M3 12h18M3 21h18"
										/>
									</svg>
									Feedback
								</NavLink>
							</li>

							{/* Logout Link */}
							<li>
								<NavLink
									to="/"
									onClick={() => {
										sessionStorage.clear();
									}}
									className={({ isActive }) =>
										`flex items-center py-3 px-5 rounded-lg transition duration-300 ${
											isActive
												? "bg-orange-800 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-5 h-5 mr-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17 9l4 4m0 0l-4 4m4-4H7"
										/>
									</svg>
									Logout
								</NavLink>
							</li>
						</ul>
					</div>
				</div>

				<Routes>
					<Route index path="/dashboard" element={<Dashboard />} />
					<Route path="/inventory" element={<Inventory />} />
					<Route path="/history" element={<OrderHistory />} />
					<Route path="/feedback" element={<AllFeedback />} />
				</Routes>
			</div>

			<ToastContainer />
		</>
	);
}
