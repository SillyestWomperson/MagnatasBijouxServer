const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { attachDB } = require("../config/db");

const router = express.Router();

// GET /api/users/me
router.get("/me", authenticateToken, attachDB, async (req, res, next) => {
	try {
		const userEmail = req.auth.email;

		if (!userEmail) {
			return res.status(400).json({ message: "Não foi possível identificar o usuário." });
		}

		const usersCollection = req.db.collection("users");
		const userDoc = await usersCollection.findOne({ email: userEmail }, { projection: { password: 0, _id: 0 } });

		if (!userDoc) {
			return res.status(404).json({ message: "Usuário não encontrado." });
		}

		res.status(200).json({ message: "Dados do usuário recuperados com sucesso.", user: userDoc });
	} catch (error) {
		console.error("Erro ao recuperar dados do usuário:", error);
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// PUT /api/users/update
router.put("/update", authenticateToken, attachDB, async (req, res, next) => {
	try {
		const userEmail = req.auth.email;
		const { name, surname, profilePicURL } = req.body;

		if (!userEmail) {
			return res.status(400).json({ message: "Não foi possível identificar o usuário para atualização." });
		}

		const updateFields = {};
		if (name !== undefined) updateFields.name = name;
		if (surname !== undefined) updateFields.surname = surname;
		if (profilePicURL !== undefined) updateFields.profilePicURL = profilePicURL;

		if (Object.keys(updateFields).length === 0) {
			return res.status(400).json({ message: "Nenhum campo fornecido para atualização." });
		}

		const usersCollection = req.db.collection("users");

		const updateResult = await usersCollection.updateOne({ email: userEmail }, { $set: updateFields });

		if (updateResult.matchedCount === 0) {
			return res.status(404).json({ message: "Usuário não encontrado para atualização." });
		}

		const updatedUserDoc = await usersCollection.findOne(
			{ email: userEmail },
			{ projection: { password: 0, _id: 0 } }
		);

		if (!updatedUserDoc) {
			return res.status(404).json({ message: "Usuário atualizado, mas não encontrado para retorno." });
		}

		res.status(200).json({ message: "Dados do usuário atualizados com sucesso.", user: updatedUserDoc });
	} catch (error) {
		console.error("Erro ao atualizar dados do usuário:", error);
		return res
			.status(500)
			.json({ message: "Ocorreu um erro interno ao tentar atualizar o usuário. Tente novamente mais tarde." });
	}
});

module.exports = router;
