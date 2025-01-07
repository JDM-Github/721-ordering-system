"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const hashedPassword = await bcrypt.hash("123", 10);

		return queryInterface.bulkInsert(
			"Users",
			[
				{
					profileImage: "",
					firstName: "John",
					lastName: "Doe",
					middleName: "A.",
					address: "123 Main St, Springfield",
					contactNumber: "1234567890",
					email: "test1@example.com",
					password: hashedPassword,
					username: "test1",
					isVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					profileImage: "",
					firstName: "Jane",
					lastName: "Smith",
					middleName: "B.",
					address: "456 Elm St, Metropolis",
					contactNumber: "0987654321",
					email: "test2@example.com",
					password: hashedPassword,
					username: "test2",
					isVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Users", {
			username: { [Sequelize.Op.in]: ["test1", "test2"] },
		});
	},
};
