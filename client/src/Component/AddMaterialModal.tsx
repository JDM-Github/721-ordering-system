import React, { useState } from "react";

const MaterialsModal = ({ isOpen, onClose, material, onSave }) => {
	const [name, setName] = useState(material ? material.name : "");
	const [quantity, setQuantity] = useState(material ? material.quantity : 0);
	const [price, setPrice] = useState(material ? material.price : 0.0);
	const [archived, setArchived] = useState(
		material ? material.archived : false
	);

	const handleSave = () => {
		const updatedMaterial = {
			name,
			quantity,
			price,
			archived,
		};
		onSave(updatedMaterial);
		onClose();
	};

	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white p-6 rounded-lg shadow-lg w-96">
				<h2 className="text-2xl font-semibold mb-4">
					{material ? "Edit Material" : "Add New Material"}
				</h2>
				<div className="space-y-4">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700"
						>
							Material Name
						</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Enter material name"
						/>
					</div>

					<div>
						<label
							htmlFor="quantity"
							className="block text-sm font-medium text-gray-700"
						>
							Quantity
						</label>
						<input
							type="number"
							id="quantity"
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Enter quantity"
						/>
					</div>

					<div>
						<label
							htmlFor="price"
							className="block text-sm font-medium text-gray-700"
						>
							Price
						</label>
						<input
							type="number"
							id="price"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Enter price"
						/>
					</div>
        
					<div className="flex justify-end space-x-4 mt-4">
						<button
							onClick={onClose}
							className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
						>
							Cancel
						</button>
						<button
							onClick={handleSave}
							className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MaterialsModal;
