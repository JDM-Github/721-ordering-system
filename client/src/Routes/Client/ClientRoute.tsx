import React from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Dashboard from "./Dashboard.tsx";
import Inventory from "./Inventory.tsx";
import OrderHistory from "./OrderHistory.tsx";

export default function ClientRoute() {
	return (
		<>
			<div className="min-h-screen bg-gray-100 flex">
				<div className="w-1/4 bg-gradient-to-tl from-orange-500 via-orange-600 to-orange-700 text-white p-6 flex flex-col">
					<div className="flex items-center mb-6">
						<div className="w-12 h-12 bg-white rounded-full flex justify-center items-center">
							<span className="text-3xl font-semibold">A</span>
						</div>
						<div className="ml-4">
							<h2 className="text-xl font-bold">ADMINISTRATOR</h2>
							<p className="text-sm text-gray-200">
								admin@example.com
							</p>
						</div>
					</div>

					<div className="mt-8">
						<h3 className="text-lg font-semibold mb-4">
							Navigation
						</h3>
						<ul className="space-y-4">
							<li>
								<NavLink
									to="/admin/dashboard"
									className={({ isActive }) =>
										`block py-2 px-4 rounded-md transition duration-200 ${
											isActive
												? "bg-orange-700 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
									Dashboard
								</NavLink>
							</li>
							<li>
								<NavLink
									to="inventory"
									className={({ isActive }) =>
										`block py-2 px-4 rounded-md transition duration-200 ${
											isActive
												? "bg-orange-700 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
									Inventory
								</NavLink>
							</li>
							<li>
								<NavLink
									to="history"
									className={({ isActive }) =>
										`block py-2 px-4 rounded-md transition duration-200 ${
											isActive
												? "bg-orange-700 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
									Orders
								</NavLink>
							</li>
							<li>
								<NavLink
									to="/"
									className={({ isActive }) =>
										`block py-2 px-4 rounded-md transition duration-200 ${
											isActive
												? "bg-orange-700 text-white font-semibold"
												: "hover:bg-orange-700 hover:text-white"
										}`
									}
								>
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
				</Routes>
			</div>

			<ToastContainer />
		</>
	);
}
