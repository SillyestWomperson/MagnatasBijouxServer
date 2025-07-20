const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { attachDB } = require("../config/db");

const router = express.Router();

// GET /api/cart
router.get("/", authenticateToken, attachDB, async (req, res) => {
	try {
		const emailUser = req.auth.email;
		if (!emailUser) {
			return res.status(400).json({ message: "Não foi possível identificar o usuário." });
		}
		const colecaoUsuarios = req.db.collection("users");
		const documentoUsuario = await colecaoUsuarios.findOne(
			{ email: emailUser },
			{ projection: { password: 0, _id: 0 } }
		);

		if (!documentoUsuario) {
			return res.status(404).json({ message: "Usuário não encontrado." });
		}

		const itensCarrinho = documentoUsuario.cart || [];

		res.status(200).json({ message: "Itens do carrinho encontrados com sucesso.", cart: itensCarrinho });
	} catch (error) {
		console.error("Erro ao recuperar carrinho:", error);
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// DELETE /api/cart
router.delete("/", authenticateToken, attachDB, async (req, res) => {
	try {
		const emailUser = req.auth.email;
		if (!emailUser) {
			return res.status(400).json({ message: "Não foi possível identificar o usuário." });
		}
		const colecaoUsuarios = req.db.collection("users");
		const resultado = await colecaoUsuarios.updateOne({ email: emailUser }, { $set: { cart: [] } });
		if (resultado.matchedCount === 0) {
			return res.status(404).json({ message: "Usuário não encontrado." });
		}
		if (resultado.modifiedCount === 0) {
			return res.status(200).json({ message: "Carrinho já está vazio." });
		}
		res.status(200).json({ message: "Carrinho foi limpado com sucesso.", cart: [] });
	} catch (error) {
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// ----------------------------
// Itens Faltando (Gabriel)
// ----------------------------

// POST /api/cart - Rota para adicionar um item no carrinho
// Se o item já existir no carrinho, incrementa a quantidade. Caso contrário, adiciona o novo item.
router.post("/", authenticateToken, attachDB, async (req, res) => {
	try {
		const emailUser = req.auth.email;
		const { productId, size, bathedType } = req.body;

		if (!productId) {
			return res.status(400).json({ message: "O ID do produto é obrigatório." });
		}

		const colecaoUsuarios = req.db.collection("users");

		const usuario = await colecaoUsuarios.findOne({ email: emailUser });
		if (!usuario) {
			return res.status(404).json({ message: "Usuário não encontrado." });
		}

		const itemExistente = usuario.cart.find(
			(item) => item.productId === productId && item.size === size && item.bathedType === bathedType
		);

		if (itemExistente) {
			const resultado = await colecaoUsuarios.updateOne(
				{ email: emailUser, "cart.productId": productId },
				{ $inc: { "cart.$.amount": 1 } }
			);

			if (resultado.modifiedCount === 0) {
				return res.status(400).json({ message: "Não foi possível atualizar a quantidade do item." });
			}
			res.status(200).json({ message: "Quantidade do item atualizada com sucesso." });
		} else {
			const novoItem = {
				productId,
				amount: 1,
				size: size ? size : null,
				bathedType: bathedType ? bathedType : null,
				dateAdded: new Date(),
			};
			const resultado = await colecaoUsuarios.updateOne({ email: emailUser }, { $push: { cart: novoItem } });

			if (resultado.modifiedCount === 0) {
				return res.status(400).json({ message: "Não foi possível adicionar o item ao carrinho." });
			}
			res.status(201).json({ message: "Item adicionado ao carrinho com sucesso.", item: novoItem });
		}
	} catch (error) {
		res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// DELETE /api/cart/:productId - Rota para remover um item específico do carrinho
router.delete("/:productId", authenticateToken, attachDB, async (req, res) => {
	try {
		const emailUser = req.auth.email;
		const { productId } = req.params;

		if (!productId) {
			return res.status(400).json({ message: "O ID do produto é obrigatório." });
		}

		const colecaoUsuarios = req.db.collection("users");
		const resultado = await colecaoUsuarios.updateOne(
			{ email: emailUser },
			{ $pull: { cart: { productId: productId } } }
		);

		if (resultado.matchedCount === 0) {
			return res.status(404).json({ message: "Usuário não encontrado." });
		}
		if (resultado.modifiedCount === 0) {
			return res.status(404).json({ message: "Item não encontrado no carrinho." });
		}
		res.status(200).json({ message: "Item removido do carrinho com sucesso." });
	} catch (error) {
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// PATCH /api/cart - Rota para mudar valores de um produto no carrinho
router.patch("/", authenticateToken, attachDB, async (req, res) => {
	try {
		const emailUser = req.auth.email;
		const { productId, amount, size, bathedType } = req.body;

		if (!productId) {
			return res.status(400).json({ message: "O ID do produto é obrigatório." });
		}
		if (amount !== undefined && amount <= 0) {
			return res.status(400).json({ message: "A quantidade deve ser maior que zero." });
		}

		const colecaoUsuarios = req.db.collection("users");
		const camposParaAtualizar = {};

		if (amount !== undefined) camposParaAtualizar["cart.$[item].amount"] = amount;
		if (size !== undefined) camposParaAtualizar["cart.$[item].size"] = size;
		if (bathedType !== undefined) camposParaAtualizar["cart.$[item].bathedType"] = bathedType;

		if (Object.keys(camposParaAtualizar).length === 0) {
			return res.status(400).json({ message: "Nenhum campo para atualizar foi fornecido." });
		}

		const resultado = await colecaoUsuarios.updateOne(
			{ email: emailUser },
			{ $set: camposParaAtualizar },
			{ arrayFilters: [{ "item.productId": productId }] }
		);

		if (resultado.matchedCount === 0) {
			return res.status(404).json({ message: "Usuário não encontrado." });
		}
		if (resultado.modifiedCount === 0) {
			return res.status(404).json({ message: "Item não encontrado no carrinho para ser atualizado." });
		}
		res.status(200).json({ message: "Item do carrinho atualizado com sucesso." });
	} catch (error) {
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

module.exports = router;
