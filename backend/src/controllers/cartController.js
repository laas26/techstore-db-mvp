// Expõe os casos de uso do carrinho como handlers HTTP autenticados.
const cartService = require("../services/cartService");

async function listar(req, res, next) {
	try {
		const carrinho = await cartService.listarCarrinho(req.usuarioId);
		return res.status(200).json({ carrinho });
	} catch (error) {
		return next(error);
	}
}

async function adicionarOuAtualizar(req, res, next) {
	try {
		const carrinho = await cartService.adicionarOuAtualizarItem(
			req.usuarioId,
			req.body,
		);
		return res.status(200).json({ carrinho });
	} catch (error) {
		return next(error);
	}
}

async function remover(req, res, next) {
	try {
		const carrinho = await cartService.removerItem(
			req.usuarioId,
			req.params.id,
		);
		return res.status(200).json({ carrinho });
	} catch (error) {
		return next(error);
	}
}

module.exports = { listar, adicionarOuAtualizar, remover };
