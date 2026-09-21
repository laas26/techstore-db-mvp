// Converte operações HTTP do catálogo em chamadas ao serviço de produtos.
const productService = require("../services/productService");

async function listar(_req, res, next) {
	try {
		const produtos = await productService.listarProdutos();
		return res.json(produtos);
	} catch (error) {
		next(error); // Passa o erro para o middleware de erro do Express
	}
}

async function criar(req, res, next) {
	try {
		const produto = await productService.criarProduto(req.body);
		return res.status(201).json({ produto });
	} catch (error) {
		return next(error);
	}
}

async function atualizar(req, res, next) {
	try {
		const produto = await productService.atualizarProduto(
			req.params.id,
			req.body,
		);

		if (!produto) {
			return res.status(404).json({ erro: "Produto não encontrado" });
		}

		return res.status(200).json({ produto });
	} catch (error) {
		return next(error);
	}
}

async function remover(req, res, next) {
	try {
		const produto = await productService.removerProduto(req.params.id);

		if (!produto) {
			return res.status(404).json({ erro: "Produto não encontrado" });
		}

		return res.status(200).json({ produto });
	} catch (error) {
		return next(error);
	}
}

module.exports = { listar, criar, atualizar, remover };
