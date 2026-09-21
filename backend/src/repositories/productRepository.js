// src/repositories/productRepository.js
const { prisma } = require("../database/connection");

async function listarTodos() {
	return await prisma.produto.findMany({
		orderBy: { created_at: "desc" },
	});
}

async function listarPorId(id) {
	return await prisma.produto.findUnique({
		where: { id: Number(id) },
	});
}

async function criarProduto(dadosProduto) {
	const { nome, descricao, preco, stock = 0, imagem, categoria } = dadosProduto;

	const produto = await prisma.produto.create({
		data: {
			nome,
			descricao: descricao || null,
			preco,
			stock,
			imagem: imagem || null,
			categoria: categoria || null
		},
	});

	return {
		...produto,
		id: String(produto.id), // Mantém id como String para compatibilidade com o restante do app
	};
}

async function atualizarProduto(id, dadosAtualizados) {
	try {
		const produto = await prisma.produto.update({
			where: { id: Number(id) },
			data: dadosAtualizados,
		});

		return {
			...produto,
			id: String(produto.id),
		};
	} catch (error) {
		if (error.code === "P2025") return null;
		throw error;
	}
}

async function removerProduto(id) {
	try {
		const produto = await prisma.produto.delete({
			where: { id: Number(id) },
		});

		return {
			...produto,
			id: String(produto.id),
		};
	} catch (error) {
		if (error.code === "P2025") return null;
		throw error;
	}
}

async function baixarEstoque(itens) {
	// O Prisma gerencia o Rollback automaticamente se qualquer erro for lançado dentro do $transaction
	return await prisma.$transaction(async (tx) => {
		const snapshots = [];
		const quantidadesPorProduto = new Map();

		for (const item of itens) {
			if (!item || item.produtoId === undefined || !Number.isInteger(item.quantidade) || item.quantidade <= 0) {
				return null;
			}

			const produtoId = Number(item.produtoId);
			const quantidadeAcumulada = (quantidadesPorProduto.get(produtoId) || 0) + item.quantidade;
			quantidadesPorProduto.set(produtoId, quantidadeAcumulada);

			// Simulamos o "FOR UPDATE" usando uma query comum dentro da transação isolada
			const produto = await tx.produto.findUnique({
				where: { id: produtoId },
			});

			if (!produto || !Number.isInteger(produto.stock)) return null;
			if (quantidadeAcumulada > produto.stock) return null;

			snapshots.push({
				produtoId: String(produto.id),
				nome: produto.nome,
				preco: Number(produto.preco),
				imagem: produto.imagem,
				quantidade: item.quantidade,
				subtotal: Number(produto.preco) * item.quantidade,
			});
		}

		// Executa as atualizações de estoque em lote de forma isolada
		for (const [produtoId, quantidade] of quantidadesPorProduto) {
			await tx.produto.update({
				where: { id: produtoId },
				data: {
					stock: { decrement: quantidade }, // Equivalente a SET stock = stock - quantidade
				},
			});
		}

		return snapshots;
	});
}

async function restaurarEstoque(itens) {
	await prisma.$transaction(async (tx) => {
		for (const item of itens) {
			if (!item || !Number.isInteger(item.quantidade) || item.quantidade <= 0) {
				throw new Error("Não foi possível restaurar o estoque do pedido");
			}

			const produtoId = Number(item.produtoId);
			const produto = await tx.produto.findUnique({
				where: { id: produtoId },
			});

			if (!produto) {
				throw new Error("Não foi possível restaurar o estoque do pedido");
			}

			await tx.produto.update({
				where: { id: produtoId },
				data: {
					stock: { increment: item.quantidade }, // Equivalente a SET stock = stock + quantidade
				},
			});
		}
	});
}

module.exports = {
	listarTodos,
	criarProduto,
	atualizarProduto,
	baixarEstoque,
	restaurarEstoque,
	removerProduto,
};
