import React, { useState } from "react";
import { Link } from "react-router-dom";

interface FormRegister {
	firstName: string;
	lastName: string;
	mi: string;
	address: string;
	contactNo: string;
	email: string;
	username: string;
	password: string;
	confirmPassword: string;
}

interface FormErrors {
	[key: string]: string;
}

const Register: React.FC = () => {
	const [formData, setFormData] = useState<FormRegister>({
		firstName: "",
		lastName: "",
		mi: "",
		address: "",
		contactNo: "",
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState<FormErrors>({});

	// Handle form input changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	// Validate form fields and set errors
	const validate = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.firstName) newErrors.firstName = "First Name is required";
		if (!formData.lastName) newErrors.lastName = "Last Name is required";
		if (!formData.mi) newErrors.mi = "M.I is required";
		if (!formData.address) newErrors.address = "Address is required";
		if (!formData.contactNo)
			newErrors.contactNo = "Contact No. is required";
		if (!formData.email) newErrors.email = "Email is required";
		if (!formData.username) newErrors.username = "Username is required";
		if (!formData.password) newErrors.password = "Password is required";
		if (formData.password !== formData.confirmPassword)
			newErrors.confirmPassword = "Passwords do not match";

		setErrors(newErrors);

		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			console.log("Form submitted:", formData);
		}
	};

	return (
		<div className="flex justify-center items-center bg-gray-100 py-8">
			<div className="w-4/5 sm:w-2/5 bg-white p-6 rounded-lg shadow-lg">
				<h2 className="text-3xl font-bold text-center text-orange-500 mb-2">
					Register
				</h2>
				<span className="block text-center text-sm font-bold text-gray-500 mb-6">
					Enter your details to register.
				</span>
				{/* <hr className="my-3" /> */}
				<form onSubmit={handleSubmit}>
					{/* First Name, Last Name, M.I. in one line */}
					<div className="mb-4 flex space-x-4">
						<div className="w-1/3">
							<label
								htmlFor="firstName"
								className="block text-gray-700"
							>
								First Name
							</label>
							<input
								type="text"
								id="firstName"
								name="firstName"
								value={formData.firstName}
								onChange={handleChange}
								className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
							/>
							{errors.firstName && (
								<p className="text-red-500 text-sm">
									{errors.firstName}
								</p>
							)}
						</div>
						<div className="w-1/3">
							<label
								htmlFor="lastName"
								className="block text-gray-700"
							>
								Last Name
							</label>
							<input
								type="text"
								id="lastName"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
								className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
							/>
							{errors.lastName && (
								<p className="text-red-500 text-sm">
									{errors.lastName}
								</p>
							)}
						</div>
						<div className="w-1/3">
							<label htmlFor="mi" className="block text-gray-700">
								M.I.
							</label>
							<input
								type="text"
								id="mi"
								name="mi"
								value={formData.mi}
								onChange={handleChange}
								className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
							/>
							{errors.mi && (
								<p className="text-red-500 text-sm">
									{errors.mi}
								</p>
							)}
						</div>
					</div>

					{/* Address and Contact No. in one line */}
					<div className="mb-4 flex space-x-4">
						<div className="w-1/2">
							<label
								htmlFor="address"
								className="block text-gray-700"
							>
								Address
							</label>
							<input
								type="text"
								id="address"
								name="address"
								value={formData.address}
								onChange={handleChange}
								className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
							/>
							{errors.address && (
								<p className="text-red-500 text-sm">
									{errors.address}
								</p>
							)}
						</div>
						<div className="w-1/2">
							<label
								htmlFor="contactNo"
								className="block text-gray-700"
							>
								Contact No.
							</label>
							<input
								type="text"
								id="contactNo"
								name="contactNo"
								value={formData.contactNo}
								onChange={handleChange}
								className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
							/>
							{errors.contactNo && (
								<p className="text-red-500 text-sm">
									{errors.contactNo}
								</p>
							)}
						</div>
					</div>

					{/* Email Input */}
					<div className="mb-4">
						<label htmlFor="email" className="block text-gray-700">
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						{errors.email && (
							<p className="text-red-500 text-sm">
								{errors.email}
							</p>
						)}
					</div>

					{/* Username Input */}
					<div className="mb-4">
						<label
							htmlFor="username"
							className="block text-gray-700"
						>
							Username
						</label>
						<input
							type="text"
							id="username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						{errors.username && (
							<p className="text-red-500 text-sm">
								{errors.username}
							</p>
						)}
					</div>

					{/* Password Input */}
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

					{/* Confirm Password Input */}
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

					{/* Register Button */}
					<button
						type="submit"
						className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
					>
						Register
					</button>
				</form>

				{/* Already have an account? Login Link */}
				<div className="mt-4 text-center">
					<p className="text-sm">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-orange-500 hover:text-orange-600"
						>
							Login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Register;
