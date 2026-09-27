// Encapsula as operações HTTP do carrinho autenticado.
import { apiFetch } from "./api";

async function buscarCarrinho() {
	const resposta = await apiFetch("/cart");
	return resposta.carrinho;
}

async function salvarItemCarrinho(produtoId, quantidade) {
	const resposta = await apiFetch("/cart/items", {
		method: "POST",
		body: JSON.stringify({ produtoId, quantidade }),
	});
	return resposta.carrinho;
}

async function removerItemCarrinho(produtoId) {
	const resposta = await apiFetch(`/cart/items/${produtoId}`, {
		method: "DELETE",
	});
	return resposta.carrinho;
}

export { buscarCarrinho, removerItemCarrinho, salvarItemCarrinho };
