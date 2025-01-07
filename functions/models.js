require("dotenv").config();
const pg = require("pg");
const fs = require("fs");
const { Sequelize, DataTypes, INTEGER } = require("sequelize");
const sequelize = new Sequelize(
	"postgresql://blue:XkS5RPgPRwHOkC8kjDmJQw@ok-wizard-4026.jxf.gcp-asia-southeast1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full",
	{
		dialect: "postgres",
		dialectModule: pg,
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
	}
);

const Product = sequelize.define(
	"Product",
	{
		productImages: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: [""],
		},
		productAllNames: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: [""],
		},
		productName: {
			type: DataTypes.STRING,
			defaultValue: "",
		},
		price: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		size: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: ["S", "M", "L", "XL"],
		},
		stocks: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		description: {
			type: DataTypes.STRING,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: "Available",
		},
		isArchive: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		isCustomizable: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		timestamps: true,
	}
);

const Materials = sequelize.define("Material", {
	name: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	quantity: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
	price: {
		type: DataTypes.DECIMAL,
		defaultValue: 0.0,
	},
	unitType: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	isArchive: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
});

const User = sequelize.define("User", {
	profileImage: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	firstName: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	lastName: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	middleName: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	address: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	contactNumber: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	email: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	password: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	username: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	isVerified: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	failedAttempt: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
	accountLocked: {
		type: DataTypes.DATE,
		defaultValue: null,
	},
	verificationCode: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	forgotPasswordCode: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	lastSendVerificationCode: {
		type: DataTypes.DATE,
		defaultValue: null,
	},
	lastSendPasswordVerificationCode: {
		type: DataTypes.DATE,
		defaultValue: null,
	},
});

const OrderProduct = sequelize.define(
	"OrderProduct",
	{
		userId: {
			type: DataTypes.INTEGER,
			references: {
				model: "Users",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: "Pending",
		},
		productId: {
			type: DataTypes.INTEGER,
			references: {
				model: "Products",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		isOrdered: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		completedAt: {
			type: DataTypes.DATE,
			defaultValue: null,
		},
		quantity: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
		},
		customization: {
			type: DataTypes.JSON,
			defaultValue: {},
		},
	},
	{
		timestamps: true,
	}
);
Product.hasMany(OrderProduct, {
	foreignKey: "productId",
});
OrderProduct.belongsTo(Product, {
	foreignKey: "productId",
});

const OrderSummary = sequelize.define("OrderSummary", {
	userId: {
		type: DataTypes.INTEGER,
		references: {
			model: "Users",
			key: "id",
		},
		onDelete: "CASCADE",
	},
	orderId: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	downPaymentOrderId: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	expiredAt: {
		type: DataTypes.DATE,
		defaultValue: null,
	},
	downPaymentExpiredAt: {
		type: DataTypes.DATE,
		defaultValue: null,
	},

	referenceNumber: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	isDownpayment: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	remainingBalance: {
		type: DataTypes.DECIMAL,
		defaultValue: 0.0,
	},
	isDownpaymentPaid: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	isDownPaymentExpired: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	isPaid: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	isExpired: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	isFailed: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	products: {
		type: DataTypes.ARRAY(DataTypes.INTEGER),
		defaultValue: [],
	},
	isCompleted: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	status: {
		type: DataTypes.STRING,
		defaultValue: "Pending",
	},
	paymentLink: {
		type: DataTypes.STRING,
		defaultValue: ""
	},
	alreadyFeedback: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
});

const Notification = sequelize.define("Notification", {
	userId: {
		type: DataTypes.INTEGER,
		references: {
			model: "Users",
			key: "id",
		},
		onDelete: "CASCADE",
	},
	title: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	message: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
},
{
	timestamps: true
});

const Feedback = sequelize.define("Feedback", {
	userId: {
		type: DataTypes.INTEGER,
		references: {
			model: "Users",
			key: "id",
		},
		onDelete: "CASCADE",
	},
	orderId: {
		type: DataTypes.INTEGER,
		defaultValue: null
	},
	rate: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	},
	comment: {
		type: DataTypes.STRING,
		defaultValue: ""
	}
},{
	timestamps: true
});

User.hasMany(OrderSummary, {
	foreignKey: "userId",
});
OrderSummary.belongsTo(User, {
	foreignKey: "userId",
});

User.hasMany(Feedback, {
	foreignKey: "userId",
});
Feedback.belongsTo(User, {
	foreignKey: "userId",
});

const CartSummary = sequelize.define("CartSummary", {
	userId: {
		type: DataTypes.INTEGER,
		references: {
			model: "Users",
			key: "id",
		},
		onDelete: "CASCADE",
	},
	products: {
		type: DataTypes.ARRAY(DataTypes.INTEGER),
		defaultValue: [],
	},
});
User.hasMany(CartSummary, {
	foreignKey: "userId",
});
CartSummary.belongsTo(User, {
	foreignKey: "userId",
});

const OrderItem = sequelize.define(
	"OrderItem",
	{
		userId: {
			type: DataTypes.INTEGER,
			references: {
				model: "Users",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		productOrderId: {
			type: DataTypes.INTEGER,
			references: {
				model: "OrderProducts",
				key: "id",
			},
			onDelete: "CASCADE",
		},
	},
	{
		timestamps: true,
	}
);
User.hasMany(OrderItem, {
	foreignKey: "userId",
});
OrderItem.belongsTo(User, {
	foreignKey: "userId",
});
User.hasMany(OrderProduct, {
	foreignKey: "productOrderId",
});
OrderProduct.belongsTo(User, {
	foreignKey: "productOrderId",
});

OrderSummary.belongsToMany(Product, { through: "OrderSummaryProducts" });
Product.belongsToMany(OrderSummary, { through: "OrderSummaryProducts" });

module.exports = {
	sequelize,
	Materials,
	Product,
	User,
	OrderProduct,
	OrderSummary,
	CartSummary,
	OrderItem,
	Notification,
	Feedback,
};
