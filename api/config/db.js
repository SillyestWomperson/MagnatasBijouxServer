const { MongoClient } = require("mongodb");
require("dotenv").config({ silent: true });

const MONGO_URI = process.env.MONGO_URI;

let client;
let dbInstance;

async function connectDB() {
	if (dbInstance) {
		return dbInstance;
	}
	try {
		client = new MongoClient(MONGO_URI);
		await client.connect();
		return dbInstance;
	} catch (error) {
		console.error(`MongoDB Connection Error: ${error.message}`);
		process.exit(1);
	}
}

const attachDB = async (req, res, next) => {
	try {
		if (!dbInstance) {
			await connectDB();
		}
		req.db = dbInstance;
		next();
	} catch (error) {
		console.error("Error attaching DB to request:", error);
		res.json({ ok: false, message: "Erro interno do servidor :(" });
	}
};

module.exports = { connectDB, attachDB, getDbInstance: () => dbInstance };
