// const nodemailer = require("nodemailer");

// // You can use this for your website, Makes authentication possible.
// // You just need to think how you use this. This is same for the sms authentication
// let transporter = nodemailer.createTransport({
// 	service: "gmail",
// 	auth: {
// 		user: "jdmaster888@gmail.com",
// 		// user: "jilianamarie51@gmail.com",
// 		// pass: "nlrd rsvm ipby xgqd",
// 		pass: "mxvj qric haou eibj",
// 	},
// });
// /**
//  * Function to send an email
//  * @param {string} to - The recipient email address
//  * @param {string} subject - The subject of the email
//  * @param {string} text - The plain text content of the email
//  * @param {string} html - The HTML content of the email
//  * @param {function} callback - Callback function to handle success or error
//  */
// function sendEmail(to, subject, text, html) {
// 	const mailOptions = {
// 		from: "jilianamarie51@gmail.com",
// 		to: to,
// 		subject: subject,
// 		text: text,
// 		html: html,
// 	};

// 	transporter.sendMail(mailOptions, (error, info) => {

// 	});
// }

// module.exports = sendEmail;

const nodemailer = require("nodemailer");

// You can use this for your website, Makes authentication possible.
// You just need to think how you use this. This is same for the sms authentication
let transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "bluebanana6789@gmail.com",
		// user: "taneo.ja342600@gmail.com",
		// pass: "nlrd rsvm ipby xgqd",
		pass: "ukmy rkno coub uvev",
		// user: "grijaldekimjazel@gmail.com",
		// pass: "uxfz vsvg enue iiyr",
	},
	// tls: {
    //     rejectUnauthorized: false 
    // },
	// socketTimeout: 50000,
	// connectionTimeout: 50000,
});

function sendEmail(to, subject, text, html, callback) {
	const mailOptions = {
		from: "bluebanana6789@gmail.com",
		to: to,
		subject: subject,
		text: text,
		html: html,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return callback(error, null);
		}
		callback(null, `Message sent: ${info.messageId}`);
	});
}

module.exports = sendEmail;
