const express = require("express");
const { attachDB } = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/products
router.get("/", attachDB, async (req, res) => {
	try {
		const productsCollection = req.db.collection("products");
		const products = await productsCollection.find({}).toArray();

		if (!products || products.length === 0) {
			return res.status(404).json({ message: "Nenhum produto encontrado." });
		}

		res.status(200).json({ message: "Produtos recuperados com sucesso.", products: products });
	} catch (error) {
		res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// GET /api/products/:productId
router.get("/:productId", attachDB, async (req, res) => {
	try {
		const { productId } = req.params;
		if (!productId) {
			return res.status(400).json({ message: "O ID do produto é obrigatório." });
		}

		const productsCollection = req.db.collection("products");
		const product = await productsCollection.findOne({ productId: productId });

		if (!product) {
			return res.status(404).json({ message: "Produto não encontrado." });
		}

		res.status(200).json({ message: "Produto encontrado com sucesso.", product: product });
	} catch (error) {
		res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

// POST /api/products
router.post("/", authenticateToken, attachDB, async (req, res) => {
	try {
		const {
			productId,
			sizesAvailable,
			bathedTypes,
			imagesUrl,
			stars,
			price,
			category,
			description,
			composition,
			care,
		} = req.body;

		if (!productId || !sizesAvailable || !imagesUrl || !price || !category) {
			return res.status(400).json({ message: "Campos obrigatórios ausentes." });
		}
		if (!Array.isArray(sizesAvailable) || sizesAvailable.length !== 2) {
			return res.status(400).json({ message: "sizesAvailable deve ser um array com dois números." });
		}
		if (!Array.isArray(imagesUrl) || imagesUrl.length === 0 || imagesUrl.length > 3) {
			return res.status(400).json({ message: "imagesUrl deve ser um array com 1 a 3 URLs." });
		}
		if (typeof stars !== "number" || stars < 0 || stars > 5) {
			return res.status(400).json({ message: "A avaliação (stars) deve ser um número entre 0 e 5." });
		}
		if (typeof price !== "number" || price <= 0) {
			return res.status(400).json({ message: "O preço deve ser um número maior que zero." });
		}
		if (typeof category !== "string" || category.trim() === "") {
			return res.status(400).json({ message: "A categoria é obrigatória e deve ser uma string não vazia." });
		}
		if (typeof description !== "string" || description.trim() === "") {
			return res.status(400).json({ message: "A descrição é obrigatória e deve ser uma string não vazia." });
		}
		if (typeof composition !== "string" || composition.trim() === "") {
			return res.status(400).json({ message: "A composição é obrigatória e deve ser uma string não vazia." });
		}
		if (typeof care !== "string" || care.trim() === "") {
			return res.status(400).json({ message: "O cuidado é obrigatório e deve ser uma string não vazia." });
		}

		const productsCollection = req.db.collection("products");

		const existingProduct = await productsCollection.findOne({ productId: productId });
		if (existingProduct) {
			return res.status(409).json({ message: "Um produto com este ID já existe." });
		}

		const newProduct = {
			productId,
			sizesAvailable,
			bathedTypes: bathedTypes ? bathedTypes : null,
			imagesUrl,
			stars,
			price,
			category,
			description,
			composition,
			care,
			dateAdded: new Date(),
		};

		await productsCollection.insertOne(newProduct);

		res.status(201).json({ message: "Produto adicionado com sucesso.", product: newProduct });
	} catch (error) {
		res.status(500).json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
	}
});

module.exports = router;
