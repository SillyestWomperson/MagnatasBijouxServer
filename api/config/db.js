const { MongoClient } = require("mongodb");
require("dotenv").config({ silent: true });

const MONGO_URI = process.env.MONGO_URI;

let client;
let dbInstance;

const connectDB = async () => {
	if (dbInstance && client && client.topology.isConnected()) {
		return dbInstance;
	}

	if (!MONGO_URI) {
		process.exit(1);
	}

	try {
		client = new MongoClient(MONGO_URI);
		await client.connect();
		return dbInstance;
	} catch (error) {
		console.error(`MongoDB Connection Error: ${error.message}`);
		return res.status(500).json({ message: "Ocorreu um erro interno ao conectar ao banco de dados." });
	}
};

const attachDB = async (req, res, next) => {
	try {
		if (!dbInstance) {
			await connectDB();
		}
		req.db = dbInstance;
		next();
	} catch (error) {
		console.error("Error attaching DB to request:", error);
		return res.status(500).json({ message: "Ocorreu um erro interno ao conectar ao banco de dados." });
	}
};

module.exports = { connectDB, attachDB, getDbInstance: () => dbInstance };
