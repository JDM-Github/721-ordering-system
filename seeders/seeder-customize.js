"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Products",
			[
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
					price: 1.0,
					size: ["S", "M", "L", "XL"],
					stockPerSize: [10, 20, 30, 0],
					stocks: 60,
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
					stockPerSize: [10, 20, 30, 0],
					stocks: 60,
					description: "A fully customizable Jacket.",
					status: "Available",
					isCustomizable: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Products", null, {});
	},
};
