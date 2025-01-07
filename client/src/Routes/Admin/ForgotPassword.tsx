import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";

const ForgotPassword = () => {
	const navigate = useNavigate();
	interface FormForgotPassword {
		emailOrUsername: string;
		verificationCode: string;
		newPassword: string;
		confirmPassword: string;
	}

	const [formData, setFormData] = useState<FormForgotPassword>({
		emailOrUsername: "",
		verificationCode: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const validate = (): boolean => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.emailOrUsername)
			newErrors.emailOrUsername = "Email is required";
		if (!formData.verificationCode)
			newErrors.verificationCode = "Verification code is required";
		if (!formData.newPassword)
			newErrors.newPassword = "New password is required";
		if (!formData.confirmPassword)
			newErrors.confirmPassword = "Confirm password is required";


		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

    const sendVerificationCode = async () => {
        const pendingToastId = toast.loading("Sending verification code...", {
            position: "top-center",
        });
        try {
			const data = await RequestHandler.handleRequest(
				"post",
				`user/send-forgot-code`,
				{
					email: formData.emailOrUsername,
				}
			);
			if (data.success === false) {
				toast.update(pendingToastId, {
					render: data.message ?? "Sending verification code error.",
					type: "error",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
			} else {
				toast.update(pendingToastId, {
					render: "Verififcation code sent successfully!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
			}
		} catch (error) {
			toast.update(pendingToastId, {
				render: `An error occurred while logging in. ${error}`,
				type: "error",
				isLoading: false,
				autoClose: 3000,
				position: "top-center",
			});
		}
    }

	const forgotPassword = async () => {
		const pendingToastId = toast.loading("Reseting account password...", {
			position: "top-center",
		});

		try {
			const data = await RequestHandler.handleRequest(
				"post",
				`user/reset-password`,
				{
					email: formData.emailOrUsername,
					verificationCode: formData.verificationCode,
					newPassword: formData.newPassword,
					confirmPassword: formData.confirmPassword,
				}
			);

			if (data.success === false) {
				toast.update(pendingToastId, {
					render: data.message ?? "Error reseting.",
					type: "error",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
			} else {
				toast.update(pendingToastId, {
					render: "Reset password successfully!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
                navigate("/login");
			}
		} catch (error) {
			toast.update(pendingToastId, {
				render: `An error occurred while logging in. ${error}`,
				type: "error",
				isLoading: false,
				autoClose: 3000,
				position: "top-center",
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			await forgotPassword();
		}
	};

	return (
		<div className="min-h-[80vh] flex justify-center items-center bg-gray-100 py-20">
			<div className="w-4/5 sm:w-1/3 bg-white p-6 rounded-lg shadow-lg">
				<h2 className="text-3xl font-bold text-center text-orange-500 mb-6">
					Forgot Password
				</h2>

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							htmlFor="emailOrUsername"
							className="block text-gray-700"
						>
							Email
						</label>
						<input
							type="text"
							id="emailOrUsername"
							name="emailOrUsername"
							value={formData.emailOrUsername}
							onChange={handleChange}
							className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						{errors.emailOrUsername && (
							<p className="text-red-500 text-sm">
								{errors.emailOrUsername}
							</p>
						)}
					</div>

					<div className="mb-4">
						<label
							htmlFor="verificationCode"
							className="block text-gray-700"
						>
							Verification Code
						</label>
						<input
							type="text"
							id="verificationCode"
							name="verificationCode"
							value={formData.verificationCode}
							onChange={handleChange}
							className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						{errors.verificationCode && (
							<p className="text-red-500 text-sm">
								{errors.verificationCode}
							</p>
						)}
					</div>

					<div className="mb-4">
						<label
							htmlFor="newPassword"
							className="block text-gray-700"
						>
							New Password
						</label>
						<input
							type="password"
							id="newPassword"
							name="newPassword"
							value={formData.newPassword}
							onChange={handleChange}
							className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						{errors.newPassword && (
							<p className="text-red-500 text-sm">
								{errors.newPassword}
							</p>
						)}
						<p className="text-gray-500 text-sm mt-1">
							Password must be at least 8 characters, contain 1
							uppercase letter, 1 number, and 1 special character.
						</p>
					</div>

					<div className="mb-4">
						<label
							htmlFor="confirmPassword"
							className="block text-gray-700"
						>
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						{errors.confirmPassword && (
							<p className="text-red-500 text-sm">
								{errors.confirmPassword}
							</p>
						)}
					</div>

					<button
						type="submit"
						className="w-full bg-orange-500 text-white py-3 mb-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
					>
						Forgot Password
					</button>
					<button
						type="button"
						className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
						onClick={sendVerificationCode}
					>
						Send Password Verification Code
					</button>
				</form>

				<div className="mt-4 text-center">
					<p className="text-sm">
						No account?{" "}
						<Link
							to="/register"
							className="text-orange-500 hover:text-orange-600"
						>
							Register
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
