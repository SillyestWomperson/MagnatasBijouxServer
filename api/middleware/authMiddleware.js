const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

if (!JWT_SECRET) {
	console.error("FATAL ERROR: JWT_SECRET is not defined.");
	process.exit(1);
}

const generateToken = (userPayload) => {
	return jwt.sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const hashPassword = async (password) => {
	return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (plainPassword, hashedPassword) => {
	return bcrypt.compare(plainPassword, hashedPassword);
};

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.startsWith("Bearer ") && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ message: "Token de autenticação não fornecido." });
	}

	jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
		if (err) {
			if (err.name === "TokenExpiredError") {
				console.warn("JWT Verification Warning: Token expired for a request.");
				return res.status(401).json({ message: "Sua token expirou. Faça login novamente." });
			}
			console.error("JWT Verification Error: Invalid token provided. Details:", err.message);
			return res.status(403).json({ message: "Sua token é inválida. Acesso negado." });
		}
		req.auth = decodedPayload;
		next();
	});
};

module.exports = {
	generateToken,
	hashPassword,
	comparePassword,
	authenticateToken,
};
