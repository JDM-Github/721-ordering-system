import React, { useState } from "react";

function EditModal({ user, setUser, onClose }) {
	const [formData, setFormData] = useState(user);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSave = () => {
		setUser(formData);
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
			<div className="bg-white rounded-lg shadow-lg p-6 w-96">
				<h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
				<div className="space-y-4">
					<input
						name="firstname"
						value={formData.firstname}
						onChange={handleChange}
						placeholder="First Name"
						className="w-full p-2 border rounded"
					/>
					<input
						name="middlename"
						value={formData.middlename}
						onChange={handleChange}
						placeholder="Middle Name"
						className="w-full p-2 border rounded"
					/>
					<input
						name="lastname"
						value={formData.lastname}
						onChange={handleChange}
						placeholder="Last Name"
						className="w-full p-2 border rounded"
					/>
					<input
						name="address"
						value={formData.address}
						onChange={handleChange}
						placeholder="Address"
						className="w-full p-2 border rounded"
					/>
					<input
						name="contactNo"
						value={formData.contactNo}
						onChange={handleChange}
						placeholder="Contact No."
						className="w-full p-2 border rounded"
					/>
					<input
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="Email"
						className="w-full p-2 border rounded"
					/>
				</div>
				<div className="flex justify-end space-x-4 mt-4">
					<button
						onClick={onClose}
						className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}

export default EditModal;
