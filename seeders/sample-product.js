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
					isCustomizable: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					productName: "Jacket",
					productImages: [
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733819801/whxiqxjg9iz9jomo5pad.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733819800/z6ciqgmrfbthtqdswcdw.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733819802/r95oxynwwzo3acmzwkdw.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733819803/puhiiobphrrknqppflhb.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733819804/ap5usjib4r6h1zgcxpht.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733819804/jlunmhlosuzgpbytbbko.png",
					],
					productAllNames: [
						"Front",
						"Back",
						"Hood",
						"Left Sleeve",
						"Pocket",
						"Right Sleeve",
					],
					price: 19.0,
					size: ["S", "M", "L", "XL"],
					stocks: 100,
					description: "A fully customizable Jacket.",
					status: "Available",
					isCustomizable: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					productName: "Sando",
					productImages: [
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733841849/hxdwxmqbs0o2fg87ciki.png",
						"https://res.cloudinary.com/djheiqm47/image/upload/v1733841848/tmmxziecda3yx9v15ya7.png",
					],
					productAllNames: ["Front", "Back"],
					price: 999.0,
					size: ["S", "M", "L", "XL"],
					stocks: 100,
					description: "A fully customizable Jacket.",
					status: "Available",
					isCustomizable: true,
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
					isCustomizable: false,
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
