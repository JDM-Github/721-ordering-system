const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const multer = require("multer");

const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
	cloud_name: "djheiqm47",
	api_key: "692765673474153",
	api_secret: "kT7k8hvxo-bqMWL0aHB2o3k90dA",
});

// bluebanana6789@gmail.com
// uuhj gpjx hwqm lhaw

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadToCloudinary(buffer) {
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream({ resource_type: "auto" }, (error, result) => {
				if (error) reject(error);
				else resolve(result.secure_url);
			})
			.end(buffer);
	});
}

class ImageHandler {
	constructor() {
		this.router = express.Router();
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.post(
			"/upload-image",
			upload.single("file"),
			expressAsyncHandler(this.uploadImageToCloudinary)
		);
	}

	async uploadImageToCloudinary(req, res) {
		const serviceFile = req.file;

		try {
			const uploadedUrl = await uploadToCloudinary(serviceFile.buffer);
			console.log(uploadedUrl);
			res.send({
				success: true,
				uploadedDocument: uploadedUrl,
			});
		} catch (error) {
			res.send({
				success: false,
				message: `An error occurred while creating the request. ${error.message}`,
			});
		}
	}
}

const imageRouter = new ImageHandler().router;
module.exports = { imageRouter };
