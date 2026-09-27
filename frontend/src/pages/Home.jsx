// Vitrine pública com catálogo, filtros e ações de adicionar ao carrinho.
import HeroSlider from '../components/home/HeroSlider';
import Footer from '../components/layout/Footer';
import ProductFilters from '../components/product/ProductFilters';
import ProductList from '../components/product/ProductList';
import { useHome } from '../hooks/useHome';

export default function Home() {
  const {
    categoriaAtiva,
    precoMaximo,
    precoMaximoPadrao,
    produtosFiltrados,
    quantidades,
    setCategoriaAtiva,
    setPrecoMaximo,
    adicionarQuantidade,
    carregandoCatalogo,
    erroCatalogo,
    recarregarCatalogo,
    erroCarrinho,
  } = useHome();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 86px)',
        display: 'flex',
        flexDirection: 'column',
        background: '#F5F6F8',
        color: '#1F2937',
      }}
    >
      <main
        className="home-main"
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px 72px',
          flex: 1,
        }}
      >
        <HeroSlider />
        <div
          className="home-catalog-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 260px) 1fr',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          <ProductFilters
            categoriaAtiva={categoriaAtiva}
            precoMaximo={precoMaximo}
            precoMaximoPadrao={precoMaximoPadrao}
            onCategoriaChange={setCategoriaAtiva}
            onPrecoMaximoChange={setPrecoMaximo}
          />
          <div style={{ display: 'grid', gap: '16px' }}>
            {erroCarrinho && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  padding: '12px 14px',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  background: '#FEF2F2',
                  color: '#B91C1C',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {erroCarrinho}
              </p>
            )}
            {carregandoCatalogo ? (
              <p role="status" style={styles.catalogStatus}>
                Carregando catálogo...
              </p>
            ) : erroCatalogo ? (
              <div role="alert" style={styles.catalogError}>
                <span>{erroCatalogo}</span>
                <button
                  type="button"
                  onClick={recarregarCatalogo}
                  style={styles.retryButton}
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <ProductList
                produtos={produtosFiltrados}
                quantidades={quantidades}
                onAdicionarProduto={adicionarQuantidade}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  catalogStatus: {
    margin: 0,
    padding: '24px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    background: '#FFFFFF',
    color: '#64748B',
    textAlign: 'center',
  },
  catalogError: {
    display: 'grid',
    gap: '12px',
    justifyItems: 'center',
    padding: '24px',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    background: '#FEF2F2',
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryButton: {
    padding: '8px 14px',
    border: 0,
    borderRadius: '6px',
    background: '#2563EB',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};
