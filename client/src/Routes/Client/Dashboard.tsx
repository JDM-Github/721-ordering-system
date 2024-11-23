import React from "react";

export default function Dashboard() {
	return (
		<>
			<div className="w-3/4 bg-white p-8 overflow-y-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">
						Dashboard
					</h1>
					<p className="text-gray-600 mt-2">
						Welcome to the Admin Dashboard
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200">
						<h3 className="text-lg font-semibold text-gray-800">
							Total Orders
						</h3>
						<p className="text-2xl font-bold text-gray-600 mt-2">
							256
						</p>
						<p className="text-sm text-gray-500 mt-2">This month</p>
					</div>

					{/* Inventory Card */}
					<div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200">
						<h3 className="text-lg font-semibold text-gray-800">
							Inventory
						</h3>
						<p className="text-2xl font-bold text-gray-600 mt-2">
							1,245 Items
						</p>
						<p className="text-sm text-gray-500 mt-2">In Stock</p>
					</div>

					{/* Orders Card */}
					<div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200">
						<h3 className="text-lg font-semibold text-gray-800">
							New Orders
						</h3>
						<p className="text-2xl font-bold text-gray-600 mt-2">
							45
						</p>
						<p className="text-sm text-gray-500 mt-2">
							Waiting to be processed
						</p>
					</div>
				</div>
			</div>
			;
		</>
	);
}
