const express = require("express");
const cors = require("cors");
require("dotenv").config({ silent: true });
const { connectDB, attachDB } = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");

const app = express();

const allowedOrigins = ["http://localhost:3000"];

app.use(
	cors({
		origin: allowedOrigins,
		methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB().catch((err) => console.error("Failed to connect to DB on initial sectup", err));

app.use(attachDB);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);

app.get("/api", (req, res) => {
	res.json({ ok: true });
});

app.listen(3001, () => {
	console.log("Servidor rodando localmente em: http://localhost:3000");
});

module.exports = app;
