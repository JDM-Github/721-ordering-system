const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

const {
	sequelize,
	User,
	CartSummary,
	OrderProduct,
	OrderSummary,
	Notification
} = require("./models");
const { imageRouter } = require("./routers");

DEVELOPMENT = false;
if (DEVELOPMENT) {
	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
			optionSuccessStatus: 200,
		})
	);
	router.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../client/build"), "index.html");
	});
} else {
	app.use(cors());
}

router.use("/file", imageRouter);
router.use("/user", require("./user.js"));
router.use("/product", require("./product.js"));

router.get("/reset", async (req, res) => {
	await sequelize.sync({ force: true });
	res.send("RESETED");
});

const generateReferenceNumber = () => {
	const timestamp = Date.now().toString();
	const randomString = Math.random()
		.toString(36)
		.substring(2, 8)
		.toUpperCase();
	return `REF-${timestamp}-${randomString}`;
};

// const PAYMONGO_API_KEY = "sk_test_HMD8fpUnNtVh5bTG35TQXmXC";
// router.post("/create-payment", async (req, res) => {
// 	const { amount, userId, orders, isDownpayment } = req.body;
// 	const orderIds = orders.map((order) => order.id);
// 	const reference_number = generateReferenceNumber();

// 	const user = await User.findByPk(userId);

// 	const adjustedLineItems = orders.map((item) => {
// 		return {
// 			currency: "PHP",
// 			images: [item.Product.productImages[0]],
// 			amount: parseInt(item.Product.price * 100 * (isDownpayment ? 0.5 : 1)),
// 			name: item.Product.productName.slice(0, 20) + (isDownpayment ? " (Downpayment)" : ""),
// 			quantity: parseInt(item.quantity),
// 			description: "Full payment for this product",
// 		};
// 	});

// 	const payload = {
// 		data: {
// 			attributes: {
// 				billing: {
// 					address: {
// 						line1: user.address,
// 						country: "PH",
// 					},
// 					name: user.firstName + " " + user.lastName + " ",
// 					email: user.email,
// 					phone: user.contactNumber,
// 				},
// 				send_email_receipt: true,
// 				show_description: true,
// 				show_line_items: true,
// 				payment_method_types: ["gcash"],
// 				line_items: adjustedLineItems,
// 				description: "Payment for selected products",
// 				reference_number: reference_number,
// 				statement_descriptor: "721 Ordering",
// 				success_url: "https://721ordering.netlify.app/history",
// 				cancel_url: "https://721ordering.netlify.app/history",
// 			},
// 		},
// 	};

// 	const jsonPayload = JSON.stringify(payload);
// 	console.log(jsonPayload);

// 	try {
// 		const sourceResponse = await axios.post(
// 			"https://api.paymongo.com/v1/checkout_sessions",
// 			payload,
// 			{
// 				headers: {
// 					Authorization: `Basic ${Buffer.from(
// 						PAYMONGO_API_KEY
// 					).toString("base64")}`,
// 					"Content-Type": "application/json",
// 				},
// 			}
// 		);
// 		const paymentSource = sourceResponse.data.data;
// 		console.log(paymentSource);

// 		const cart = await CartSummary.findOne({ where: { userId } });
// 		if (cart) {
// 			const updatedProducts = cart.products.filter(
// 				(productId) => !orderIds.includes(productId)
// 			);
// 			await cart.update({ products: updatedProducts });
// 		}
// 		if (isDownpayment) {
// 			await OrderSummary.create({
// 				userId: userId,
// 				referenceNumber: reference_number,
// 				downPaymentOrderId: paymentSource.id,

// 				products: orderIds,
// 				downPaymentExpiredAt: new Date(
// 					new Date().getTime() + 15 * 60 * 1000
// 				),
// 				isDownpayment: true,
// 				remainingBalance: amount / 2,
// 				paymentLink: paymentSource.attributes.checkout_url,
// 			});
// 		} else {
// 			await OrderSummary.create({
// 				userId: userId,
// 				referenceNumber: reference_number,
// 				orderId: paymentSource.id,
// 				products: orderIds,
// 				expiredAt: new Date(new Date().getTime() + 15 * 60 * 1000),
// 				paymentLink: paymentSource.attributes.checkout_url,
// 			});
// 		}
// 		res.send({
// 			success: true,
// 			redirectUrl: paymentSource.attributes.checkout_url,
// 			referenceNumber: reference_number,
// 		});
// 	} catch (error) {
// 		console.error("Error creating payment:", error);
// 		res.status(500).json({ error: "Failed to create payment" });
// 	}

// });


function calculateItemTotal(items) {
	return items.reduce((total, item) => {
		return total + parseFloat(item.unit_amount.value) * item.quantity;
	}, 0);
}


const paypal = require("@paypal/checkout-server-sdk");
const PAYPAL_CLIENT_ID =
	"AX5AGNee2pN271sDzuXWPldkFw9x_97bvDEKdpXcwNgmdE26uTD64JjEi2XRpY2AWKyUn29kicp1mocQ";
const PAYPAL_CLIENT_SECRET =
	"EIKjEnAUbgNvX6ZswF0WurD8ocna3IAiF7TyHnL_T8B_548iOSGgomNiQxFNOX3fl8CuE9uXX_ojyNup";

const environment = new paypal.core.LiveEnvironment(
	PAYPAL_CLIENT_ID,
	PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);
router.post("/create-payment", async (req, res) => {
	const { amount, userId, orders, isDownpayment } = req.body;
	const orderIds = orders.map((order) => order.id);
	const reference_number = generateReferenceNumber();

	const user = await User.findByPk(userId);

	const adjustedLineItems = orders.map((item) => {
		return {
			name:
				item.Product.productName.slice(0, 20) +
				(isDownpayment ? " (Downpayment)" : ""),
			quantity: parseInt(item.quantity),
			unit_amount: {
				currency_code: "PHP",
				value: (item.Product.price * (isDownpayment ? 0.5 : 1)).toFixed(
					2
				),
			},
			description: "Full payment for this product",
		};
	});
	const totalItem = calculateItemTotal(adjustedLineItems).toFixed(2);

	const orderRequest = new paypal.orders.OrdersCreateRequest();
	orderRequest.requestBody({
		intent: "CAPTURE",
		purchase_units: [
			{
				reference_id: "default",
				amount: {
					currency_code: "PHP",
					value: totalItem,
					breakdown: {
						item_total: {
							currency_code: "PHP",
							value: totalItem,
						},
					},
				},
				description: "Payment for selected products",
				shipping: {
					address: {
						address_line_1: user.address,
						admin_area_2: "Calamba",
						postal_code: "4028s",
						country_code: "PH",
					},
				},
				items: adjustedLineItems,
			},
		],
		application_context: {
			brand_name: "721 Ordering",
			landing_page: "BILLING",
			user_action: "PAY_NOW",
			return_url:
				"https://721ordering.netlify.app/.netlify/functions/api/payment-success",
			cancel_url:
				"https://721ordering.netlify.app/.netlify/functions/api/payment-failed",
		},
	});


	try {
		const order = await client.execute(orderRequest);
		const orderId = order.result.id;

		const cart = await CartSummary.findOne({ where: { userId } });
		if (cart) {
			const updatedProducts = cart.products.filter(
				(productId) => !orderIds.includes(productId)
			);
			await cart.update({ products: updatedProducts });
		}
		
		const approvalUrl = order.result.links.find(
			(link) => link.rel === "approve"
		).href;
		if (isDownpayment) {
			await OrderSummary.create({
				userId: userId,
				referenceNumber: reference_number,
				downPaymentOrderId: orderId,
				products: orderIds,
				downPaymentExpiredAt: new Date(
					new Date().getTime() + 15 * 60 * 1000
				),
				isDownpayment: true,
				remainingBalance: amount / 2,
				paymentLink: approvalUrl,
			});
			await Notification.create({
				userId: userId,
				title: "Downpayment Order Created",
				message: `Your downpayment order with reference number ${reference_number} has been created. Complete the remaining balance payment before the expiration.`,
			});
		} else {
			await OrderSummary.create({
				userId: userId,
				referenceNumber: reference_number,
				orderId: orderId,
				products: orderIds,
				expiredAt: new Date(new Date().getTime() + 15 * 60 * 1000),
				paymentLink: approvalUrl,
			});
			await Notification.create({
				userId: userId,
				title: "Order Created",
				message: `Your order with reference number ${reference_number} has been created. Please complete the payment before the expiration.`,
			});
		}


		res.send({
			success: true,
			redirectUrl: approvalUrl,
			referenceNumber: reference_number,
		});
	} catch (error) {
		console.error("Error creating payment:", error);
		res.status(500).json({ error: "Failed to create payment" });
	}
});

router.get("/payment-success", async (req, res) => {
	const { token } = req.query;
	if (!token) {
		return res.status(400).json({ error: "Payment token is missing" });
	}
	try {
		const captureRequest = new paypal.orders.OrdersCaptureRequest(token);
		const captureResponse = await client.execute(captureRequest);

		if (captureResponse.result.status !== "COMPLETED") {
			res.redirect(
				`https://721ordering.netlify.app?message=payment-failed`
			);
		}

		const orderId = captureResponse.result.id;
		const order = await OrderSummary.findOne({ where: { orderId } });
		if (!order) {
			return res.status(404).json({ error: "Order not found" });
		}

		await order.update({  isPaid: true});
		await Notification.create({
			userId: order.userId,
			title: "Payment Successful",
			message: `Your payment for reference number ${order.referenceNumber} has been successfully captured. Thank you for your purchase!`,
		});

		res.redirect(
			`https://721ordering.netlify.app?message=payment-success`
		);
	} catch (error) {
		console.error("Error capturing payment:", error);
		res.status(500).json({ error: "Failed to capture payment" });
	}
});

router.get("/payment-failed", async (req, res) => {
	const { token } = req.query;
	if (!token) {
		return res.status(400).json({ error: "Payment token is missing" });
	}

	try {
		const order = await OrderSummary.findOne({
			where: { downPaymentOrderId: token },
		});
		if (!order) {
			return res.status(404).json({ error: "Order not found" });
		}

		await order.update({status: "Failed", expiredAt: new Date()});
		await Notification.create({
			userId: order.userId,
			title: "Payment Failed",
			message: `Your payment for reference number ${order.referenceNumber} was not successful. Please try again.`,
		});

		res.redirect(
			"https://721ordering.netlify.app?message=payment-failed"
		); 
	} catch (error) {
		console.error("Error handling failed payment:", error);
		res.status(500).json({ error: "Failed to process payment failure" });
	}
});



// const PAYMONGO_API_KEY = "sk_test_xQUPaznwdL8WkBfuLA5p3ihK";
// router.post("/create-payment", async (req, res) => {
// 	const { amount, description, walletType, products, users, order } =
// 		req.body;

// 	console.log(products);
// 	console.log(users);
// 	console.log(order);

// 	const adjustedLineItems = products.map((item) => {
// 		return {
// 			currency: "PHP",
// 			images: [item.productImage],
// 			amount: parseInt(item.price * 100),
// 			name: item.name,
// 			quantity: item.numberOfProduct,
// 			description: "Full payment for this product",
// 		};
// 	});

// 	const referenceNumber = generateReferenceNumber();

// 	const payload = {
// 		data: {
// 			attributes: {
// 				billing: {
// 					address: {
// 						line1: users.location,
// 						country: "PH",
// 					},
// 					name: users.firstName + " " + users.lastName + " ",
// 					email: users.email,
// 					phone: users.phoneNumber,
// 				},
// 				send_email_receipt: true,
// 				show_description: true,
// 				show_line_items: true,
// 				payment_method_types: ["gcash"],
// 				line_items: adjustedLineItems,
// 				description: "Payment for selected products",
// 				reference_number: referenceNumber,
// 				statement_descriptor: "Petal and Planes",
// 				success_url: "https://yourdomain.com/payment-success",
// 				cancel_url: "https://yourdomain.com/payment-failed",
// 			},
// 		},
// 	};

// 	const jsonPayload = JSON.stringify(payload);
// 	console.log(jsonPayload);

// 	try {
// 		const sourceResponse = await axios.post(
// 			"https://api.paymongo.com/v1/checkout_sessions",
// 			payload,
// 			{
// 				headers: {
// 					Authorization: `Basic ${Buffer.from(
// 						PAYMONGO_API_KEY
// 					).toString("base64")}`,
// 					"Content-Type": "application/json",
// 				},
// 			}
// 		);
// 		const paymentSource = sourceResponse.data.data;
// 		await OrderBatch.update(
// 			{
// 				referenceNumber,
// 				paymentLink: paymentSource.attributes.checkout_url,
// 			},
// 			{ where: { id: order.id } }
// 		);
// 		res.json({
// 			redirectUrl: paymentSource.attributes.checkout_url,
// 		});
// 	} catch (error) {
// 		console.error("Error creating payment:", error);
// 		res.status(500).json({ error: "Failed to create payment" });
// 	}
// });

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
