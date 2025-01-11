const express = require("express");
const bcrypt = require("bcryptjs");
const { User, Notification } = require("./models");
const sendEmail = require("./emailSender");
const router = express.Router();
const { Op } = require("sequelize");

// ojiq gmqa cegn vwkz

router.post("/register", async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			middleName,
			email,
			username,
			address,
			contactNumber,
			password,
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

		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(password)) {
			return res.send({
				success: false,
				message:
					"Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			firstName,
			lastName,
			middleName,
			email,
			username,
			address,
			contactNumber,
			password: hashedPassword,
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
		const allUser = await User.findAll();
		console.log(allUser);
		const user = await User.findOne({
			where: {
				[Op.or]: [{ username }, { email: username }],
			},
		});

		if (!user) {
			return res.send({ success: false, message: "User not found" });
		}

		if (!user.isVerified) {
			return res.send({
				success: false,
				message: "Account is not verified",
			});
		}
		if (user.accountLocked && new Date() < new Date(user.accountLocked)) {
			const lockTimeRemaining = Math.floor(
				(new Date(user.accountLocked) - new Date()) / 1000
			);
			return res.send({
				success: false,
				message: `Account is locked. Please try again in ${lockTimeRemaining} seconds.`,
			});
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			const failedAttempts = user.failedAttempt + 1;
			await user.update({ failedAttempt: failedAttempts });

			if (failedAttempts >= 3) {
				const lockDuration = 1 * 60 * 1000;
				await user.update({
					accountLocked: new Date(
						new Date().getTime() + lockDuration
					),
					failedAttempt: 0,
				});
				return res.send({
					success: false,
					message:
						"Account locked due to multiple failed login attempts. Please try again after 1 minute.",
				});
			}
			return res.send({ success: false, message: "Invalid password" });
		}
		await user.update({ failedAttempt: 0, accountLocked: null });
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

router.post("/send-verification", async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({
			where: {
				[Op.or]: [{ email }],
			},
		});

		if (!user) {
			return res.send({ success: false, message: "User not found" });
		}
		if (user.isVerified) {
			return res.send({
				success: false,
				message: "Account already verified",
			});
		}

		const currentTime = new Date();
		const lastSendTime = new Date(user.lastSendVerificationCode);
		const timeDifferenceInSeconds = Math.floor(
			(currentTime - lastSendTime) / 1000
		);
		const cooldownTime = 60;
		if (timeDifferenceInSeconds < cooldownTime) {
			const timeLeft = cooldownTime - timeDifferenceInSeconds;
			return res.send({
				success: false,
				message: `Please wait ${timeLeft} second(s) before requesting another verification code`,
			});
		}

		const verificationCode = Math.floor(
			100000 + Math.random() * 900000
		).toString();

		await sendEmail(
			email,
			"Your Verification Code",
			`Your verification code is ${verificationCode}`,
			`<p>Your verification code is <strong>${verificationCode}</strong></p>`
		);

		await user.update({
			verificationCode,
			lastSendVerificationCode: new Date(),
		});

		return res.status(200).json({
			message: "Verification code sent successfully",
			success: true,
			user,
		});
	} catch (error) {
		console.error(error);
		return res.send({ success: false, message: "Error logging in", error });
	}
});


router.post("/send-forgot-code", async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({
			where: {
				[Op.or]: [{ email }],
			},
		});

		if (!user) {
			return res.send({ success: false, message: "User not found" });
		}

		const currentTime = new Date();
		const lastSendTime = new Date(user.lastSendPasswordVerificationCode);
		const timeDifferenceInSeconds = Math.floor(
			(currentTime - lastSendTime) / 1000
		);
		const cooldownTime = 60;
		if (timeDifferenceInSeconds < cooldownTime) {
			const timeLeft = cooldownTime - timeDifferenceInSeconds;
			return res.send({
				success: false,
				message: `Please wait ${timeLeft} second(s) before requesting another password verification code`,
			});
		}

		const verificationCode = Math.floor(
			100000 + Math.random() * 900000
		).toString();

		await sendEmail(
			email,
			"Your Password Verification Code",
			`Your password verification code is ${verificationCode}`,
			`<p>Your password verification code is <strong>${verificationCode}</strong></p>`
		);

		await user.update({
			forgotPasswordCode,
			lastSendPasswordVerificationCode: new Date(),
		});

		return res.status(200).json({
			message: "Password verification code sent successfully",
			success: true,
			user,
		});
	} catch (error) {
		console.error(error);
		return res.send({ success: false, message: "Error logging in", error });
	}
});

router.post("/reset-password", async (req, res) => {
	try {
		const { email, verificationCode, newPassword, confirmPassword } = req.body;

		if (newPassword !== confirmPassword) {
			return res.send({
				success: false,
				message: "New password and confirmation password do not match",
			});
		}

		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(newPassword)) {
			return res.send({
				success: false,
				message:
					"Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
			});
		}
	
		const user = await User.findOne({
			where: {
				[Op.or]: [{ email }],
			},
		});

		if (!user) {
			return res.send({ success: false, message: "User not found" });
		}

		if (user.forgotPasswordCode !== verificationCode) {
			return res.send({
				success: false,
				message: "Invalid password verification code",
			});
		}

		const codeExpiryTime = new Date(user.lastSendPasswordVerificationCode);
		codeExpiryTime.setMinutes(codeExpiryTime.getMinutes() + 10);
		if (new Date() > codeExpiryTime) {
			return res.send({
				success: false,
				message:
					"Password verification code has expired. Please request a new one.",
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await user.update({
			password: hashedPassword,
			forgotPasswordCode: "",
			lastSendPasswordVerificationCode: null,
		});

		return res.status(200).json({
			message: "Account password has been reseted!",
			success: true,
			user,
		});
	} catch (error) {
		console.error(error);
		return res.send({
			success: false,
			message: "Error reseting account",
			error,
		});
	}
});

router.post("/verify", async (req, res) => {
	try {
		const { email, verificationCode } = req.body;
		const user = await User.findOne({
			where: {
				[Op.or]: [{ email }],
			},
		});

		if (!user) {
			return res.send({ success: false, message: "User not found" });
		}

		if (user.isVerified) {
			return res.send({
				success: false,
				message: "Account already verified",
			});
		}
		if (user.verificationCode !== verificationCode) {
			return res.send({
				success: false,
				message: "Invalid verification code",
			});
		}

		const codeExpiryTime = new Date(user.lastSendVerificationCode);
		codeExpiryTime.setMinutes(codeExpiryTime.getMinutes() + 10);
		if (new Date() > codeExpiryTime) {
			return res.send({
				success: false,
				message:
					"Verification code has expired. Please request a new one.",
			});
		}

		await user.update({
			verificationCode: "",
			lastSendVerificationCode: null,
			isVerified: true,
		});

		return res.status(200).json({
			message: "Account has been verified!",
			success: true,
			user,
		});
	} catch (error) {
		console.error(error);
		return res.send({
			success: false,
			message: "Error verifying account",
			error,
		});
	}
});
router.post("/get-all-notification", async (req, res) => {
	try {
		const { id, page = 1, pageSize = 10 } = req.body;

		if (!id) {
			return res.send({
				success: false,
				message: "User ID is required",
			});
		}

		const offset = (page - 1) * pageSize;
		const limit = parseInt(pageSize, 10);

		const { rows: notifications, count: totalCount } =
			await Notification.findAndCountAll({
				where: { userId: id },
				offset,
				limit,
				order: [["createdAt", "DESC"]],
			});

		return res.send({
			success: true,
			notifications,
			totalCount,
		});
	} catch (error) {
		console.error(error);
		return res.send({
			success: false,
			message: "Error fetching notifications",
			error,
		});
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

		const isPasswordValid = await bcrypt.compare(oldPass, existingUser.password);
		if (!isPasswordValid) {
			return res.send({
				success: false,
				message: "User account current password does not match.",
			});
		}
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
