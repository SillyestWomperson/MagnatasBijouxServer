const { MongoClient } = require("mongodb");
require("dotenv").config({ quiet: true });

const MONGO_URI = process.env.MONGO_URI;
let dbInstance = null;

const connectDB = async () => {
	if (dbInstance) return dbInstance;

	if (!MONGO_URI) {
		console.error("MONGO_URI missing in .env");
		process.exit(1);
	}

	try {
		const client = new MongoClient(MONGO_URI);
		await client.connect();
		console.log("MongoDB Connected");
		dbInstance = client.db("MagnatasDB");
		return dbInstance;
	} catch (error) {
		console.error("Connection failed:", error.message);
		throw error;
	}
};

const attachDB = (req, res, next) => {
	connectDB()
		.then((db) => {
			req.db = db;
			next();
		})
		.catch((err) => {
			console.error("DB attach error:", err);
			res.status(500).json({ message: "Database connection failed" });
		});
};

module.exports = { connectDB, attachDB };
