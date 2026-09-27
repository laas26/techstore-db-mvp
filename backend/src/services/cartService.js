const { prisma } = require('../database/connection');
const { bloquearUsuario } = require('../database/transaction');
const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');

class CarrinhoInvalidoError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'CarrinhoInvalidoError';
  }
}

async function listarCarrinho(usuarioId) {
  const carrinho = await cartRepository.buscarPorUsuarioId(usuarioId);
  return montarResumo(carrinho);
}

async function adicionarOuAtualizarItem(usuarioId, dadosItem) {
  if (!dadosItem || typeof dadosItem !== 'object' || Array.isArray(dadosItem)) {
    throw new CarrinhoInvalidoError('Dados do item inválidos');
  }

  const produtoId = dadosItem.produtoId ?? dadosItem.id;
  const quantidade = dadosItem.quantidade;

  if (produtoId === undefined || produtoId === null || produtoId === '') {
    throw new CarrinhoInvalidoError('O produtoId é obrigatório');
  }
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new CarrinhoInvalidoError(
      'A quantidade deve ser um número inteiro positivo',
    );
  }

  return prisma.$transaction(async (tx) => {
    if (!(await bloquearUsuario(usuarioId, tx))) {
      throw new CarrinhoInvalidoError('Usuário não encontrado');
    }

    const produto = await productRepository.listarPorId(produtoId, tx);
    if (!produto) {
      throw new CarrinhoInvalidoError('Produto não encontrado');
    }
    if (!Number.isInteger(produto.stock) || quantidade > produto.stock) {
      throw new CarrinhoInvalidoError('Quantidade indisponível em estoque');
    }

    const carrinho = await cartRepository.buscarPorUsuarioId(usuarioId, tx);
    const itens = carrinho.itens.filter(
      (item) => String(item.produtoId) !== String(produtoId),
    );
    itens.push({ produtoId: String(produto.id), quantidade });

    const carrinhoSalvo = await cartRepository.salvarPorUsuarioId(
      usuarioId,
      itens,
      tx,
    );
    return montarResumo(carrinhoSalvo);
  });
}

async function removerItem(usuarioId, produtoId) {
  if (produtoId === undefined || produtoId === '') {
    throw new CarrinhoInvalidoError('O id do produto é obrigatório');
  }

  return prisma.$transaction(async (tx) => {
    if (!(await bloquearUsuario(usuarioId, tx))) {
      throw new CarrinhoInvalidoError('Usuário não encontrado');
    }

    const carrinho = await cartRepository.buscarPorUsuarioId(usuarioId, tx);
    const itens = carrinho.itens.filter(
      (item) => String(item.produtoId) !== String(produtoId),
    );
    const carrinhoSalvo = await cartRepository.salvarPorUsuarioId(
      usuarioId,
      itens,
      tx,
    );
    return montarResumo(carrinhoSalvo);
  });
}

function montarResumo(carrinho) {
  const itens = carrinho.itens.map((item) => ({
    produtoId: String(item.produtoId),
    nome: item.nome,
    descricao: item.descricao,
    preco: item.preco,
    imagem: item.imagem,
    quantidade: item.quantidade,
    subtotal: item.subtotal,
  }));

  return {
    usuarioId: String(carrinho.usuarioId),
    itens,
    quantidadeTotal: itens.reduce((total, item) => total + item.quantidade, 0),
    total: itens.reduce((total, item) => total + item.subtotal, 0),
  };
}

module.exports = {
  listarCarrinho,
  adicionarOuAtualizarItem,
  removerItem,
  CarrinhoInvalidoError,
};
