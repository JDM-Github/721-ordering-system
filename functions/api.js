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
	CartSummary,
	OrderProduct,
	OrderSummary,
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

// paymongo.auth("sk_test_PoK58FtMrQaHHc2EyguAKYwj");
// paymongo
// 	.createALink({
// 		data: {
// 			attributes: {
// 				amount: 100,
// 				description: "Order Product",
// 				remarks: "Order a product",
// 			},
// 		},
// 	})
// 	.then(({ data }) => console.log(data))
// 	.catch((err) => console.error(err));
const PAYMONGO_API_KEY = "sk_test_PoK58FtMrQaHHc2EyguAKYwj";
router.post("/create-payment", async (req, res) => {
	const { amount, userId, orders } = req.body;
	const orderIds = orders.map((order) => order.id);

	try {
		const response = await axios.post(
			"https://api.paymongo.com/v1/links",
			{
				data: {
					attributes: {
						amount: Math.max(amount, 100) * 100,
						currency: "PHP",
						description: "Order Product",
						remarks: "Order a product",
					},
				},
			},
			{
				headers: {
					Authorization: `Basic ${Buffer.from(
						PAYMONGO_API_KEY
					).toString("base64")}`,
					"Content-Type": "application/json",
				},
			}
		);

		const checkoutUrl = response.data.data.attributes.checkout_url;
		const referenceNumber = response.data.data.attributes.reference_number;

		const cart = await CartSummary.findOne({ where: { userId } });
		if (cart) {
			const updatedProducts = cart.products.filter(
				(productId) => !orderIds.includes(productId)
			);
			await cart.update({ products: updatedProducts });
			console.log("Cart updated after removing ordered products.");
		}

		await OrderSummary.create({
			userId: userId,
			referenceNumber: referenceNumber,
			products: orderIds,
		});

		res.send({
			success: true,
			redirectUrl: checkoutUrl,
			referenceNumber: referenceNumber,
		});
	} catch (error) {
		console.error("Error creating payment:", error);
		res.status(500).json({
			success: false,
			error: "Failed to create payment link",
		});
	}
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
