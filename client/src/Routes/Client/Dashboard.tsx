import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale,
} from "chart.js";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale
);

export default function Dashboard() {
	const navigate = useNavigate();
	const authToken = sessionStorage.getItem("authToken");

	useEffect(() => {
		if (authToken !== "admin-token") {
			toast.error("You are not authorized to view this page.");
			navigate("/?message=invalid-auth");
		}
	}, []);
	const [totalOrders, setTotalOrders] = useState<any>(0);
	const [totalItemsLeft, setTotalItemsLeft] = useState<any>(0);
	const [totalUsers, setTotalUsers] = useState<any>(0);
	const [barLabels, setBarLabels] = useState<any>([]);
	const [pieLabels, setPieLabels] = useState<any>([]);

	const loadRequest = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/get-dashboard"
			);
			if (data.success) {
				setTotalOrders(data.data.totalOrders);
				setTotalItemsLeft(data.data.totalItemsLeft);
				setTotalUsers(data.data.totalUsers);
				setBarLabels(data.data.completedOrdersByWeek);

				setPieLabels(data.data.statusCounts);
			} else {
				toast.error(data.message || "Unable to load order history");
				return;
			}
		} catch (error) {
			toast.error(error.message || "Unable to load order history");
			return;
		}
	};
	useEffect(() => {
		loadRequest();
	}, []);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top",
			},
		},
		scales: {
			x: {
				beginAtZero: true,
			},
		},
	};

	return (
		<>
			<div className="w-5/6 p-4 overflow-y-auto shadow-lg rounded-lg">
				<div className="bg-white shadow-lg rounded-lg p-4 mb-2">
					<h1 className="border-l-4 ps-4 border-orange-500 text-2xl font-semibold text-gray-700">
						ADMIN DASHBOARD
					</h1>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
					<div className="bg-gradient-to-r from-orange-500 to-orange-400 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
						<h3 className="text-lg font-semibold text-white">
							Total Orders
						</h3>
						<p className="text-3xl font-bold text-white mt-2">
							{totalOrders}
						</p>
						<p className="text-sm text-white mt-2">This month</p>
					</div>

					{/* Inventory Card */}
					<div className="bg-gradient-to-r from-yellow-500 to-orange-400 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
						<h3 className="text-lg font-semibold text-white">
							Inventory
						</h3>
						<p className="text-3xl font-bold text-white mt-2">
							{totalItemsLeft} Items
						</p>
						<p className="text-sm text-white mt-2">In Stock</p>
					</div>

					{/* New Orders Card */}
					<div className="bg-gradient-to-r from-green-500 to-lime-400 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
						<h3 className="text-lg font-semibold text-white">
							Total Users
						</h3>
						<p className="text-3xl font-bold text-white mt-2">
							{totalUsers}
						</p>
						<p className="text-sm text-white mt-2">
							Waiting to be processed
						</p>
					</div>
				</div>

				{/* Charts Section */}
				<div
					className="flex flex-col lg:flex-row gap-8"
					style={{ height: "80vh" }}
				>
					{/* Pie Chart */}
					<div className="w-full lg:w-1/2 p-4 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
						<div className="w-full h-full p-16 rounded-lg shadow-lg">
							<h3 className="text-xl font-semibold text-gray-800 mb-4">
								Order Status Analysis
							</h3>
							<Pie
								data={{
									labels: pieLabels.map(
										(item) => item.status
									),
									datasets: [
										{
											data: pieLabels.map(
												(item) => item.count
											),
											backgroundColor: [
												"#FF9800",
												"#FFEB3B",
												"#f44336",
											],
											hoverBackgroundColor: [
												"#FB8C00",
												"#FBC02D",
												"#D32F2F",
											],
										},
									],
								}}
								options={{
									responsive: true,
									maintainAspectRatio: false,
								}}
							/>
						</div>
					</div>

					{/* Bar Chart */}
					<div className="w-full lg:w-1/2 p-4 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
						<div className="w-full h-full p-16 rounded-lg shadow-lg">
							<h3 className="text-xl font-semibold text-gray-800 mb-4">
								Orders Processed Over Time
							</h3>
							<Bar
								className="w-full h-96"
								data={{
									labels: barLabels.map((item) => item.week),
									datasets: [
										{
											label: "Orders Processed",
											data: barLabels.map(
												(item) => item.count
											),
											backgroundColor: "#FF9800",
											borderRadius: 5,
											borderColor: "#FB8C00",
											borderWidth: 1,
										},
									],
								}}
								options={options}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
