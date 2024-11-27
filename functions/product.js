const express = require("express");
const {
	Product,
	OrderProduct,
	sequelize,
	CartSummary,
	OrderSummary,
	OrderItem,
} = require("./models");
const { Op } = require("sequelize");
const router = express.Router();

router.post("/add-to-cart", async (req, res) => {
	try {
		const { userId, productId, customization, quantity } = req.body;
		const newOrder = await OrderProduct.create({
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
		const { productName, price, size, stocks, description, status } =
			req.body;
		const newProduct = await Product.create({
			productName,
			price,
			size,
			stocks,
			description,
			status,
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

router.get("/get-all-product", async (req, res) => {
	try {
		const { status } = req.query;
		const whereClause = status ? { status } : { status: "Available" };
		const products = await Product.findAll({ where: whereClause });
		res.status(200).json({ success: true, products });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch products",
			error,
		});
	}
});

router.post("/get-all-order", async (req, res) => {
	try {
		const products = await OrderProduct.findAll({
			include: [
				{
					model: Product,
					attributes: ["productName", "price"],
				},
			],
		});
		res.status(200).json({ success: true, products });
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
		const whereClause = status ? { status } : { status: "Available" };
		const products = await Product.findAll({ where: whereClause });
		res.status(200).json({ success: true, products });
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
