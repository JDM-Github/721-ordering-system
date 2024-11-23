const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("./models");
const router = express.Router();
const { Op } = require("sequelize");

router.post("/register", async (req, res) => {
	try {
		const {
			username,
			email,
			password,
			firstName,
			lastName,
			middleName,
			address,
			contactNumber,
		} = req.body;

		const existingUser = await User.findOne({
			where: {
				[Op.or]: [{ username }, { email }],
			},
		});

		if (existingUser) {
			return res.send({
				success: false,
				message: "Username or email already in use.",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			username,
			email,
			password: hashedPassword,
			firstName,
			lastName,
			middleName,
			address,
			contactNumber,
		});

		return res.send({
			success: true,
			message: "User created successfully",
			userId: newUser,
		});
	} catch (error) {
		console.error(error);
		return res.send({
			success: false,
			message: "Error creating user",
			error,
		});
	}
});

router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({
			where: {
				[Op.or]: [{ username }, { email: username }],
			},
		});
		if (!user) {
			return res.send({ success: false, message: "User not found" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.send({ success: false, message: "Invalid password" });
		}

		return res.status(200).json({
			message: "Login successful",
			success: true,
			user,
		});
	} catch (error) {
		console.error(error);
		return res.send({ success: false, message: "Error logging in", error });
	}
});

router.post("/edit-account", async (req, res) => {
	try {
		const {
			id,
			username,
			firstName,
			lastName,
			middleName,
			address,
			contactNumber,
		} = req.body;

		const existingUser = await User.findByPk(id);

		if (!existingUser) {
			return res.send({
				success: false,
				message: "User does not exists",
			});
		}
		await existingUser.update({
			username,
			firstName,
			lastName,
			middleName,
			address,
			contactNumber,
		});

		return res.send({
			success: true,
			message: "User updated successfully",
			user: existingUser,
		});
	} catch (error) {
		console.error(error);
		return res.send({
			success: false,
			message: "Error updating user",
			error,
		});
	}
});

router.post("/edit-password", async (req, res) => {
	try {
		const { id, oldPass, password } = req.body;
		const existingUser = await User.findByPk(id);

		if (!existingUser) {
			return res.send({
				success: false,
				message: "User does not exists",
			});
		}
		const hashedOldPassword = await bcrypt.hash(oldPass, 10);
		if (existingUser.password !== hashedOldPassword)
			return res.send({
				success: false,
				message: "User account current password does not match.",
			});

		const hashedPassword = await bcrypt.hash(password, 10);
		await existingUser.update({
			password: hashedPassword,
		});
		return res.send({
			success: true,
			message: "User updated successfully",
			user: existingUser,
		});
	} catch (error) {
		console.error(error);
		return res.send({
			success: false,
			message: "Error updating user password",
			error,
		});
	}
});

module.exports = router;
