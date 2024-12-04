require("dotenv").config();
const pg = require("pg");
const fs = require("fs");
const { Sequelize, DataTypes, INTEGER } = require("sequelize");
const sequelize = new Sequelize(
	"postgresql://jdm:gA00MXJG6XdxLl7tZvCuEA@jdm-master-15017.7tt.aws-us-east-1.cockroachlabs.cloud:26257/online721?sslmode=verify-full",
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
		// productImage: {
		// 	type: DataTypes.STRING,
		// 	defaultValue: "",
		// },
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
		isCustomizable: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		// patterns: {
		// 	type: DataTypes.ARRAY(DataTypes.STRING),
		// 	defaultValue: ["Plain", "Striped", "Graphic"],
		// },
		// availableColors: {
		// 	type: DataTypes.ARRAY(DataTypes.STRING),
		// 	defaultValue: ["White", "Black", "Red", "Blue", "Green"],
		// },
	},
	{
		timestamps: true,
	}
);

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
		productId: {
			type: DataTypes.INTEGER,
			references: {
				model: "Products",
				key: "id",
			},
			onDelete: "CASCADE",
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
	products: {
		type: DataTypes.ARRAY(DataTypes.INTEGER),
		defaultValue: [],
	},
});

User.hasMany(OrderSummary, {
	foreignKey: "userId",
});
OrderSummary.belongsTo(User, {
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

module.exports = {
	sequelize,
	Product,
	User,
	OrderProduct,
	OrderSummary,
	CartSummary,
	OrderItem,
};
