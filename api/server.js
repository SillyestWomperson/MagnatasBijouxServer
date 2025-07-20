const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });
const { connectDB, attachDB } = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const productRoutes = require("./routes/products");

const app = express();

const allowedOrigins = [
	"http://localhost:3000",
	"https://magnatas-bijoux-server.vercel.app/",
	"https://magnatas-bijoux.netlify.app/",
];

app.use(
	cors({
		origin: allowedOrigins,
		methods: ["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachDB);

connectDB().catch((err) => console.error("Failed to connect to DB on initial setup:", err));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);

app.get("/api", (req, res) => {
	res.json({ ok: true });
});

/* app.listen(3001, () => {
	console.log("Servidor rodando localmente em: http://localhost:3001");
}); */

module.exports = app;
