const express = require("express");
const {
	User,
	Product,
	OrderProduct,
	sequelize,
	CartSummary,
	OrderSummary,
	OrderItem,
	Materials,
	Notification,
	Feedback,
} = require("./models");
const { Op } = require("sequelize");
const sendEmail = require("./emailSender");

const router = express.Router();


const paypal = require("@paypal/checkout-server-sdk");
const PAYPAL_CLIENT_ID =
	"AX5AGNee2pN271sDzuXWPldkFw9x_97bvDEKdpXcwNgmdE26uTD64JjEi2XRpY2AWKyUn29kicp1mocQ";
const PAYPAL_CLIENT_SECRET =
	"EIKjEnAUbgNvX6ZswF0WurD8ocna3IAiF7TyHnL_T8B_548iOSGgomNiQxFNOX3fl8CuE9uXX_ojyNup";
const environment = new paypal.core.LiveEnvironment(
	PAYPAL_CLIENT_ID,
	PAYPAL_CLIENT_SECRET
);

const getOrderPaymentStatus = async (orderId) => {
	const url = `https://api.paypal.com/v2/checkout/orders/${orderId}`;

	const code = await getAccessToken();

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${code}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}

		const data = await response.json();
		const orderStatus = data.status;

		console.log(orderStatus);

		return orderStatus;
	} catch (err) {
		console.error("Error fetching payment status:", err);
		return "error";
	}
};
const getAccessToken = async () => {
	const url = "https://api.paypal.com/v1/oauth2/token"; 
	const credentials = Buffer.from(
		`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
	).toString("base64");

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Basic ${credentials}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: "grant_type=client_credentials",
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("Error fetching access token:", errorData);
			throw new Error("Error fetching access token");
		}

		const data = await response.json();
		console.log(data.access_token);
		return data.access_token;
	} catch (error) {
		console.error("Error fetching access token:", error);
		throw error;
	}
};


// router.post("/screenshot", async (req, res) => {
// 	const { html } = req.body;

// 	if (!html) {
// 		return res
// 			.status(400)
// 			.json({ success: false, message: "HTML content is required" });
// 	}

// 	try {
// 		const image = await nodeHtmlToImage({ html });
// 		res.status(200).send({
// 			success: true,
// 			image: image.toString("base64"),
// 		});
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to generate image",
// 		});
// 	}
// });
// router.post("/screenshot", async (req, res) => {
// 	const { url, delay = 8 } = req.body;

// 	if (!url) {
// 		return res
// 			.status(400)
// 			.send({ success: false, message: "URL is required" });
// 	}

// 	try {
// 		const browser = await puppeteer.launch({ headless: true });
// 		const page = await browser.newPage();
// 		await page.goto(url, { waitUntil: "load" });
// 		// if (delay) await page.waitForTimeout(delay * 1000);
// 		if (delay) {
// 			await new Promise((resolve) => setTimeout(resolve, delay * 1000));
// 		}

// 		const screenshotBuffer = await page.screenshot({ type: "png" });
// 		await browser.close();

// 		res.json({
// 			success: true,
// 			screenshot: screenshotBuffer.toString("base64"),
// 			psd: null,
// 		});
// 	} catch (error) {
// 		console.error("Error capturing screenshot:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to capture screenshot",
// 		});
// 	}
// });


router.post("/screenshot", async (req, res) => {
	const { url, delay = 8, wait_until = "load", hiddenData = {} } = req.body;

	if (!url) {
		return res
			.status(400)
			.send({ success: false, message: "URL is required" });
	}

	try {
		const screenshotApiUrl = `https://api.screenshotapi.com/take?url=${encodeURIComponent(
			url
		)}&apiKey=key_rszGrDNCK7bsuPkNXWexdA&fullPage=true&waitUntil=load&waitUntil=networkidle0&waitUntil=networkidle2&waitUntil=domcontentloaded`;

		const response = await fetch(screenshotApiUrl);

		const screenshotData = await response.json();
		console.log(JSON.stringify(screenshotData));

		if (!screenshotData.screenshot) {
			throw new Error("Failed to capture screenshot."); 
		}

		res.json({
			success: true,
			screenshot: screenshotData.screenshot,
		});
	} catch (err) {
		console.error("Error capturing screenshot:", err);
		res.status(500).send({
			success: false,
			message: "Internal Server Error",
		});
	}
});



router.post("/add-to-cart", async (req, res) => {
	try {
		const { userId, productId, customization, quantity, quantities } =
			req.body;

		const totalQuantity = Object.values(quantities).reduce(
			(sum, quantity) => sum + quantity,
			0
		);
		const newOrder = await OrderProduct.create({
			userId,
			productId,
			customization,
			quantity: totalQuantity,
			quantityPerSize: Object.values(quantities),
		});

		let product = await Product.findByPk(productId);
		const updatedStockPerSize = product.stockPerSize.map((stock, index) => {
			const size = product.size[index];
			const quantityToDeduct = quantities[size] || 0;
			return stock - quantityToDeduct;
		});

		await product.update({
			stockPerSize: updatedStockPerSize,
		});
		let cart = await CartSummary.findOne({
			where: { userId: userId },
		});
		if (!cart) cart = await CartSummary.create({ userId });
		await cart.update({ products: [...cart.products, newOrder.id] });
		res.status(201).json({ success: true, order: newOrder });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to add to cart the product",
			error,
		});
	}
});

router.post("/get-all-cart", async (req, res) => {
	try {
		const { userId } = req.body;
		let cart = await CartSummary.findOne({
			where: { userId: userId },
		});
		if (!cart) cart = await CartSummary.create({ userId });

		const productIds = Array.isArray(cart.products) ? cart.products : [];
		const allOrderProducts = await OrderProduct.findAll({
			where: {
				id: {
					[Op.in]: productIds,
				},
			},
			include: {
				model: Product,
			},
		});
		res.status(201).json({ success: true, orders: allOrderProducts, cart });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch all cart product",
			error,
		});
	}
});

router.post("/add-feedback", async (req, res) => {
	try {
		const { orderid, userId, rate, comment } = req.body;

		let order = await OrderSummary.findByPk(orderid);
		if (!order) {
			return res.send({
				success: false,
				message: "Order does not exist.",
			});
		}

		const feedback = await Feedback.create({
			userId: userId,
			orderId: orderid,
			rate: rate,
			comment: comment,
		});

		await order.update({ alreadyFeedback: true });

		res.status(201).json({ success: true, feedback });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to add feedback",
			error,
		});
	}
});

router.post("/get-feedback", async (req, res) => {
	try {
		const feedback = await Feedback.findAll({
			include: [
				{
					model: User,
					attributes: ["id", "firstName", "lastName", "email"],
				},
			],
		});

		console.log(feedback);

		// if (!feedback || feedback.length === 0) {
		// 	return res.send({
		// 		success: false,
		// 		message: "No feedback found.",
		// 	});
		// }

		res.status(200).json({
			success: true,
			feedback,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch feedback.",
			error,
		});
	}
});

router.post("/get-dashboard", async (req, res) => {
	try {
		const totalOrders = await OrderProduct.count();
		const totalItemsLeft = await Product.sum("stocks");
		const totalUsers = await User.count();

		const defaultStatuses = ["Completed", "Pending", "Rejected"];
		const statusCounts = defaultStatuses.reduce((acc, status) => {
			acc[status] = 0;
			return acc;
		}, {});

		const orderStatusCounts = await OrderSummary.findAll({
			attributes: [
				"status",
				[sequelize.fn("COUNT", sequelize.col("status")), "count"],
			],
			group: ["status"],
		});
		orderStatusCounts.forEach(({ status, dataValues }) => {
			if (statusCounts.hasOwnProperty(status)) {
				statusCounts[status] = parseInt(dataValues.count, 10);
			}
		});
		const defaultWeeks = {
			"Week 1": 0,
			"Week 2": 0,
			"Week 3": 0,
			"Week 4": 0,
		};

		const completedOrders = await OrderSummary.findAll({
			attributes: [
				[sequelize.literal(`EXTRACT(WEEK FROM "completedAt")`), "week"],
				[sequelize.fn("COUNT", sequelize.col("id")), "count"],
			],
			where: {
				status: "Completed",
				completedAt: {
					[Op.ne]: null,
				},
				completedAt: {
					[Op.gte]: sequelize.literal("NOW() - INTERVAL '4 weeks'"),
				},
			},
			group: [sequelize.literal(`EXTRACT(WEEK FROM "completedAt")`)],
			order: [[sequelize.literal("week"), "ASC"]],
		});
		// console.log(completedOrders);

		completedOrders.forEach(({ dataValues }) => {
			const week = `Week ${dataValues.week}`;
			if (defaultWeeks.hasOwnProperty(week)) {
				defaultWeeks[week] = parseInt(dataValues.count, 10);
			}
		});

		res.status(201).json({
			success: true,
			data: {
				totalOrders,
				totalItemsLeft,
				totalUsers,
				statusCounts: Object.entries(statusCounts).map(
					([status, count]) => ({
						status,
						count,
					})
				),
				completedOrdersByWeek: Object.entries(defaultWeeks).map(
					([week, count]) => ({
						week,
						count,
					})
				),
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch dashboard data.",
			error,
		});
	}
});

router.post("/order-update-status", async (req, res) => {
	try {
		const { id, newStatus, userId, email } = req.body;
		let order = await OrderSummary.findByPk(id);

		if (!order) {
			return res.send({
				success: false,
				message: "OrderSummary does not exist.",
			});
		}
		const subject = `Order ${id} Status Updated`;
		const text = `Your order status has been updated to ${newStatus}.`;
		const html = `<p>Your order status has been updated to <strong>${newStatus}</strong>.</p>`;
		await sendEmail(email, subject, text, html);

		await Notification.create({
			userId: userId,
			title: `Order ${id} Status Updated`,
			message: `Your order status has been updated to ${newStatus}.`,
		});
		const isCompleted = newStatus === "Completed";
		const completedAt = isCompleted ? new Date() : null;
		await order.update({
			status: newStatus,
			isCompleted,
			isPaid: true,
			completedAt,
		});
		res.status(201).json({ success: true, order });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to update order status",
			error,
		});
	}
});

router.post("/edit-to-cart", async (req, res) => {
	try {
		const { id, customization, quantity } = req.body;
		let order = await OrderProduct.findByPk(id);
		if (!order) {
			res.send({
				success: false,
				message: "OrderProduct does not exists.",
			});
			return;
		}
		await order.update({ customization, quantity });
		res.status(201).json({ success: true, order });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to edit customized product",
			error,
		});
	}
});

router.post("/checkout-orders", async (req, res) => {
	const { orders, userId } = req.body;

	if (!orders || !Array.isArray(orders) || orders.length === 0) {
		return res.status(400).json({
			success: false,
			message: "Invalid or empty orders array.",
		});
	}

	if (!userId) {
		return res
			.status(400)
			.json({ success: false, message: "User ID is required." });
	}

	try {
		const productIds = orders.map((order) => order.Product.id);
		const cart = await CartSummary.findOne({ where: { userId } });
		if (!cart) {
			return res.status(404).json({
				success: false,
				message: "Cart not found for the given user ID.",
			});
		}
		await OrderProduct.update(
			{ isOrdered: true },
			{
				where: {
					productId: {
						[Op.in]: productIds,
					},
				},
			}
		);
		const allOrderProducts = await OrderProduct.findAll({
			where: {
				productId: {
					[Op.in]: productIds,
				},
			},
		});

		const orderIds = allOrderProducts.map((order) => order.id);
		const updatedProducts = cart.products.filter(
			(productId) => !orderIds.includes(productId)
		);
		await cart.update({ products: updatedProducts });
		const orderItems = orderIds.map((productOrderId) => ({
			userId,
			productOrderId,
		}));
		await OrderItem.bulkCreate(orderItems);
		res.status(201).json({
			success: true,
			message: "Orders successfully checked out.",
			orderItems,
		});
	} catch (error) {
		console.error("Error in /checkout-orders:", error);
		res.status(500).json({
			success: false,
			message: "Failed to checkout orders.",
			error,
		});
	}
});

router.post("/create", async (req, res) => {
	try {
		const {
			productImage,
			productName,
			price,
			size,
			stocks,
			description,
			isCustomizable,
		} = req.body;
		const newProduct = await Product.create({
			productImage,
			productName,
			price,
			size,
			stocks,
			description,
			isCustomizable,
		});
		res.status(201).json({ success: true, product: newProduct });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to create product",
			error,
		});
	}
});

router.post("/archive-unarchived-product", async (req, res) => {
	try {
		const { id } = req.body;

		if (id) {
			product = await Product.findByPk(id);
			if (product) {
				await product.update({
					isArchive: !product.isArchive,
				});
				return res.status(200).json({
					success: true,
					message: "Product updated successfully!",
					data: product,
				});
			}
		} else {
			return res.send({
				success: false,
				message: "Product does not exists",
			});
		}
		return res.send({
			success: false,
			message: "Product does not exists",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Failed to process product request.",
			error: error.message,
		});
	}
});

router.post("/archive-unarchived-material", async (req, res) => {
	try {
		const { id } = req.body;

		if (id) {
			product = await Materials.findByPk(id);
			if (product) {
				await product.update({
					isArchive: !product.isArchive,
				});
				return res.status(200).json({
					success: true,
					message: "Product updated successfully!",
					data: product,
				});
			}
		} else {
			return res.send({
				success: false,
				message: "Product does not exists",
			});
		}
		return res.send({
			success: false,
			message: "Product does not exists",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Failed to process product request.",
			error: error.message,
		});
	}
});

router.post("/add-product", async (req, res) => {
	try {
		const {
			id,
			productName,
			productImages,
			productAllNames,
			price,
			size,
			stocks,
			stockPerSize,
			description,
			isCustomizable,
		} = req.body;

		if (!productName || !price) {
			return res.send({
				success: false,
				message: "Product name, price, and stock are required fields.",
			});
		}

		console.log(size);
		let product;
		if (id) {
			product = await Product.findByPk(id);
			if (product) {
				await product.update({
					productName,
					productImages,
					productAllNames,
					price,
					size,
					stocks: stockPerSize.reduce((a, b) => parseInt(a) + parseInt(b), 0),
					description,
					isCustomizable,
					stockPerSize,
				});
				return res.status(200).json({
					success: true,
					message: "Product updated successfully!",
					data: product,
				});
			}
		}

		const newProduct = await Product.create({
			productName,
			productImages,
			productAllNames,
			price,
			stocks: stockPerSize.reduce((a, b) => a + b, 0),
			size,
			description,
			isCustomizable,
			stockPerSize,
		});
		console.log(newProduct);

		return res.status(201).json({
			success: true,
			message: "Product added successfully!",
			data: newProduct,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Failed to process product request.",
			error: error.message,
		});
	}
});

router.post("/add-material", async (req, res) => {
	try {
		const { id, name, quantity, price, unitType } = req.body;

		if (!name || !price || !quantity || !unitType) {
			return res.status(400).json({
				success: false,
				message:
					"Material name, price, and quantity are required fields.",
			});
		}

		let product;
		if (id) {
			product = await Materials.findByPk(id);
			if (product) {
				await product.update({
					name,
					quantity,
					price,
					unitType,
				});
				return res.status(200).json({
					success: true,
					message: "Material updated successfully!",
					data: product,
				});
			}
		}

		const newProduct = await Materials.create({
			name,
			quantity,
			price,
			unitType,
		});

		return res.status(201).json({
			success: true,
			message: "Material added successfully!",
			data: newProduct,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Failed to process material request.",
			error: error.message,
		});
	}
});

router.get("/get-all-product", async (req, res) => {
	try {
		const { status, isCustomizable } = req.query;
		const whereClause = status
			? { status, stocks: { [Op.gt]: 0 } }
			: {
					status: "Available",
					stocks: { [Op.gt]: 0 },
			  };
		if (isCustomizable !== undefined) {
			whereClause["isCustomizable"] = isCustomizable;
		}
		const products = await Product.findAll({
			where: whereClause,
			order: [["createdAt", "DESC"]],
		});
		const materials = await Materials.findAll({
			order: [["createdAt", "DESC"]],
		});
		res.status(200).json({ success: true, products, materials });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch products",
			error,
		});
	}
});

// OrderItem;

// router.post("/get-all-order", async (req, res) => {
// 	const { userId } = req.body;
// 	try {
// 		// const whereClause = { isOrdered: true };
// 		// if (userId !== undefined) whereClause["userId"] = userId;
// 		// const products = await OrderProduct.findAll({
// 		// 	where: whereClause,
// 		// 	include: [
// 		// 		{
// 		// 			model: Product,
// 		// 			attributes: { exclude: [] },
// 		// 		},
// 		// 	],
// 		// });
// 		// res.status(200).json({ success: true, products });
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to fetch orders",
// 			error: error.message,
// 		});
// 	}
// });

// router.post("/get-all-order", async (req, res) => {
// 	const { userId } = req.body;
// 	try {
// 		const whereClause = {};

// 		if (userId !== undefined) {
// 			whereClause["userId"] = userId;
// 		}

// 		const orderSummaries = await OrderSummary.findAll({
// 			where: whereClause,
// 			include: [
// 				{
// 					model: Product,
// 					through: {
// 						attributes: [],
// 					},
// 				},
// 			],
// 		});
// 		const orderProducts = await OrderProduct.findAll({
// 			where: {
// 				productId: orderSummaries.products,
// 			},
// 			include: [
// 				{
// 					model: Product,
// 					attributes: { exclude: [] },
// 				},
// 			],
// 		});
// 		res.status(200).json({ success: true, orderSummaries, orderProducts });
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Failed to fetch orders",
// 			error: error.message,
// 		});
// 	}
// });

router.post("/delete-cart", async (req, res) => {
	try {
		const { orders } = req.body;
		await OrderProduct.destroy({
			where: {
				id: { [Op.in]: orders },
			},
		});
		res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to delete products",
			error,
		});
	}
});

router.post("/delete-order", async (req, res) => {
	const { id } = req.body;
	try {
		await OrderSummary.destroy({ where: { id } });
		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to delete order",
			error: error.message,
		});
	}
});

router.post("/get-all-order", async (req, res) => {
	const { userId, status, paid } = req.body;
	const code = await getAccessToken();
	console.log(code);

	try {
		const whereClause = {};

		if (userId !== undefined) {
			whereClause["userId"] = userId;
		}
		if (status !== undefined) {
			whereClause["status"] = status;
		}
		if (paid !== undefined) {
			whereClause[Op.or] = [
				{ isDownpaymentPaid: paid, isExpired: false, isFailed: false },
				{ isPaid: paid },
			];
		}

		const orderSummaries = await OrderSummary.findAll({
			where: whereClause,
			include: [
				{
					model: User,
					attributes: [
						"id",
						"firstName",
						"lastName",
						"email",
						"contactNumber",
						"address",
					],
				},
			],
		});

		const ordersWithProducts = [];

		for (const orderSummary of orderSummaries) {
			// const orderStatus = await getOrderPaymentStatus(
			// 	orderSummary.orderId
			// );
			if (orderSummary.isDownpayment) {
				if (orderSummary.isDownPaymentExpired) {
				} else if (orderSummary.isDownpaymentPaid) {
					if (
						orderSummary.orderId !== "" &&
						orderSummary.expiredAt !== null
					) {
						if (
							orderSummary.isPaid ||
							orderSummary.isFailed ||
							orderSummary.isExpired
						) {
						} else {
							const currentTime = new Date();
							if (
								new Date(orderSummary.expiredAt) <= currentTime
							) {
								await orderSummary.update({ isExpired: true });
								await Notification.create({
									userId: orderSummary.userId,
									title: "Order Expired",
									message: `Your order with reference number ${orderSummary.referenceNumber} has expired.`,
								});
							} else {
								// const orderStatus = await getOrderPaymentStatus(
								// 	orderSummary.orderId
								// );
								// if (orderStatus === "APPROVED") {
								// 	await orderSummary.update({ isPaid: true });
								// 	await Notification.create({
								// 		userId: orderSummary.userId,
								// 		title: "Order Paid",
								// 		message: `Your order with reference number ${orderSummary.referenceNumber} has been successfully paid.`,
								// 	});
								// }
							}
						}
					}
				} else {
					const currentTime = new Date();
					if (
						new Date(orderSummary.downPaymentExpiredAt) <=
						currentTime
					) {
						await orderSummary.update({
							isDownPaymentExpired: true,
						});
						await Notification.create({
							userId: orderSummary.userId,
							title: "Downpayment Expired",
							message: `Your downpayment for reference number ${orderSummary.referenceNumber} has expired.`,
						});
					} else {
						// const orderStatus = await getOrderPaymentStatus(
						// 	orderSummary.downPaymentOrderId
						// );
						// if (orderStatus === "APPROVED") {
						// 	await orderSummary.update({
						// 		isDownpaymentPaid: true,
						// 	});
						// 	await Notification.create({
						// 		userId: orderSummary.userId,
						// 		title: "Downpayment Paid",
						// 		message: `Your downpayment for reference number ${orderSummary.referenceNumber} has been successfully paid.`,
						// 	});
						// }
					}
				}
			} else {
				if (
					orderSummary.isPaid ||
					orderSummary.isFailed ||
					orderSummary.isExpired
				) {
				} else {
					const currentTime = new Date();
					if (new Date(orderSummary.expiredAt) <= currentTime) {
						await orderSummary.update({ isExpired: true });
						await Notification.create({
							userId: orderSummary.userId,
							title: "Order Expired",
							message: `Your order with reference number ${orderSummary.referenceNumber} has expired.`,
						});
					} else {
						// const orderStatus = await getOrderPaymentStatus(
						// 	orderSummary.orderId
						// );
						// // console.log(orderStatus);
						// if (orderStatus === "APPROVED") {
						// 	await orderSummary.update({ isPaid: true });
						// 	await Notification.create({
						// 		userId: orderSummary.userId,
						// 		title: "Order Paid",
						// 		message: `Your order with reference number ${orderSummary.referenceNumber} has been successfully paid.`,
						// 	});
						// }
					}
				}
			}

			if (orderSummary.products.length > 0) {
				const orderProducts = await OrderProduct.findAll({
					where: {
						id: {
							[Op.in]: orderSummary.products,
						},
					},
					include: [
						{
							model: Product,
							attributes: [
								"productName",
								"price",
								"productImages",
								"size",
							],
						},
					],
				});

				if (orderProducts.length === 0) {
					console.log(
						`No order products found for OrderSummary ID: ${orderSummary.id}`
					);
				}

				const products = orderProducts.map((orderProduct) => ({
					orderProductId: orderProduct.id,
					productId: orderProduct.productId,
					productName: orderProduct.Product.productName,
					price: orderProduct.Product.price,
					quantity: orderProduct.quantity,
					customization: orderProduct.customization,
					status: orderProduct.status,
					productImages: orderProduct.Product.productImages,
					size: orderProduct.Product.size,
				}));

				ordersWithProducts.push({
					id: orderSummary.id,
					orderId: orderSummary.orderId,
					referenceNumber: orderSummary.referenceNumber,
					createdAt: orderSummary.createdAt,
					orderReceiptJson: orderSummary.orderReceiptJson,

					downPaymentStatus: !orderSummary.isDownpayment
						? "------"
						: orderSummary.isDownpaymentPaid
						? "PAID"
						: orderSummary.isDownPaymentExpired
						? "EXPIRED"
						: "PENDING",
					orderStatus:
						(orderSummary.isDownpayment &&
							!orderSummary.isDownpaymentPaid) ||
						orderSummary.isDownPaymentExpired
							? "------"
							: orderSummary.isPaid
							? "PAID"
							: orderSummary.isFailed
							? "FAILED"
							: orderSummary.isExpired
							? "EXPIRED"
							: "PENDING",

					products: products,
					status: orderSummary.status,
					isCompleted: orderSummary.isCompleted,
					user: orderSummary.User,
					paymentLink: orderSummary.paymentLink,
					alreadyFeedback: orderSummary.alreadyFeedback,
				});
			} else {
				ordersWithProducts.push({
					id: orderSummary.id,
					orderId: orderSummary.orderId,
					orderStatus: orderSummary.isPaid
						? "PAID"
						: orderSummary.isFailed
						? "FAILED"
						: "PENDING",
					orderReceiptJson: orderSummary.orderReceiptJson,

					referenceNumber: orderSummary.referenceNumber,
					createdAt: orderSummary.createdAt,
					status: orderSummary.status,
					isCompleted: orderSummary.isCompleted,
					products: [],
					user: orderSummary.User,
					paymentLink: orderSummary.paymentLink,
					alreadyFeedback: orderSummary.alreadyFeedback,
				});
			}
		}

		// console.log(ordersWithProducts);
		res.status(200).json({
			success: true,
			orderSummaries: ordersWithProducts,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch orders",
			error: error.message,
		});
	}
});

router.get("/get-all-product-customizable", async (req, res) => {
	try {
		const { status } = req.query;
		const whereClause = status
			? { status, isCustomizable: true, stocks: { [Op.gt]: 0 } }
			: {
					status: "Available",
					isCustomizable: true,
					stocks: { [Op.gt]: 0 },
			  };
		const products = await Product.findAll({ where: whereClause });
		const materials = await Materials.findAll();
		res.status(200).json({ success: true, products, materials });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch products",
			error,
		});
	}
});


router.post("/get-order-summary", async (req, res) => {
	try {
		const { id } = req.body;
		const product = await OrderProduct.findByPk(id, {
			include: {
				model: Product,
			},
		});
		const products = await OrderProduct.findAll();
		console.log(products);
		res.status(200).json({ success: true, product });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product",
			error,
		});
	}
});

router.get("/get-product", async (req, res) => {
	try {
		const { id } = req.query;
		const product = await Product.findByPk(id);
		res.status(200).json({ success: true, product });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch product",
			error,
		});
	}
});

router.post("/delete-product", async (req, res) => {
	try {
		const { id } = req.body;
		const product = await Product.destroy({ where: { id } });
		res.status(200).json({ success: true, product });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to delete product",
			error,
		});
	}
});

router.post("/delete-material", async (req, res) => {
	try {
		const { id } = req.body;
		const product = await Materials.destroy({ where: { id } });
		res.status(200).json({ success: true, product });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to delete material",
			error,
		});
	}
});

router.get("/:id/customization", async (req, res) => {
	try {
		const { id } = req.params;
		const product = await Product.findByPk(id);
		if (!product) {
			return res
				.status(404)
				.json({ success: false, message: "Product not found" });
		}
		res.status(200).json({
			success: true,
			customization: product.customization,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch customization",
			error,
		});
	}
});

module.exports = router;
