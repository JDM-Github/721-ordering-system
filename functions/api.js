const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
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

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
