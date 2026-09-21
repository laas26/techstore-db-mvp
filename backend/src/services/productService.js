// Valida dados de produto e coordena as operações do catálogo.
const productRepository = require("../repositories/productRepository");

class DadosProdutoInvalidosError extends Error {
	constructor(mensagem) {
		super(mensagem);
		this.name = "DadosProdutoInvalidosError";
	}
}

function validarProduto(dadosProduto, parcial = false) {
	if (
		!dadosProduto ||
		typeof dadosProduto !== "object" ||
		Array.isArray(dadosProduto)
	) {
		throw new DadosProdutoInvalidosError("Dados do produto inválidos");
	}

	const camposObrigatorios = [
		"nome",
		"preco",
		"categoria",
		"descricao",
		"stock",
	];
	if (!parcial) {
		const campoAusente = camposObrigatorios.find(
			(campo) => dadosProduto[campo] === undefined,
		);
		if (campoAusente) {
			throw new DadosProdutoInvalidosError(
				`O campo ${campoAusente} é obrigatório`,
			);
		}
	}

	if (
		dadosProduto.nome !== undefined &&
		(typeof dadosProduto.nome !== "string" || !dadosProduto.nome.trim())
	) {
		throw new DadosProdutoInvalidosError(
			"O nome do produto deve ser um texto não vazio",
		);
	}
	if (
		dadosProduto.preco !== undefined &&
		(!Number.isFinite(dadosProduto.preco) || dadosProduto.preco < 0)
	) {
		throw new DadosProdutoInvalidosError(
			"O preço deve ser um número não negativo",
		);
	}
	if (
		dadosProduto.stock !== undefined &&
		(!Number.isInteger(dadosProduto.stock) || dadosProduto.stock < 0)
	) {
		throw new DadosProdutoInvalidosError(
			"O estoque deve ser um número inteiro não negativo",
		);
	}
	if (
		dadosProduto.categoria !== undefined &&
		(typeof dadosProduto.categoria !== "string" ||
			!dadosProduto.categoria.trim())
	) {
		throw new DadosProdutoInvalidosError(
			"A categoria deve ser um texto não vazio",
		);
	}
	if (
		dadosProduto.descricao !== undefined &&
		(typeof dadosProduto.descricao !== "string" ||
			!dadosProduto.descricao.trim())
	) {
		throw new DadosProdutoInvalidosError(
			"A descrição deve ser um texto não vazio",
		);
	}
}

function selecionarCamposProduto(dadosProduto) {
	const campos = ["nome", "preco", "imagem", "categoria", "descricao", "stock"];
	return Object.fromEntries(
		campos
			.filter((campo) => dadosProduto[campo] !== undefined)
			.map((campo) => [campo, dadosProduto[campo]]),
	);
}

async function listarProdutos() {
	return productRepository.listarTodos();
}

async function criarProduto(dadosProduto) {
	validarProduto(dadosProduto);
	return productRepository.criarProduto(selecionarCamposProduto(dadosProduto));
}

async function atualizarProduto(id, dadosAtualizados) {
	validarProduto(dadosAtualizados, true);
	return productRepository.atualizarProduto(
		id,
		selecionarCamposProduto(dadosAtualizados),
	);
}

async function removerProduto(id) {
	return productRepository.removerProduto(id);
}

module.exports = {
	listarProdutos,
	criarProduto,
	atualizarProduto,
	removerProduto,
	DadosProdutoInvalidosError,
};
