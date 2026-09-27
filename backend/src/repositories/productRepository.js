const { Prisma } = require('@prisma/client');
const { prisma } = require('../database/connection');

class EstoqueInsuficienteError extends Error {
  constructor() {
    super('Estoque insuficiente');
    this.name = 'EstoqueInsuficienteError';
  }
}

class ProdutoEmUsoError extends Error {
  constructor() {
    super('Produto possui pedidos vinculados');
    this.name = 'ProdutoEmUsoError';
  }
}

async function listarTodos() {
  return prisma.produto.findMany({ orderBy: { created_at: 'desc' } });
}

async function listarPorId(id, client = prisma) {
  const produtoId = Number(id);
  if (!Number.isInteger(produtoId) || produtoId <= 0) return null;
  return client.produto.findUnique({ where: { id: produtoId } });
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
      categoria: categoria || null,
    },
  });

  return { ...produto, id: String(produto.id) };
}

async function atualizarProduto(id, dadosAtualizados) {
  try {
    const produto = await prisma.produto.update({
      where: { id: Number(id) },
      data: dadosAtualizados,
    });
    return { ...produto, id: String(produto.id) };
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

async function removerProduto(id) {
  try {
    const produto = await prisma.produto.delete({
      where: { id: Number(id) },
    });
    return { ...produto, id: String(produto.id) };
  } catch (error) {
    if (error.code === 'P2025') return null;
    if (error.code === 'P2003') throw new ProdutoEmUsoError();
    throw error;
  }
}

async function baixarEstoque(itens, client = prisma) {
  const operation = async (tx) => {
    const quantidadesPorProduto = new Map();

    for (const item of itens) {
      const produtoId = Number(item?.produtoId);
      if (
        !Number.isInteger(produtoId) ||
        produtoId <= 0 ||
        !Number.isInteger(item?.quantidade) ||
        item.quantidade <= 0
      ) {
        throw new EstoqueInsuficienteError();
      }

      const quantidade = item.quantidade;
      quantidadesPorProduto.set(
        produtoId,
        (quantidadesPorProduto.get(produtoId) || 0) + quantidade,
      );
    }

    const snapshots = [];
    const produtosOrdenados = [...quantidadesPorProduto.entries()].sort(
      ([primeiroId], [segundoId]) => primeiroId - segundoId,
    );
    for (const [produtoId, quantidade] of produtosOrdenados) {
      const produto = await tx.produto.findUnique({ where: { id: produtoId } });
      if (!produto || produto.stock < quantidade) {
        throw new EstoqueInsuficienteError();
      }

      const resultado = await tx.produto.updateMany({
        where: { id: produtoId, stock: { gte: quantidade } },
        data: { stock: { decrement: quantidade } },
      });

      if (resultado.count !== 1) {
        throw new EstoqueInsuficienteError();
      }

      const produtoAtualizado = await tx.produto.findUnique({
        where: { id: produtoId },
      });
      const preco = new Prisma.Decimal(produtoAtualizado.preco);
      snapshots.push({
        produtoId: String(produtoId),
        nome: produtoAtualizado.nome,
        descricao: produtoAtualizado.descricao,
        preco,
        imagem: produtoAtualizado.imagem,
        quantidade,
        subtotal: preco.mul(quantidade),
      });
    }

    return snapshots;
  };

  if (client !== prisma) return operation(client);

  try {
    return await prisma.$transaction(operation);
  } catch (error) {
    if (error instanceof EstoqueInsuficienteError) return null;
    throw error;
  }
}

module.exports = {
  EstoqueInsuficienteError,
  ProdutoEmUsoError,
  atualizarProduto,
  baixarEstoque,
  criarProduto,
  listarPorId,
  listarTodos,
  removerProduto,
};
