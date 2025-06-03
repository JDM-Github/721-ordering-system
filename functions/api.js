const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const bodyParser = require("body-parser");
const sendEmail = require("./emailSender");
const app = express();
const router = express.Router();

const {
	sequelize,
	User,
	CartSummary,
	OrderSummary,
	Notification,
} = require("./models");

const { imageRouter } = require("./routers");
// ------------------------------------------------------
const paypal = require("@paypal/checkout-server-sdk");
const PAYPAL_CLIENT_ID =
	"AX5AGNee2pN271sDzuXWPldkFw9x_97bvDEKdpXcwNgmdE26uTD64JjEi2XRpY2AWKyUn29kicp1mocQ";
const PAYPAL_CLIENT_SECRET =
	"EIKjEnAUbgNvX6ZswF0WurD8ocna3IAiF7TyHnL_T8B_548iOSGgomNiQxFNOX3fl8CuE9uXX_ojyNup";
const environment = new paypal.core.LiveEnvironment(
	PAYPAL_CLIENT_ID,
	PAYPAL_CLIENT_SECRET
);

// const paypal = require("@paypal/checkout-server-sdk");
// const PAYPAL_CLIENT_ID =
// 	"Af0tB87keOdzXZpl_Ib8lb86Udu5oTWSL-xHDwAz4q9GiBQSFbejrkAqY2QQU5XAlYJ5PyFc6wsM45Wq";
// const PAYPAL_CLIENT_SECRET =
// 	"EO6ufyuol6bxnX_E9HV9OmpqgD9SCWI5AEEohSaLYjBpJqbsVzv650YBQDWk7mZgPIPqE0IRpoQ5Gcyu";
// const environment = new paypal.core.SandboxEnvironment(
// 	PAYPAL_CLIENT_ID,
// 	PAYPAL_CLIENT_SECRET
// );
// ------------------------------------------------------

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

// ------------------------------------------------------
const generateReferenceNumber = () => {
	const timestamp = Date.now().toString();
	const randomString = Math.random()
		.toString(36)
		.substring(2, 8)
		.toUpperCase();
	return `REF-${timestamp}-${randomString}`;
};
function calculateItemTotal(items) {
	return items.reduce((total, item) => {
		return total + parseFloat(item.unit_amount.value) * item.quantity;
	}, 0);
}
// ------------------------------------------------------

const generateReceipt = (
	user,
	reference_number,
	adjustedLineItems,
	totalItem,
	isDownpayment,
	amount
) => {
	return {
		brand: "721 Ordering",
		referenceNumber: reference_number,
		user: {
			name: user.name,
			email: user.email,
			address: user.address,
		},
		products: adjustedLineItems.map((item) => ({
			name: item.name,
			quantity: item.quantity,
			price: item.unit_amount.value,
			description: item.description,
		})),
		totalAmount: totalItem,
		isDownpayment,
		...(isDownpayment && {
			downpaymentAmount: (amount * 0.5).toFixed(2),
			remainingBalance: (amount * 0.5).toFixed(2),
		}),
		date: new Date().toISOString(),
	};
};

// ------------------------------------------------------
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
			// "http://localhost:8888/.netlify/functions/api/payment-success",
			cancel_url:
				"https://721ordering.netlify.app/.netlify/functions/api/payment-failed",
			// "http://localhost:8888/.netlify/functions/api/payment-failed",
		},
	});

	const receipt = generateReceipt(
		user,
		reference_number,
		adjustedLineItems,
		totalItem,
		isDownpayment,
		amount
	);
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
				orderId: orderId,
				products: orderIds,
				downPaymentExpiredAt: new Date(
					new Date().getTime() + 15 * 60 * 1000
				),
				isDownpayment: true,
				remainingBalance: amount / 2,
				paymentLink: approvalUrl,
				orderReceiptJson: receipt,
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
				orderReceiptJson: receipt,
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
// ------------------------------------------------------

// ------------------------------------------------------
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

		await order.update({ isPaid: true, isDownpaymentPaid: true });
		await Notification.create({
			userId: order.userId,
			title: "Payment Successful",
			message: `Your payment for reference number ${order.referenceNumber} has been successfully captured. Thank you for your purchase!`,
		});

		res.redirect(`https://721ordering.netlify.app?message=payment-success`);
	} catch (error) {
		console.error("Error capturing payment:", error);
		res.status(500).json({ error: "Failed to capture payment" });
	}
});
// ------------------------------------------------------

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

		await order.update({ status: "Failed", expiredAt: new Date() });
		await Notification.create({
			userId: order.userId,
			title: "Payment Failed",
			message: `Your payment for reference number ${order.referenceNumber} was not successful. Please try again.`,
		});
		res.redirect("https://721ordering.netlify.app?message=payment-failed");
	} catch (error) {
		console.error("Error handling failed payment:", error);
		res.status(500).json({ error: "Failed to process payment failure" });
	}
});

// ------------------------------------------------------
router.get("/test", async (req, res) => {
	const subject = `Order Status Updated`;
	const text = `Your order status has been updated to.`;
	const html = `<p>Your order status has been updated to <strong></strong>.</p>`;
	await sendEmail("jdmaster888@gmail.com", subject, text, html);
	res.status(201).json({ success: true });
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
