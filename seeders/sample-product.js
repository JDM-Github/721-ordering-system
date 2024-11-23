"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Products",
			[
				{
					productName: "Jersey Sando",
					productImage:
						"https://res.cloudinary.com/djheiqm47/image/upload/v1732351893/jersey-sando_k1rsab.png",
					price: 19.0,
					size: ["S", "M", "L", "XL"],
					stocks: 100,
					description: "A fully customizable Jersey Sando.",
					status: "Available",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					productName: "Jersey Short",
					productImage:
						"https://res.cloudinary.com/djheiqm47/image/upload/v1732352140/jersey-shorts_kalin1.png",
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
