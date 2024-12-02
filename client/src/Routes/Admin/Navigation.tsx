import React, { useState } from "react";
import { FaShoppingCart, FaUserCircle, FaTshirt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const image = require("../../Assets/icon.jpeg");

function Navigation({ setUser, user }) {
	const navigate = useNavigate();
	const [profileClicked, setProfileClicked] = useState(false);
	const [isProfileHovered, setProfileHovered] = useState(false);

	return (
		<header className="bg-orange-500 text-white p-2 px-5 lg:px-20 flex justify-between items-center shadow-lg">
			<div className="flex items-center space-x-3">
				<img
					src={image}
					alt="Custom Icon"
					className="w-8 h-8 object-contain"
				/>
				<div className="text-2xl font-bold text-gray-800">
					<Link to="/" className="flex items-center">
						721&nbsp;
						<span className="text-white">{` `}Sportswear</span>
					</Link>
				</div>
			</div>
			<div className="flex items-center space-x-6">
				<button
					className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
					onClick={() => navigate(`/customize-templates`)}
				>
					Create Design
				</button>
				<Link to="/cart" className="text-lg hover:text-gray-200">
					<FaShoppingCart className="w-6 h-6 text-gray-800" />
				</Link>

				{/* Profile Icon with Hover Dropdown */}
				<div
					className="relative"
					onMouseEnter={() => setProfileHovered(true)}
					onMouseLeave={() => setProfileHovered(false)}
					onClick={() => setProfileClicked(!profileClicked)}
				>
					<FaUserCircle className="w-6 h-6 text-gray-800 cursor-pointer" />
					{(isProfileHovered || profileClicked) && (
						<div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg text-gray-800 z-50">
							{Object.keys(user).length ? (
								<>
									<Link
										to="/account"
										className="block px-4 py-2 hover:bg-gray-200"
									>
										Account Profile
									</Link>
									<Link
										to="/history"
										className="block px-4 py-2 hover:bg-gray-200"
									>
										Order History
									</Link>
									<Link
										to="/"
										className="block px-4 py-2 hover:bg-gray-200"
										onClick={() => {
											localStorage.removeItem("user");
											setUser({});
											navigate("/");
											toast.success(
												"You have been logged out.",
												{ position: "top-center" }
											);
										}}
									>
										Logout
									</Link>
								</>
							) : (
								<>
									<Link
										to="/login"
										className="block px-4 py-2 hover:bg-gray-200"
									>
										Login
									</Link>
									<Link
										to="/register"
										className="block px-4 py-2 hover:bg-gray-200"
									>
										Register
									</Link>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

export default Navigation;
