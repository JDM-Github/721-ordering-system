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
		productImage: {
			type: DataTypes.STRING,
			defaultValue: "",
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
		patterns: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: ["Plain", "Striped", "Graphic"],
		},
		availableColors: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			defaultValue: ["White", "Black", "Red", "Blue", "Green"],
		},
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

// const User = sequelize.define(
// 	"User",
// 	{
// 		id: {
// 			type: Sequelize.INTEGER,
// 			autoIncrement: true,
// 			primaryKey: true,
// 		},
// 		profileImage: {
// 			type: DataTypes.STRING,
// 			defaultValue: "",
// 		},
// 		firstName: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		lastName: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		username: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 			unique: true,
// 		},
// 		organizationName: {
// 			type: DataTypes.STRING,
// 			allowNull: true, // Use null since it's required for sellers
// 			validate: {
// 				notEmpty: function (value) {
// 					if (this.isSeller && !value) {
// 						throw new Error(
// 							"Organization Name is required for sellers"
// 						);
// 					}
// 				},
// 			},
// 		},
// 		birthdate: {
// 			type: DataTypes.DATEONLY,
// 			allowNull: false,
// 			validate: {
// 				isDate: true,
// 			},
// 		},
// 		email: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 			unique: true,
// 			validate: {
// 				isEmail: true,
// 			},
// 		},
// 		password: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		isSeller: {
// 			type: DataTypes.BOOLEAN,
// 			defaultValue: false,
// 		},
// 		isVerified: {
// 			type: DataTypes.BOOLEAN,
// 			defaultValue: false,
// 		},
// 		phoneNumber: {
// 			type: DataTypes.STRING,
// 			defaultValue: "",
// 		},
// 		location: {
// 			type: DataTypes.STRING,
// 			defaultValue: "",
// 		},
// 		numberProduct: {
// 			type: DataTypes.INTEGER,
// 			defaultValue: 0,
// 		},
// 		online: {
// 			type: DataTypes.BOOLEAN,
// 			defaultValue: false,
// 		},
// 		logoutTime: {
// 			type: DataTypes.DATE,
// 			allowNull: true,
// 		},
// 		isStreaming: {
// 			type: DataTypes.BOOLEAN,
// 			defaultValue: false,
// 		},
// 		// streamId: {
// 		// 	type: DataTypes.STRING,
// 		// 	defaultValue: "",
// 		// },
// 		streamUrl: {
// 			type: DataTypes.STRING,
// 			defaultValue: "",
// 		},
// 		isArchived: {
// 			type: DataTypes.BOOLEAN,
// 			allowNull: false,
// 			defaultValue: false,
// 		},
// 	},
// 	{
// 		timestamps: true,
// 	}
// );

// const ChatMessage = sequelize.define("ChatMessage", {
// 	// This will be something like this
// 	// { {'sender': '12345', 'message': "HAHA"}, {'sender': '23456', 'message': "NO HAHA"} }
// 	messages: {
// 		type: DataTypes.JSON,
// 		defaultValue: [],
// 	},
// });
// const Chat = sequelize.define("Chat", {
// 	userId: {
// 		type: DataTypes.INTEGER,
// 		references: {
// 			model: "Users",
// 			key: "id",
// 		},
// 		onDelete: "CASCADE",
// 	},
// 	// this will be use something like this
// 	// example my partner is JD
// 	// so chatPartner will have a key of JD id,
// 	// and Value of ChatMessage
// 	// '1234213': '12143234'
// 	// so when I get the the ChatMessage, I just need to get the partner id
// 	// and get the ChatMessage using the Value I get

// 	// My partner and me will have the same thing ChatMessage id
// 	chatPartner: {
// 		type: DataTypes.JSON,
// 		defaultValue: {},
// 	},
// });

// const Product = sequelize.define(
// 	"Product",
// 	{
// 		id: {
// 			type: Sequelize.INTEGER,
// 			autoIncrement: true,
// 			primaryKey: true,
// 		},
// 		name: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		userId: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 			references: {
// 				model: "Users",
// 				key: "id",
// 			},
// 			onDelete: "CASCADE",
// 		},
// 		product_image: {
// 			type: DataTypes.STRING,
// 			allowNull: true,
// 		},
// 		product_images: {
// 			type: DataTypes.ARRAY(DataTypes.STRING),
// 			allowNull: true,
// 		},
// 		price: {
// 			type: DataTypes.DECIMAL,
// 			allowNull: false,
// 		},
// 		number_of_stock: {
// 			type: DataTypes.INTEGER,
// 			defaultValue: 0,
// 		},
// 		number_of_sold: {
// 			type: DataTypes.INTEGER,
// 			defaultValue: 0,
// 			allowNull: false,
// 		},
// 		specification: {
// 			type: DataTypes.TEXT,
// 			allowNull: false,
// 		},
// 		active: {
// 			type: DataTypes.BOOLEAN,
// 			allowNull: true,
// 		},
// 		category: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		isArchived: {
// 			type: DataTypes.BOOLEAN,
// 			allowNull: false,
// 			defaultValue: false,
// 		},
// 	},
// 	{
// 		timestamps: true,
// 	}
// );

// const Order = sequelize.define(
// 	"Order",
// 	{
// 		productId: {
// 			type: DataTypes.INTEGER,
// 			allowNull: true,
// 			references: {
// 				model: "Products",
// 				key: "id",
// 			},
// 			onDelete: "CASCADE",
// 		},
// 		userId: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 			references: {
// 				model: "Users",
// 				key: "id",
// 			},
// 			onDelete: "CASCADE",
// 		},
// 		sellerId: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 			references: {
// 				model: "Users",
// 				key: "id",
// 			},
// 			onDelete: "CASCADE",
// 		},
// 		numberOfProduct: {
// 			type: DataTypes.INTEGER,
// 			defaultValue: 1,
// 		},

// 		// This is all track, example
// 		// Your delievery is in blah blah
// 		// Your delievery is tranported in manila
// 		allTrack: {
// 			type: DataTypes.ARRAY(DataTypes.STRING),
// 			defaultValue: [],
// 		},
// 		toPay: {
// 			type: DataTypes.BOOLEAN,
// 			defaultValue: false,
// 		},
// 		toShip: {
// 			type: DataTypes.BOOLEAN,
// 			defaultValue: false,
// 		},
// 		toRecieve: {
// 			type: DataTypes.BOOLEAN,
// 			defaultValue: false,
// 		},
// 		isComplete: {
// 			type: DataTypes.BOOLEAN,
// 			defaultValue: false,
// 		},
// 	},
// 	{
// 		timestamps: true,
// 	}
// );

// const Cart = sequelize.define(
// 	"Cart",
// 	{
// 		productId: {
// 			type: DataTypes.INTEGER,
// 			allowNull: true,
// 			references: {
// 				model: "Products",
// 				key: "id",
// 			},
// 			onDelete: "CASCADE",
// 		},
// 		userId: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 			references: {
// 				model: "Users",
// 				key: "id",
// 			},
// 			onDelete: "CASCADE",
// 		},
// 		numberOfCart: {
// 			type: DataTypes.INTEGER,
// 			defaultValue: 1,
// 		},
// 	},
// 	{
// 		timestamps: true,
// 	}
// );

// const Rate = sequelize.define(
// 	"Rate",
// 	{
// 		rating: {
// 			type: DataTypes.FLOAT,
// 			allowNull: false,
// 			validate: {
// 				min: 0,
// 				max: 5,
// 			},
// 		},
// 		productId: {
// 			type: DataTypes.INTEGER,
// 			allowNull: true,
// 			references: {
// 				model: "Products",
// 				key: "id",
// 			},
// 			onDelete: "CASCADE",
// 		},
// 		userId: {
// 			type: DataTypes.INTEGER,
// 			allowNull: false,
// 			references: {
// 				model: "Users",
// 				key: "id",
// 			},
// 			onDelete: "CASCADE",
// 		},
// 	},
// 	{
// 		timestamps: true,
// 	}
// );

// Product.hasMany(Customization, {
// 	foreignKey: "productId",
// 	onDelete: "CASCADE",
// });
// Customization.belongsTo(Product, {
// 	foreignKey: "productId",
// });

// // FOR ORDER
// User.hasMany(Order, {
// 	foreignKey: "userId",
// 	as: "CustomerOrders",
// 	onDelete: "CASCADE",
// });

// User.hasMany(Order, {
// 	foreignKey: "sellerId",
// 	as: "SellerOrders",
// 	onDelete: "CASCADE",
// });

// Order.belongsTo(User, {
// 	foreignKey: "userId",
// 	as: "Customer",
// });

// Order.belongsTo(User, {
// 	foreignKey: "sellerId",
// 	as: "Seller",
// });

// Product.hasMany(Order, {
// 	foreignKey: "productId",
// 	as: "ProductOrders",
// 	onDelete: "CASCADE",
// });
// Order.belongsTo(Product, {
// 	foreignKey: "productId",
// 	as: "Product",
// });

// User.hasMany(Cart, {
// 	foreignKey: "userId",
// 	as: "CustomerCart",
// 	onDelete: "CASCADE",
// });
// Cart.belongsTo(User, {
// 	foreignKey: "userId",
// 	as: "Customer",
// 	onDelete: "CASCADE",
// });

// Product.hasMany(Cart, {
// 	foreignKey: "productId",
// 	as: "CartProduct",
// 	onDelete: "CASCADE",
// });
// Cart.belongsTo(Product, {
// 	foreignKey: "productId",
// 	as: "Product",
// 	onDelete: "CASCADE",
// });
// module.exports = {
// 	sequelize,
// 	User,
// 	Product,
// 	Rate,
// 	ChatMessage,
// 	Chat,
// 	Order,
// 	Cart,
// };

module.exports = {
	sequelize,
	Product,
	User,
	OrderProduct,
	OrderSummary,
	CartSummary,
	OrderItem,
};
