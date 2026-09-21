// Encapsula listagem e operações administrativas do catálogo de produtos.
import { apiFetch } from "./api";

function normalizarCaminhoImagem(imagem) {
	if (typeof imagem !== "string") return imagem;

	const imagemSemEspacos = imagem.trim();
	if (imagemSemEspacos.startsWith("img/")) {
		return `/${imagemSemEspacos}`;
	}

	return imagemSemEspacos;
}

function normalizarProduto(produto) {
	if (!produto || typeof produto !== "object") return produto;

	return {
		...produto,
		imagem: normalizarCaminhoImagem(produto.imagem),
		image: normalizarCaminhoImagem(produto.image),
	};
}

async function listarProdutos() {
	const produtos = await apiFetch("/produtos");
	return produtos.map(normalizarProduto);
}

function criarPayloadProduto(produto) {
	return {
		nome: produto.name,
		preco: produto.price,
		imagem: normalizarCaminhoImagem(produto.image),
		categoria: produto.category,
		descricao: produto.description,
		stock: produto.stock,
	};
}

async function criarProduto(produto) {
	const resposta = await apiFetch("/produtos", {
		method: "POST",
		body: JSON.stringify(criarPayloadProduto(produto)),
	});
	return normalizarProduto(resposta.produto);
}

async function atualizarProduto(id, produto) {
	const resposta = await apiFetch(`/produtos/${id}`, {
		method: "PATCH",
		body: JSON.stringify(criarPayloadProduto(produto)),
	});
	return normalizarProduto(resposta.produto);
}

async function removerProduto(id) {
	const resposta = await apiFetch(`/produtos/${id}`, {
		method: "DELETE",
	});
	return resposta.produto;
}

export { atualizarProduto, criarProduto, listarProdutos, removerProduto };
