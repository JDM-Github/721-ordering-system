import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";

const Verify = () => {
	const navigate = useNavigate();
	interface FormVerify {
		emailOrUsername: string;
		verificationCode: string;
	}

	const [formData, setFormData] = useState<FormVerify>({
		emailOrUsername: "",
		verificationCode: "",
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
				`user/send-verification`,
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

	const verify = async () => {
		const pendingToastId = toast.loading("Verifying account...", {
			position: "top-center",
		});

		try {
			const data = await RequestHandler.handleRequest(
				"post",
				`user/verify`,
				{
					email: formData.emailOrUsername,
					verificationCode: formData.verificationCode,
				}
			);

			if (data.success === false) {
				toast.update(pendingToastId, {
					render: data.message ?? "Error logging in.",
					type: "error",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
			} else {
				toast.update(pendingToastId, {
					render: "Verify successfully!",
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
			await verify();
		}
	};

	return (
		<div className="min-h-[80vh] flex justify-center items-center bg-gray-100 py-20">
			<div className="w-4/5 sm:w-1/3 bg-white p-6 rounded-lg shadow-lg">
				<h2 className="text-3xl font-bold text-center text-orange-500 mb-6">
					Verify
				</h2>

				{/* Form for verify */}
				<form onSubmit={handleSubmit}>
					{/* Email or Username input */}
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

					<button
						type="submit"
						className="w-full bg-orange-500 text-white py-3 mb-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
					>
						Verify
					</button>
					<button
						type="button"
						className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
						onClick={sendVerificationCode}
					>
						Send Verification Code
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

export default Verify;
