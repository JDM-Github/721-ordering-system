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
	archived: {
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
	referenceNumber: {
		type: DataTypes.STRING,
		defaultValue: "",
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

	// Pending
	// Sewing
	// Painting
	// Packing
	// Ready to Pick
	// Completed
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
};
