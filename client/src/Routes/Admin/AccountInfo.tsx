import React, { useState, useEffect } from "react";
import ChangePasswordModal from "../../Component/ChangePasswordModal.tsx";
import RequestHandler from "../../Functions/RequestHandler.js";
import { toast } from "react-toastify";
// const userData = {
// 	profileImage: "https://via.placeholder.com/150",
// 	firstName: "John",
// 	middleName: "A.",
// 	lastName: "Doe",
// 	address: "1234 Street, City, Country",
// 	contactNumber: "+123456789",
// 	email: "johndoe@example.com",
// 	username: "johndoe123",
// };

function AccountInfo({ userData, setUserData }) {
	// const [user, setUser] = useState(userData);

	const [user, setUser] = useState<any>(userData);
	const [formData, setFormData] = useState(userData);
	const [originalFormData, setOriginalFormData] = useState(userData);
	useEffect(() => {
		const userDetails = JSON.parse(localStorage.getItem("user") ?? "{}");

		setUser(userDetails);
		setFormData(userDetails);
		setOriginalFormData(userDetails);
	}, []);

	const [isEditing, setIsEditing] = useState(false);
	const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSaveChanges = async () => {
		setUser(formData);
		setOriginalFormData(formData);
		setIsEditing(false);

		const body = {
			id: user.id,
			username: formData.username,
			firstName: formData.firstName,
			lastName: formData.lastName,
			middleName: formData.middleName,
			address: formData.address,
			contactNumber: formData.contactNumber,
		};

		const pendingToastId = toast.loading("Updating your account...", {
			position: "top-center",
		});
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				`user/edit-account`,
				body
			);

			if (data.success === false) {
				toast.update(pendingToastId, {
					render: data.message ?? "Error updating user.",
					type: "error",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
			} else {
				localStorage.setItem("user", JSON.stringify(data.user));
				setUserData(data.user);
				toast.update(pendingToastId, {
					render: "Your account was updated successfully!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
			}
		} catch (error) {
			toast.update(pendingToastId, {
				render: `An error occurred: ${error.message}`,
				type: "error",
				isLoading: false,
				autoClose: 3000,
				position: "top-center",
			});
		}
	};

	const handleCancelEdit = () => {
		setFormData(originalFormData);
		setIsEditing(false);
	};

	const handleEditClick = () => {
		setIsEditing(true);
		setOriginalFormData(formData);
	};

	return (
		<div className="container mx-auto  max-w-7xl px-6 py-8">
			<div className="bg-white rounded-lg shadow-lg p-10">
				<h2 className="text-3xl font-bold mb-6 text-orange-500">
					Account Information
				</h2>
				<hr className="mb-8 border-gray-300" />
				<div className="flex flex-col lg:flex-row">
					<div className="flex flex-col items-center justify-center lg:items-center lg:w-1/3 mb-8 lg:mb-0">
						<img
							src={user.profileImage}
							alt="Profile"
							className="w-80 h-80 rounded-full object-cover mb-4"
						/>
						{isEditing ? (
							<button
								onClick={handleCancelEdit}
								className="bg-red-500 text-white py-3 px-8 rounded-lg hover:bg-red-600 text-lg mb-4 w-full"
							>
								Cancel Editing
							</button>
						) : (
							<button
								onClick={handleEditClick}
								className="bg-red-500 text-white py-3 px-8 rounded-lg hover:bg-red-600 text-lg mb-4 w-full"
							>
								Edit Profile
							</button>
						)}

						{isEditing ? (
							<button
								onClick={handleSaveChanges}
								className="bg-blue-500 text-white py-3 px-10 rounded-lg hover:bg-blue-600 text-lg w-full"
							>
								Save Changes
							</button>
						) : (
							<button
								onClick={() => setPasswordModalOpen(true)}
								className="bg-orange-500 text-white py-3 px-8 rounded-lg hover:bg-orange-600 text-lg w-full"
							>
								Change Password
							</button>
						)}
					</div>

					<div className="flex-1 lg:pl-10">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{[
								{ label: "First Name", name: "firstName" },
								{ label: "Middle Name", name: "middleName" },
								{ label: "Last Name", name: "lastName" },
								{ label: "Address", name: "address" },
								{ label: "Contact No", name: "contactNumber" },
								{ label: "Email", name: "email" },
								{ label: "Username", name: "username" },
							].map((field) => (
								<div key={field.name} className="flex flex-col">
									<label className="text-lg text-gray-600 mb-2">
										{field.label}
									</label>
									<input
										type="text"
										name={field.name}
										value={formData[field.name]}
										onChange={handleInputChange}
										disabled={
											!isEditing ||
											field.label === "Email"
										}
										className={`p-4 border rounded-lg text-lg ${
											!isEditing ||
											field.label === "Email"
												? "border-gray-300"
												: "bg-gray-100 border-transparent"
										}`}
									/>
								</div>
							))}
						</div>

					</div>
				</div>
			</div>

			{isPasswordModalOpen && (
				<ChangePasswordModal
					userData={userData}
					setUserData={setUserData}
					onClose={() => setPasswordModalOpen(false)}
				/>
			)}
		</div>
	);
}

export default AccountInfo;
