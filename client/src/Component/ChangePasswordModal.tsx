import React, { useState } from "react";
import { toast } from "react-toastify";
import RequestHandler from "../Functions/RequestHandler";

function ChangePasswordModal({ onClose, userData, setUserData }) {
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleChange = (e) => {
		setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
	};

	const isPasswordStrong = (password) => {
		const strongPasswordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
		return strongPasswordRegex.test(password);
	};

	const handleSave = async () => {
		if (passwordData.newPassword === passwordData.confirmPassword) {
			if (!isPasswordStrong(passwordData.newPassword)) {
				toast.error(
					"Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
				);
				return;
			}
			const pendingToastId = toast.loading("Updating your account...");
			try {
				const data = await RequestHandler.handleRequest(
					"post",
					`user/edit-password`,
					{
						id: userData.id,
						oldPass: passwordData.currentPassword,
						password: passwordData.newPassword,
					}
				);

				if (data.success === false) {
					toast.update(pendingToastId, {
						render: data.message ?? "Error updating user password.",
						type: "error",
						isLoading: false,
						autoClose: 3000,
					});
				} else {
					localStorage.setItem("user", JSON.stringify(data.user));
					setUserData(data.user);
					toast.update(pendingToastId, {
						render: "Your account password was updated successfully!",
						type: "success",
						isLoading: false,
						autoClose: 3000,
					});
				}
			} catch (error) {
				toast.update(pendingToastId, {
					render: `An error occurred: ${error.message}`,
					type: "error",
					isLoading: false,
					autoClose: 3000,
				});
			}
			onClose();
		} else {
			toast.error("New passwords do not match.");
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
			<div className="bg-white rounded-lg shadow-lg p-6 w-96">
				<h2 className="text-2xl font-semibold mb-4">Change Password</h2>
				<div className="space-y-4">
					<div className="relative">
						<input
							name="currentPassword"
							type={showCurrentPassword ? "text" : "password"}
							placeholder="Current Password"
							onChange={handleChange}
							className="w-full p-3 border rounded-lg"
						/>
						<button
							type="button"
							className="absolute right-3 top-3 text-gray-500"
							onClick={() =>
								setShowCurrentPassword(!showCurrentPassword)
							}
						>
							{showCurrentPassword ? "Hide" : "Show"}
						</button>
					</div>

					<div className="relative">
						<input
							name="newPassword"
							type={showNewPassword ? "text" : "password"}
							placeholder="New Password"
							onChange={handleChange}
							className="w-full p-3 border rounded-lg"
						/>
						<button
							type="button"
							className="absolute right-3 top-3 text-gray-500"
							onClick={() => setShowNewPassword(!showNewPassword)}
						>
							{showNewPassword ? "Hide" : "Show"}
						</button>
					</div>

					<div className="relative">
						<input
							name="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
							placeholder="Confirm New Password"
							onChange={handleChange}
							className="w-full p-3 border rounded-lg"
						/>
						<button
							type="button"
							className="absolute right-3 top-3 text-gray-500"
							onClick={() =>
								setShowConfirmPassword(!showConfirmPassword)
							}
						>
							{showConfirmPassword ? "Hide" : "Show"}
						</button>
					</div>
				</div>
				<div className="flex justify-end space-x-4 mt-6">
					<button
						onClick={onClose}
						className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}

export default ChangePasswordModal;
