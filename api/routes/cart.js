const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { attachDB } = require("../config/db");

const roteador = express.Router();

// GET /api/cart
roteador.get("/", authenticateToken, attachDB, async (req, res) => {
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
		if (!itensCarrinho) {
			return res.status(200).json({ message: "Nenhum item no carrinho." });
		}
		res.status(200).json({ message: "Itens do carrinho encontrados com sucesso.", cart: itensCarrinho });
	} catch (error) {
		return res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// DELETE /api/cart
roteador.delete("/", authenticateToken, attachDB, async (req, res) => {
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
// - Rota de remover um item especifico do carrinho
// Ex: DELETE /api/cart/:itemId
//
// - Rota de mudar o mudar valores (Não preço) de um produto no carrinho
// Ex: PATCH /api/cart
// Receber do req.body os parametros: productId, amount, size?, bathedType?
// Exemplo do objeto do carrinho, unica coisa que muda é amount (quantidade), size (tamanho, pode ser null) e bathedType (tipo de banho (outro, prata, sla), pode ser null)  dateAdded (data adicionado o produto no carrinho)
// {
//     productId,
//     amount,
//     size ? size : null,
//     bathedType ? bathedType : null,
//     dateAdded
// }
//
// - Rota de adicionar um item no carrinho
// EX: POST /api/cart
// Receber do req.body os parametros: productId, size, bathedType
// Se for fazer pelo jepeto, manda as outras rotas como contexto também e manda ele n mudar as rotas existentes, depois só abrir uma pull request
// Assinado: Tanese

module.exports = roteador;
