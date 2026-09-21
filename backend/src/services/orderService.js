// Finaliza pedidos com validação de entrega, estoque, status e compensação de falhas.
const cartRepository = require("../repositories/cartRepository");
const orderRepository = require("../repositories/orderRepository");
const productRepository = require("../repositories/productRepository");

let filaDeFinalizacao = Promise.resolve();

class PedidoInvalidoError extends Error {
	constructor(mensagem) {
		super(mensagem);
		this.name = "PedidoInvalidoError";
	}
}

function validarEntrega(entrega) {
	if (!entrega || typeof entrega !== "object" || Array.isArray(entrega)) {
		throw new PedidoInvalidoError("Os dados de entrega são obrigatórios");
	}

	const camposObrigatorios = [
		"nome",
		"endereco",
		"numero",
		"bairro",
		"cidade",
		"cep",
	];
	for (const campo of camposObrigatorios) {
		if (typeof entrega[campo] !== "string" || !entrega[campo].trim()) {
			throw new PedidoInvalidoError(
				`O campo de entrega ${campo} é obrigatório`,
			);
		}
	}
	if (!/^\d{8}$/.test(entrega.cep.replace(/\D/g, ""))) {
		throw new PedidoInvalidoError("O CEP deve conter 8 dígitos");
	}

	return Object.fromEntries(
		camposObrigatorios.map((campo) => [campo, entrega[campo].trim()]),
	);
}

function validarItens(itens) {
	if (!Array.isArray(itens) || itens.length === 0) {
		throw new PedidoInvalidoError("O carrinho está vazio");
	}
	const ids = new Set();
	for (const item of itens) {
		if (
			!item ||
			item.produtoId === undefined ||
			ids.has(String(item.produtoId)) ||
			!Number.isInteger(item.quantidade) ||
			item.quantidade <= 0
		) {
			throw new PedidoInvalidoError(
				"Itens ou quantidades do carrinho inválidos",
			);
		}
		ids.add(String(item.produtoId));
	}
}

async function finalizarPedido(usuarioId, dadosCheckout = {}) {
	return executarFinalizacao(async () => {
		const entrega = validarEntrega(dadosCheckout.entrega);
		const carrinhoOriginal = await cartRepository.buscarPorUsuarioId(usuarioId);
		validarItens(carrinhoOriginal.itens);
		const itens = await productRepository.baixarEstoque(carrinhoOriginal.itens);
		if (!itens) {
			throw new PedidoInvalidoError(
				"Um ou mais produtos não estão disponíveis em estoque",
			);
		}

		let pedido;
		let carrinhoLimpo = false;
		try {
			const total = itens.reduce((soma, item) => soma + item.subtotal, 0);
			pedido = await orderRepository.criarPedido({
				usuarioId: String(usuarioId),
				itens,
				total,
				status: "pendente",
				pagamento: "pix-simulado",
				entrega,
			});
			await cartRepository.salvarPorUsuarioId(usuarioId, []);
			carrinhoLimpo = true;
			return pedido;
		} catch (error) {
			if (pedido) await orderRepository.removerPedido(pedido.id);
			if (carrinhoLimpo)
				await cartRepository.salvarPorUsuarioId(
					usuarioId,
					carrinhoOriginal.itens,
				);
			await productRepository.restaurarEstoque(itens);
			throw error;
		}
	});
}

async function simularPagamento(usuarioId, pedidoId) {
	if (process.env.NODE_ENV === "production") {
		throw new PedidoInvalidoError(
			"A simulação de pagamento está desabilitada em produção",
		);
	}
	const pedido = await orderRepository.atualizarStatus(
		pedidoId,
		usuarioId,
		"pago",
	);
	if (!pedido) throw new PedidoInvalidoError("Pedido não encontrado");
	return pedido;
}

function executarFinalizacao(operacao) {
	const execucao = filaDeFinalizacao.then(operacao, operacao);
	filaDeFinalizacao = execucao.catch(() => {});
	return execucao;
}

module.exports = { finalizarPedido, PedidoInvalidoError, simularPagamento };
