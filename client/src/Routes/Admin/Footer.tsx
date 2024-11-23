import React from "react";

function Footer() {
	return (
		<footer className="bg-orange-500 text-white py-6">
			<div className="container mx-auto px-4 flex flex-col items-center text-center">
				{/* Footer content */}
				<p className="text-sm">
					&copy; 2024 721 Sportswear. All Rights Reserved.
				</p>

				{/* Links (Optional) */}
				<div className="mt-4 space-x-6">
					<a href="#" className="hover:text-gray-200">
						Privacy Policy
					</a>
					<a href="#" className="hover:text-gray-200">
						Terms of Service
					</a>
					<a href="#" className="hover:text-gray-200">
						Contact Us
					</a>
				</div>

				{/* Additional Information Links */}
				<div className="mt-6 space-x-6">
					<a href="#" className="hover:text-gray-200">
						About Us
					</a>
					<a href="#" className="hover:text-gray-200">
						FAQ
					</a>
					<a href="#" className="hover:text-gray-200">
						Help
					</a>
				</div>

				{/* Social Media Links */}
				<div className="mt-6 space-x-6">
					<a href="#" className="hover:text-gray-200">
						Facebook
					</a>
					<a href="#" className="hover:text-gray-200">
						Instagram
					</a>
					<a href="#" className="hover:text-gray-200">
						Twitter
					</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
