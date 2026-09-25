const crypto = require('node:crypto');
const { Prisma } = require('@prisma/client');
const { prisma } = require('../database/connection');
const { bloquearUsuario } = require('../database/transaction');
const cartRepository = require('../repositories/cartRepository');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');

const METODOS_PAGAMENTO = new Set(['pix-simulado']);

class PedidoInvalidoError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'PedidoInvalidoError';
  }
}

class PedidoConflitoError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'PedidoConflitoError';
  }
}

function validarEntrega(entrega) {
  if (!entrega || typeof entrega !== 'object' || Array.isArray(entrega)) {
    throw new PedidoInvalidoError('Os dados de entrega são obrigatórios');
  }

  const camposObrigatorios = [
    'nome',
    'endereco',
    'numero',
    'bairro',
    'cidade',
    'cep',
  ];
  for (const campo of camposObrigatorios) {
    if (typeof entrega[campo] !== 'string' || !entrega[campo].trim()) {
      throw new PedidoInvalidoError(
        `O campo de entrega ${campo} é obrigatório`,
      );
    }
  }

  const cep = entrega.cep.replace(/\D/g, '');
  if (!/^\d{8}$/.test(cep)) {
    throw new PedidoInvalidoError('O CEP deve conter 8 dígitos');
  }

  const entregaNormalizada = Object.fromEntries(
    camposObrigatorios.map((campo) => [campo, entrega[campo].trim()]),
  );
  entregaNormalizada.cep = cep;
  return entregaNormalizada;
}

function validarPagamento(pagamento) {
  const metodo = pagamento || 'pix-simulado';
  if (typeof metodo !== 'string' || !METODOS_PAGAMENTO.has(metodo)) {
    throw new PedidoInvalidoError('Método de pagamento inválido');
  }
  return metodo;
}

function validarItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new PedidoInvalidoError('O carrinho está vazio');
  }

  const ids = new Set();
  for (const item of itens) {
    const produtoId = Number(item?.produtoId);
    if (
      !item ||
      !Number.isInteger(produtoId) ||
      produtoId <= 0 ||
      ids.has(String(produtoId)) ||
      !Number.isInteger(item.quantidade) ||
      item.quantidade <= 0
    ) {
      throw new PedidoInvalidoError(
        'Itens ou quantidades do carrinho inválidos',
      );
    }
    ids.add(String(produtoId));
  }
}

function resolverIdempotencyKey(value) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) {
    throw new PedidoInvalidoError(
      'Informe o cabeçalho Idempotency-Key para finalizar o pedido',
    );
  }
  if (normalized.length > 128) {
    throw new PedidoInvalidoError('Chave de idempotência inválida');
  }
  return normalized;
}

function calcularHashPedido(entrega, pagamento) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({ entrega, pagamento }))
    .digest('hex');
}

function obterPedidoReplay(registro, idempotencyHash) {
  if (
    registro.idempotencyHash &&
    registro.idempotencyHash !== idempotencyHash
  ) {
    throw new PedidoConflitoError(
      'A chave de idempotência já foi usada com outro pedido',
    );
  }
  return orderRepository.formatarPedido(registro);
}

async function finalizarPedido(usuarioId, dadosCheckout = {}, chaveInformada) {
  const checkout =
    dadosCheckout && typeof dadosCheckout === 'object' ? dadosCheckout : {};
  const entrega = validarEntrega(checkout.entrega);
  const pagamento = validarPagamento(checkout.pagamento);
  const idempotencyKey = resolverIdempotencyKey(
    chaveInformada || checkout.idempotencyKey,
  );
  const idempotencyHash = calcularHashPedido(entrega, pagamento);

  try {
    return await prisma.$transaction(async (tx) => {
      if (!(await bloquearUsuario(usuarioId, tx))) {
        throw new PedidoInvalidoError('Usuário não encontrado');
      }

      const pedidoExistente =
        await orderRepository.buscarRegistroPorIdempotencyKey(
          usuarioId,
          idempotencyKey,
          tx,
        );
      if (pedidoExistente) {
        return obterPedidoReplay(pedidoExistente, idempotencyHash);
      }

      const carrinho = await cartRepository.buscarPorUsuarioId(usuarioId, tx);
      validarItens(carrinho.itens);

      let itens;
      try {
        itens = await productRepository.baixarEstoque(carrinho.itens, tx);
      } catch (error) {
        if (error.name === 'EstoqueInsuficienteError') {
          throw new PedidoInvalidoError(
            'Um ou mais produtos não estão disponíveis em estoque',
          );
        }
        throw error;
      }
      if (!itens) {
        throw new PedidoInvalidoError(
          'Um ou mais produtos não estão disponíveis em estoque',
        );
      }

      const total = itens.reduce(
        (soma, item) => soma.add(item.subtotal),
        new Prisma.Decimal(0),
      );
      const pedido = await orderRepository.criarPedido(
        {
          usuarioId: String(usuarioId),
          itens,
          total,
          status: 'pendente',
          idempotencyKey,
          idempotencyHash,
          entrega,
          pagamento,
        },
        tx,
      );

      await cartRepository.salvarPorUsuarioId(usuarioId, [], tx);
      return pedido;
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const pedidoExistente =
        await orderRepository.buscarRegistroPorIdempotencyKey(
          usuarioId,
          idempotencyKey,
        );
      if (pedidoExistente) {
        return obterPedidoReplay(pedidoExistente, idempotencyHash);
      }
    }
    throw error;
  }
}

async function simularPagamento(usuarioId, pedidoId) {
  if (process.env.NODE_ENV === 'production') {
    throw new PedidoInvalidoError(
      'A simulação de pagamento está desabilitada em produção',
    );
  }

  const pedido = await orderRepository.atualizarStatus(
    pedidoId,
    usuarioId,
    'pago',
  );
  if (!pedido) throw new PedidoInvalidoError('Pedido não encontrado');
  return pedido;
}

module.exports = {
  finalizarPedido,
  PedidoConflitoError,
  PedidoInvalidoError,
  simularPagamento,
};
