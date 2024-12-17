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
} = require("./models");
const { Op } = require("sequelize");
const router = express.Router();

router.post("/add-to-cart", async (req, res) => {
	try {
		const { userId, productId, customization, quantity } = req.body;
		const newOrder = await OrderProduct.create({
			userId,
			productId,
			customization,
			quantity,
		});

		let product = await Product.findByPk(productId);
		await product.update({
			stocks: parseInt(product.stocks - parseInt(quantity)),
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

router.post("/get-dashboard", async (req, res) => {
	try {
		const totalOrders = await OrderProduct.count();

		const totalItemsLeft = await Product.sum("stocks");

		const totalUsers = await User.count();

		// const orderStatusCounts = await OrderProduct.findAll({
		// 	attributes: [
		// 		"status",
		// 		[sequelize.fn("COUNT", sequelize.col("status")), "count"],
		// 	],
		// 	group: ["status"],
		// });
		const defaultStatuses = ["Completed", "Pending", "Rejected"];
		const statusCounts = defaultStatuses.reduce((acc, status) => {
			acc[status] = 0;
			return acc;
		}, {});

		const orderStatusCounts = await OrderProduct.findAll({
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

		// const statusCounts = orderStatusCounts.reduce(
		// 	(acc, { status, dataValues }) => {
		// 		acc[status] = parseInt(dataValues.count, 10);
		// 		return acc;
		// 	},
		// 	{}
		// );

		// const completedOrders = await OrderProduct.findAll({
		// 	attributes: [
		// 		[sequelize.literal(`EXTRACT(WEEK FROM "completedAt")`), "week"],
		// 		[sequelize.fn("COUNT", sequelize.col("id")), "count"],
		// 	],
		// 	where: {
		// 		status: "Completed",
		// 		completedAt: {
		// 			[Op.ne]: null,
		// 		},
		// 		completedAt: {
		// 			[Op.gte]: sequelize.literal("NOW() - INTERVAL '4 weeks'"),
		// 		},
		// 	},
		// 	group: [sequelize.literal(`EXTRACT(WEEK FROM "completedAt")`)],
		// 	order: [[sequelize.literal("week"), "ASC"]],
		// });

		const defaultWeeks = {
			"Week 1": 0,
			"Week 2": 0,
			"Week 3": 0,
			"Week 4": 0,
		};

		const completedOrders = await OrderProduct.findAll({
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
		const { id } = req.body;
		let order = await OrderSummary.findByPk(id);
		if (!order) {
			res.send({
				success: false,
				message: "OrderSummary does not exists.",
			});
			return;
		}
		let isCompleted = false;
		let newStatus = "Pending";
		if (order.status == "Pending") {
			newStatus = "Sewing";
		} else if (order.status == "Sewing") {
			newStatus = "Printing";
		} else if (order.status == "Printing") {
			newStatus = "Packing";
		} else if (order.status == "Packing") {
			newStatus = "Ready to pickup";
		} else {
			newStatus = "Completed";
			isCompleted = true;
		}
		await order.update({ status: newStatus, isCompleted });
		console.log(order);
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
			description,
			isCustomizable,
		} = req.body;

		if (!productName || !price || !stocks) {
			return res.status(400).json({
				success: false,
				message: "Product name, price, and stock are required fields.",
			});
		}

		let product;
		if (id) {
			product = await Product.findByPk(id);
			if (product) {
				await product.update({
					productName,
					productImages,
					productAllNames,
					price,
					stocks,
					description,
					isCustomizable,
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
			stocks,
			description,
			isCustomizable,
		});

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

router.get("/get-all-product", async (req, res) => {
	try {
		const { status } = req.query;
		const whereClause = status
			? { status, isCustomizable: false }
			: { status: "Available", isCustomizable: false };
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

router.post("/get-all-order", async (req, res) => {
	const { userId } = req.body;
	try {
		const whereClause = {};

		if (userId !== undefined) {
			whereClause["userId"] = userId;
		}

		const orderSummaries = await OrderSummary.findAll({
			where: whereClause,
		});
		console.log(orderSummaries);

		const ordersWithProducts = [];

		for (const orderSummary of orderSummaries) {
			console.log(`Order Summary ID: ${orderSummary.id}`);
			console.log(
				`Products in this summary: ${JSON.stringify(
					orderSummary.products
				)}`
			);

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
					productId: orderProduct.productId,
					productName: orderProduct.Product.productName,
					price: orderProduct.Product.price,
					quantity: orderProduct.quantity,
					customization: orderProduct.customization,
					status: orderProduct.status,
					productImages: orderProduct.Product.productImages,
				}));

				ordersWithProducts.push({
					id: orderSummary.id,
					referenceNumber: orderSummary.referenceNumber,
					createdAt: orderSummary.createdAt,
					products: products,
					status: orderSummary.status,
					isCompleted: orderSummary.isCompleted,
				});
			} else {
				ordersWithProducts.push({
					id: orderSummary.id,
					referenceNumber: orderSummary.referenceNumber,
					createdAt: orderSummary.createdAt,
					status: orderSummary.status,
					isCompleted: orderSummary.isCompleted,
					products: [],
				});
			}
		}
		console.log(ordersWithProducts);
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
			? { status, isCustomizable: true }
			: { status: "Available", isCustomizable: true };
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
