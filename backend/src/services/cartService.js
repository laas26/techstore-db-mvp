// Aplica regras do carrinho, valida estoque e recalcula preços pelo catálogo.
const cartRepository = require("../repositories/cartRepository");
const productRepository = require("../repositories/productRepository");

class CarrinhoInvalidoError extends Error {
	constructor(mensagem) {
		super(mensagem);
		this.name = "CarrinhoInvalidoError";
	}
}

async function listarCarrinho(usuarioId) {
	const carrinho = await cartRepository.buscarPorUsuarioId(usuarioId);
	return montarResumo(carrinho);
}

async function adicionarOuAtualizarItem(usuarioId, dadosItem) {
	if (!dadosItem || typeof dadosItem !== "object" || Array.isArray(dadosItem)) {
		throw new CarrinhoInvalidoError("Dados do item inválidos");
	}

	const produtoId = dadosItem.produtoId ?? dadosItem.id;
	const quantidade = dadosItem.quantidade;

	if (produtoId === undefined || produtoId === null || produtoId === "") {
		throw new CarrinhoInvalidoError("O produtoId é obrigatório");
	}
	if (!Number.isInteger(quantidade) || quantidade <= 0) {
		throw new CarrinhoInvalidoError(
			"A quantidade deve ser um número inteiro positivo",
		);
	}

	const produtos = await productRepository.listarTodos();
	const produto = produtos.find(
		(item) => String(item.id) === String(produtoId),
	);

	if (!produto) {
		throw new CarrinhoInvalidoError("Produto não encontrado");
	}
	if (!Number.isInteger(produto.stock) || quantidade > produto.stock) {
		throw new CarrinhoInvalidoError("Quantidade indisponível em estoque");
	}

	const carrinho = await cartRepository.buscarPorUsuarioId(usuarioId);
	const itens = carrinho.itens.filter(
		(item) => String(item.produtoId) !== String(produtoId),
	);
	itens.push({ produtoId: String(produto.id), quantidade });

	const carrinhoSalvo = await cartRepository.salvarPorUsuarioId(
		usuarioId,
		itens,
	);
	return montarResumo(carrinhoSalvo, produtos);
}

async function removerItem(usuarioId, produtoId) {
	if (produtoId === undefined || produtoId === "") {
		throw new CarrinhoInvalidoError("O id do produto é obrigatório");
	}

	const carrinho = await cartRepository.buscarPorUsuarioId(usuarioId);
	const itens = carrinho.itens.filter(
		(item) => String(item.produtoId) !== String(produtoId),
	);
	const carrinhoSalvo = await cartRepository.salvarPorUsuarioId(
		usuarioId,
		itens,
	);
	return montarResumo(carrinhoSalvo);
}

async function montarResumo(carrinho, produtosConhecidos) {
	const produtos =
		produtosConhecidos || (await productRepository.listarTodos());
	const itens = carrinho.itens.map((item) => {
		const produto = produtos.find(
			(produtoCatalogo) =>
				String(produtoCatalogo.id) === String(item.produtoId),
		);

		if (!produto) return null;

		return {
			produtoId: String(produto.id),
			nome: produto.nome,
			descricao: produto.descricao,
			preco: produto.preco,
			imagem: produto.imagem,
			quantidade: item.quantidade,
			subtotal: produto.preco * item.quantidade,
		};
	});
	const itensValidos = itens.filter(Boolean);

	return {
		usuarioId: String(carrinho.usuarioId),
		itens: itensValidos,
		quantidadeTotal: itensValidos.reduce(
			(total, item) => total + item.quantidade,
			0,
		),
		total: itensValidos.reduce((total, item) => total + item.subtotal, 0),
	};
}

module.exports = {
	listarCarrinho,
	adicionarOuAtualizarItem,
	removerItem,
	CarrinhoInvalidoError,
};
