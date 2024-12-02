import React from "react";
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

// Register Chart.js components
ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale
);

export default function Dashboard() {
	// Fake data for the Pie chart
	const pieData = {
		labels: ["Completed", "Pending", "Canceled"],
		datasets: [
			{
				data: [50, 30, 20],
				backgroundColor: ["#FF9800", "#FFEB3B", "#f44336"], // Orange shades for theme
				hoverBackgroundColor: ["#FB8C00", "#FBC02D", "#D32F2F"],
			},
		],
	};

	// Fake data for the Bar chart
	const barData = {
		labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
		datasets: [
			{
				label: "Orders Processed",
				data: [30, 45, 25, 60],
				backgroundColor: "#FF9800",
				borderRadius: 5,
				borderColor: "#FB8C00",
				borderWidth: 1,
			},
		],
	};

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
							256
						</p>
						<p className="text-sm text-white mt-2">This month</p>
					</div>

					{/* Inventory Card */}
					<div className="bg-gradient-to-r from-yellow-500 to-orange-400 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
						<h3 className="text-lg font-semibold text-white">
							Inventory
						</h3>
						<p className="text-3xl font-bold text-white mt-2">
							1,245 Items
						</p>
						<p className="text-sm text-white mt-2">In Stock</p>
					</div>

					{/* New Orders Card */}
					<div className="bg-gradient-to-r from-green-500 to-lime-400 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
						<h3 className="text-lg font-semibold text-white">
							New Orders
						</h3>
						<p className="text-3xl font-bold text-white mt-2">45</p>
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
						<div className="w-full h-full p-4 rounded-lg shadow-lg">
							<h3 className="text-xl font-semibold text-gray-800 mb-4">
								Order Status Analysis
							</h3>
							<Pie
								data={pieData}
								options={{
									responsive: true,
									maintainAspectRatio: false,
								}}
							/>
						</div>
					</div>

					{/* Bar Chart */}
					<div className="w-full lg:w-1/2 p-4 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden">
						<div className="w-full h-full p-4 rounded-lg shadow-lg">
							<h3 className="text-xl font-semibold text-gray-800 mb-4">
								Orders Processed Over Time
							</h3>
							<Bar data={barData} options={options} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
