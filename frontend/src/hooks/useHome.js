// Fornece filtros, catálogo e ações de compra para a página inicial.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarProdutos } from '../services/productService';
import { useCart } from './useCart';

const PRECO_MAXIMO_PADRAO = 15000;

export function useHome() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [precoMaximo, setPrecoMaximo] = useState(PRECO_MAXIMO_PADRAO);
  const [produtos, setProdutos] = useState([]);
  const [erroCarrinho, setErroCarrinho] = useState('');
  const navigate = useNavigate();
  const { usuarioLogado } = useAuth();
  const { itens, adicionarProduto } = useCart();

  useEffect(() => {
    async function carregarProdutos() {
      const produtosDaApi = await listarProdutos();
      setProdutos(produtosDaApi);
    }

    carregarProdutos();
  }, []);

  const produtosFiltrados = useMemo(
    () =>
      produtos.filter(
        (produto) =>
          (categoriaAtiva === 'todos' ||
            produto.categoria === categoriaAtiva) &&
          produto.preco <= precoMaximo,
      ),
    [categoriaAtiva, precoMaximo, produtos],
  );

  async function adicionarQuantidade(produto) {
    setErroCarrinho('');

    if (!usuarioLogado) {
      setErroCarrinho('Faça login para adicionar produtos ao carrinho.');
      navigate('/login');
      return;
    }

    try {
      await adicionarProduto(produto);
    } catch (error) {
      setErroCarrinho(
        error.erro ||
          error.message ||
          'Não foi possível adicionar o produto ao carrinho.',
      );
    }
  }

  return {
    categoriaAtiva,
    erroCarrinho,
    precoMaximo,
    precoMaximoPadrao: PRECO_MAXIMO_PADRAO,
    produtosFiltrados,
    quantidades: Object.fromEntries(
      itens.map((item) => [item.id, item.quantidade]),
    ),
    setCategoriaAtiva,
    setPrecoMaximo,
    adicionarQuantidade,
  };
}
