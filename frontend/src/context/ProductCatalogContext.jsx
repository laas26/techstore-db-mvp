import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { listarProdutos } from '../services/productService';

const ProductCatalogContext = createContext(null);
const MAX_RETRIES = 4;

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export function ProductCatalogProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let active = true;
    const requestVersion = tentativa;

    async function carregar(attempt = 0) {
      if (!active || requestVersion !== tentativa) return;

      setCarregando(true);
      setErro('');

      try {
        const catalogo = await listarProdutos();
        if (!active) return;

        setProdutos(catalogo);
        setCarregando(false);
      } catch (error) {
        if (!active) return;

        if (attempt < MAX_RETRIES) {
          await wait(500 * 2 ** attempt);
          if (active) await carregar(attempt + 1);
          return;
        }

        setErro(
          error?.erro ||
            error?.message ||
            'Não foi possível carregar o catálogo.',
        );
        setCarregando(false);
      }
    }

    carregar();

    return () => {
      active = false;
    };
  }, [tentativa]);

  const recarregar = useCallback(() => {
    setTentativa((valorAtual) => valorAtual + 1);
  }, []);

  const value = useMemo(
    () => ({ produtos, carregando, erro, recarregar }),
    [produtos, carregando, erro, recarregar],
  );

  return (
    <ProductCatalogContext.Provider value={value}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  const context = useContext(ProductCatalogContext);

  if (!context) {
    throw new Error(
      'useProductCatalog deve ser usado dentro de ProductCatalogProvider',
    );
  }

  return context;
}
