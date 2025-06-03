// const nodemailer = require("nodemailer");

// let transporter = nodemailer.createTransport({
// 	service: "gmail",
// 	auth: {
// 		user: "bluebanana6789@gmail.com",
// 		pass: "ukmy rkno coub uvev",
// 	},
// });

// async function sendEmail(to, subject, text, html, callback) {
// 	const mailOptions = {
// 		from: "bluebanana6789@gmail.com",
// 		to: to,
// 		subject: subject,
// 		text: text,
// 		html: html,
// 	};

// 	transporter.sendMail(mailOptions, (error, info) => {
// 		if (error) {
// 			return callback(error, null);
// 		}
// 		callback(null, `Message sent: ${info.messageId}`);
// 	});
// }

// module.exports = sendEmail;

async function sendEmail(to, subject, text, html) {
	const { SMTPClient } = await import("emailjs");

	const client = new SMTPClient({
		user: "bluebanana6789@gmail.com",
		password: "ukmy rkno coub uvev",
		host: "smtp.gmail.com",
		ssl: true,
	});

	return new Promise((resolve, reject) => {
		client.send(
			{
				text: text,
				from: "bluebanana6789@gmail.com",
				to: to,
				subject: subject,
				attachment: [{ data: html, alternative: true }],
			},
			(err, message) => {
				if (err) {
					reject(err);
				} else {
					resolve(message);
				}
			}
		);
	});
}

module.exports = sendEmail;
