const express = require("express");
const { generateToken, hashPassword, comparePassword, authenticateToken } = require("../middleware/authMiddleware");
const { attachDB } = require("../config/db");

const router = express.Router();

// POST /api/auth/login
router.post("/login", attachDB, async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: "Email e senha são obrigatórios." });
		}

		const usersCollection = req.db.collection("users");
		const userDoc = await usersCollection.findOne({ email: email });

		if (!userDoc) {
			return res.status(404).json({ message: "Usuário não encontrado." });
		}

		const isMatch = await comparePassword(password, userDoc.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Senha incorreta." });
		}

		const tokenPayload = {
			email: userDoc.email,
			name: userDoc.name,
			surname: userDoc.surname,
		};

		const token = generateToken(tokenPayload);

		const { password: _p, _id, ...userClientData } = userDoc;

		res.status(200).json({ message: "Login bem-sucedido", user: userClientData, token: token });
	} catch (error) {
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// POST /api/auth/register
router.post("/register", attachDB, async (req, res, next) => {
	try {
		const { name, surname, email, password } = req.body;

		if (!name || !surname || !email || !password) {
			return res.status(400).json({ message: "Campos obrigatórios ausentes para registro." });
		}

		const usersCollection = req.db.collection("users");
		let existingUser = await usersCollection.findOne({ email: email });
		if (existingUser) {
			return res.status(401).json({ message: "Este email já está em uso." });
		}

		const hashedPassword = await hashPassword(password);
		const currentDate = new Date();

		const newUserDoc = {
			email,
			password: hashedPassword,
			name,
			surname,
			cart: [],
			profilePicURL: "",
			dateCreated: currentDate,
		};

		await usersCollection.insertOne(newUserDoc);

		res.status(201).json({ message: "Registro bem-sucedido" });
	} catch (error) {
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// POST /api/auth/logout
router.post("/logout", authenticateToken, attachDB, async (req, res, next) => {
	res.status(200).json({ message: "Logout bem-sucedido." });
});

// DELETE /api/auth/delete
router.delete("/delete", authenticateToken, attachDB, async (req, res, next) => {
	try {
		const userEmail = req.auth.email;
		if (!userEmail) {
			return res
				.status(400)
				.json({ message: "Não foi possível identificar o usuário para exclusão. Token inválida ou audente." });
		}

		const usersCollection = req.db.collection("users");
		const result = await usersCollection.deleteOne({ email: userEmail });

		if (result.deletedCount === 1) {
			return res.status(200).json({ message: "Usuário excluido com sucesso." });
		} else {
			return res.status(404).json({ message: "Usuário não encontrado para exclusão." });
		}
	} catch (error) {
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// PATCH /api/auth/change-password
router.patch("/change-password", authenticateToken, attachDB, async (req, res) => {
	try {
		const userEmail = req.auth.email;
		const { currentPassword, newPassword } = req.body;

		if (!userEmail || !currentPassword || !newPassword) {
			return res.status(400).json({ message: "Todos os campos são obrigatórios." });
		}

		const usersCollection = req.db.collection("users");
		const userDoc = await usersCollection.findOne({ email: userEmail });

		if (!userDoc) {
			return res.status(404).json({ message: "Usuário não encontrado." });
		}

		const isMatch = await comparePassword(currentPassword, userDoc.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Senha atual incorreta." });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: "A nova senha deve ter no mínimo 6 caracteres." });
		}

		const hashedNewPassword = await hashPassword(newPassword);

		const result = await usersCollection.updateOne({ email: userEmail }, { $set: { password: hashedNewPassword } });

		if (result.modifiedCount === 0) {
			return res.status(500).json({ message: "Não foi possível atualizar a senha. Tente novamente." });
		}

		res.status(200).json({ message: "Senha alterada com sucesso." });
	} catch (error) {
		console.error("Erro ao mudar a senha:", error);
		return res
			.status(500)
			.json({ message: "Ocorreu um erro interno ao mudar a senha. Tente novamente mais tarde." });
	}
});

module.exports = router;
