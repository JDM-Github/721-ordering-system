require("dotenv").config();
const fs = require("fs");
const pg = require("pg");

module.exports = {
	development: {
		use_env_variable: "DATABASE_URL",
		dialect: "postgres",
		dialectModule: pg,
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
	},
};
