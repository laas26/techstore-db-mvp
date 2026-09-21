// Centraliza o carrinho persistido pela API e suas operações assíncronas.
import { createContext, useContext, useEffect, useState } from "react";
import {
	buscarCarrinho,
	removerItemCarrinho,
	salvarItemCarrinho,
} from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

function normalizarCarrinho(carrinho) {
	const itens = Array.isArray(carrinho?.itens) ? carrinho.itens : [];

	return {
		...carrinho,
		itens: itens.map((item) => ({
			...item,
			id: String(item.produtoId ?? item.id),
			descricao: item.descricao || "",
		})),
		quantidadeTotal: carrinho?.quantidadeTotal ?? 0,
		total: carrinho?.total ?? 0,
	};
}

export function CartProvider({ children }) {
	const { usuarioLogado, carregando: carregandoAuth } = useAuth();
	const [carrinho, setCarrinho] = useState(normalizarCarrinho());
	const [carregando, setCarregando] = useState(false);
	const [erro, setErro] = useState("");

	useEffect(() => {
		let ativo = true;

		if (carregandoAuth || !usuarioLogado) {
			setCarrinho(normalizarCarrinho());
			setErro("");
			setCarregando(false);
			return undefined;
		}

		setCarregando(true);
		buscarCarrinho()
			.then((dados) => {
				if (ativo) setCarrinho(normalizarCarrinho(dados));
			})
			.catch((error) => {
				if (ativo) setErro(error.erro || error.message);
			})
			.finally(() => {
				if (ativo) setCarregando(false);
			});

		return () => {
			ativo = false;
		};
	}, [carregandoAuth, usuarioLogado]);

	async function atualizarItem(produto, quantidade) {
		setErro("");
		try {
			const dados = await salvarItemCarrinho(produto.id, quantidade);
			const proximoCarrinho = normalizarCarrinho(dados);
			setCarrinho(proximoCarrinho);
			return proximoCarrinho;
		} catch (error) {
			setErro(error.erro || error.message);
			throw error;
		}
	}

	async function adicionarProduto(produto) {
		const itemAtual = carrinho.itens.find(
			(item) => String(item.id) === String(produto.id),
		);
		return atualizarItem(produto, (itemAtual?.quantidade || 0) + 1);
	}

	async function alterarQuantidade(produtoId, delta) {
		const itemAtual = carrinho.itens.find(
			(item) => String(item.id) === String(produtoId),
		);
		if (!itemAtual) return carrinho;

		const proximaQuantidade = itemAtual.quantidade + delta;
		if (proximaQuantidade <= 0) return removerProduto(produtoId);
		return atualizarItem(itemAtual, proximaQuantidade);
	}

	async function removerProduto(produtoId) {
		setErro("");
		try {
			const dados = await removerItemCarrinho(produtoId);
			const proximoCarrinho = normalizarCarrinho(dados);
			setCarrinho(proximoCarrinho);
			return proximoCarrinho;
		} catch (error) {
			setErro(error.erro || error.message);
			throw error;
		}
	}

	async function limparCarrinho() {
		for (const item of carrinho.itens) {
			await removerProduto(item.id);
		}
		setCarrinho(normalizarCarrinho());
	}

	const valor = {
		carrinho,
		itens: carrinho.itens,
		quantidadeTotal: carrinho.quantidadeTotal,
		total: carrinho.total,
		carregando,
		erro,
		adicionarProduto,
		alterarQuantidade,
		removerProduto,
		limparCarrinho,
	};

	return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCartContext() {
	const contexto = useContext(CartContext);
	if (!contexto) {
		throw new Error("useCartContext deve ser usado dentro de CartProvider");
	}
	return contexto;
}
