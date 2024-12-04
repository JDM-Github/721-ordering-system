"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Products",
			[
				{
					productName: "Jersey Sando",
					productImages: [
						"https://res.cloudinary.com/djheiqm47/image/upload/v1732351893/jersey-sando_k1rsab.png",
					],
					productAllNames: ["Jersey"],
					price: 19.0,
					size: ["S", "M", "L", "XL"],
					stocks: 100,
					description: "A fully customizable Jersey Sando.",
					status: "Available",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					productName: "Jacket",
					productImages: [
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733343511/back-removebg-preview_i3okmw.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733343684/front-removebg-preview_kyehzg.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733343684/left_sleeve-removebg-preview_qczngm.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733343685/right_sleeve-removebg-preview_lw6e9v.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733343684/hood-removebg-preview_af7jbg.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733343684/pocket-removebg-preview_tgllrw.png",
					],
					productAllNames: [
						"Back",
						"Front",
						"Left Sleeve",
						"Right Sleeve",
						"Hood",
						"Pocket",
					],
					price: 19.0,
					size: ["S", "M", "L", "XL"],
					stocks: 100,
					description: "A fully customizable Jacket.",
					status: "Available",
					createdAt: new Date(),
					updatedAt: new Date(),
				},

				{
					productName: "Jersey Short",
					productImages: [
						"https://res.cloudinary.com/djheiqm47/image/upload/v1732352140/jersey-shorts_kalin1.png",
					],
					productAllNames: ["Jersey"],
					price: 19.0,
					size: ["Small", "Medium", "Large"],
					stocks: 50,
					description: "A fully customizable Jersey Short.",
					status: "Available",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// {
				// 	productName: "Custom Hoodie",
				// 	price: 19.0,
				// 	size: ["M", "L", "XL", "XXL"],
				// 	stocks: 75,
				// 	description: "Comfortable hoodies with your design.",
				// 	status: "Unavailable",
				// 	createdAt: new Date(),
				// 	updatedAt: new Date(),
				// },
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Products", null, {});
	},
};
