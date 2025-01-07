import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";

const Login = ({ setUser }) => {
	const navigate = useNavigate();
	interface FormLogin {
		emailOrUsername: string;
		password: string;
	}

	const [formData, setFormData] = useState<FormLogin>({
		emailOrUsername: "",
		password: "",
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
			newErrors.emailOrUsername = "Email or Username is required";
		if (!formData.password) newErrors.password = "Password is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const login = async () => {
		const pendingToastId = toast.loading("Logging in...", {
			position: "top-center",
		});

		try {
			const data = await RequestHandler.handleRequest(
				"post",
				`user/login`,
				{
					username: formData.emailOrUsername,
					password: formData.password,
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
				localStorage.setItem("user", JSON.stringify(data.user));
				setUser(data.user);

				toast.update(pendingToastId, {
					render: "Login successful!",
					type: "success",
					isLoading: false,
					autoClose: 3000,
					position: "top-center",
				});
				navigate("/");
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
			if (
				formData.emailOrUsername === "admin" &&
				formData.password === "admin"
			)
				navigate("/admin/dashboard");
			else {
				await login();
			}
		}
	};

	return (
		<div className="min-h-[80vh] flex justify-center items-center bg-gray-100 py-20">
			<div className="w-4/5 sm:w-1/3 bg-white p-6 rounded-lg shadow-lg">
				<h2 className="text-3xl font-bold text-center text-orange-500 mb-6">
					Login
				</h2>

				{/* Form for login */}
				<form onSubmit={handleSubmit}>
					{/* Email or Username input */}
					<div className="mb-4">
						<label
							htmlFor="emailOrUsername"
							className="block text-gray-700"
						>
							Email or Username
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

					{/* Password input */}
					<div className="mb-4">
						<label
							htmlFor="password"
							className="block text-gray-700"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						{errors.password && (
							<p className="text-red-500 text-sm">
								{errors.password}
							</p>
						)}
					</div>

					{/* Login Button */}
					<button
						type="submit"
						className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
					>
						Login
					</button>
				</form>

				{/* Register Link */}
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

export default Login;
