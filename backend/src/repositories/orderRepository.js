const { prisma } = require('../database/connection');
const { bloquearUsuario } = require('../database/transaction');

class TransicaoPedidoInvalidaError extends Error {
  constructor() {
    super('O pedido não pode mais ser alterado para pago');
    this.name = 'TransicaoPedidoInvalidaError';
  }
}

function formatarPedido(pedido) {
  return {
    id: String(pedido.id),
    usuarioId: String(pedido.usuario_id),
    total: Number(pedido.total),
    status: pedido.status,
    idempotencyKey: pedido.idempotencyKey,
    entrega: pedido.entrega,
    pagamento: pedido.pagamento,
    criadoEm:
      pedido.created_at instanceof Date
        ? pedido.created_at.toISOString()
        : pedido.created_at,
    itens: pedido.itens.map((item) => ({
      produtoId: String(item.produto_id),
      nome: item.nomeProduto,
      quantidade: item.quantidade,
      preco: Number(item.preco_unitario),
      subtotal: Number(item.preco_unitario) * item.quantidade,
    })),
  };
}

async function criarPedido(dadosPedido, client = prisma) {
  const {
    usuarioId,
    total,
    status = 'pendente',
    idempotencyKey,
    idempotencyHash,
    entrega = null,
    pagamento = 'pix-simulado',
    itens = [],
  } = dadosPedido;
  const data = {
    usuario_id: Number(usuarioId),
    total,
    status,
    idempotencyKey,
    idempotencyHash,
    entrega,
    pagamento,
    itens: {
      create: itens.map((item) => ({
        produto_id: Number(item.produtoId),
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        nomeProduto: item.nomeProduto || item.nome,
      })),
    },
  };
  const include = { itens: true };

  const pedido = await client.pedido.create({ data, include });

  return formatarPedido(pedido);
}

async function buscarRegistroPorIdempotencyKey(
  usuarioId,
  idempotencyKey,
  client = prisma,
) {
  if (!idempotencyKey) return null;

  return client.pedido.findFirst({
    where: {
      usuario_id: Number(usuarioId),
      idempotencyKey,
    },
    include: { itens: true },
  });
}

async function buscarPorIdempotencyKey(
  usuarioId,
  idempotencyKey,
  client = prisma,
) {
  const pedido = await buscarRegistroPorIdempotencyKey(
    usuarioId,
    idempotencyKey,
    client,
  );
  return pedido ? formatarPedido(pedido) : null;
}

async function atualizarStatus(id, usuarioId, status) {
  return prisma.$transaction(async (tx) => {
    if (!(await bloquearUsuario(usuarioId, tx))) return null;

    const pedido = await tx.pedido.findFirst({
      where: { id: Number(id), usuario_id: Number(usuarioId) },
      include: { itens: true },
    });
    if (!pedido) return null;
    if (pedido.status === status) return formatarPedido(pedido);
    if (status === 'pago' && pedido.status !== 'pendente') {
      throw new TransicaoPedidoInvalidaError();
    }

    const pedidoAtualizado = await tx.pedido.update({
      where: { id: pedido.id },
      data: { status },
      include: { itens: true },
    });

    return formatarPedido(pedidoAtualizado);
  });
}

module.exports = {
  TransicaoPedidoInvalidaError,
  atualizarStatus,
  buscarPorIdempotencyKey,
  buscarRegistroPorIdempotencyKey,
  criarPedido,
  formatarPedido,
};
