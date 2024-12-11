const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

const { sequelize } = require("./models");
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

const PAYMONGO_API_KEY = "sk_test_PoK58FtMrQaHHc2EyguAKYwj";
router.post("/create-payment", async (req, res) => {
	const { amount, userId, body } = req.body;
	try {
		const sourceResponse = await axios.post(
			"https://api.paymongo.com/v1/sources",
			{
				data: {
					attributes: {
						amount: 1000 * 100,
						currency: "PHP",
						type: "gcash",
						redirect: {
							success: `http://localhost:3000/payment-success/?user=${userId}&body=${encodeURIComponent(
								JSON.stringify(body)
							)}`,
							expired: `http://localhost:3000/payment-failed/`,
							failed: `http://localhost:3000/payment-failed/`,
						},
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
		const gcashSource = sourceResponse.data.data;
		res.json({
			redirectUrl: gcashSource.attributes.redirect.checkout_url,
		});
	} catch (error) {
		console.error("Error creating payment:", error);
		res.status(500).json({
			error: "Failed to create GCash payment",
		});
	}
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
