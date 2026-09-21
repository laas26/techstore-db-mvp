// Recebe pedidos HTTP e delega a validação e finalização ao serviço de pedidos.
const orderService = require("../services/orderService");

async function criarPedido(req, res, next) {
	try {
		const pedido = await orderService.finalizarPedido(req.usuarioId, req.body);

		return res.status(201).json({
			mensagem: "Pedido salvo com sucesso",
			pedido,
		});
	} catch (error) {
		return next(error);
	}
}

async function simularPagamento(req, res, next) {
	try {
		const pedido = await orderService.simularPagamento(
			req.usuarioId,
			req.params.id,
		);
		return res.status(200).json({ pedido });
	} catch (error) {
		return next(error);
	}
}

module.exports = { criarPedido, simularPagamento };
