import { apiFetch } from './api';

let cachedProducts = null;
let pendingProducts = null;
let cacheVersion = 0;

function normalizarCaminhoImagem(imagem) {
  if (typeof imagem !== 'string') return imagem;

  const imagemSemEspacos = imagem.trim();
  if (imagemSemEspacos.startsWith('img/')) {
    return `/${imagemSemEspacos}`;
  }

  return imagemSemEspacos;
}

function normalizarProduto(produto) {
  if (!produto || typeof produto !== 'object') return produto;

  return {
    ...produto,
    imagem: normalizarCaminhoImagem(produto.imagem),
    image: normalizarCaminhoImagem(produto.image),
  };
}

function limparCacheCatalogo() {
  cacheVersion += 1;
  cachedProducts = null;
  pendingProducts = null;
}

async function listarProdutos() {
  if (cachedProducts) return cachedProducts;
  if (pendingProducts) return pendingProducts;

  const version = cacheVersion;
  const request = apiFetch('/produtos')
    .then((produtos) => {
      const normalized = Array.isArray(produtos)
        ? produtos.map(normalizarProduto)
        : [];

      if (version === cacheVersion) {
        cachedProducts = normalized;
      }

      return normalized;
    })
    .finally(() => {
      if (pendingProducts === request) {
        pendingProducts = null;
      }
    });

  pendingProducts = request;
  return request;
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
  const resposta = await apiFetch('/produtos', {
    method: 'POST',
    body: JSON.stringify(criarPayloadProduto(produto)),
  });

  limparCacheCatalogo();
  return normalizarProduto(resposta.produto);
}

async function atualizarProduto(id, produto) {
  const resposta = await apiFetch(`/produtos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(criarPayloadProduto(produto)),
  });

  limparCacheCatalogo();
  return normalizarProduto(resposta.produto);
}

async function removerProduto(id) {
  const resposta = await apiFetch(`/produtos/${id}`, {
    method: 'DELETE',
  });

  limparCacheCatalogo();
  return resposta.produto;
}

export {
  atualizarProduto,
  criarProduto,
  limparCacheCatalogo,
  listarProdutos,
  removerProduto,
};
