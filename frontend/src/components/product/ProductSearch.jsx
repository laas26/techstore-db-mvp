// Busca produtos na API e oferece navegação rápida para seus detalhes.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductCatalog } from '../../context/ProductCatalogContext';

// Pesquisa produtos pelo inicio do nome e mostra os resultados no campo.
export default function ProductSearch() {
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const { produtos, carregando, erro, recarregar } = useProductCatalog();

  const termoNormalizado = termoPesquisa.trim().toLocaleLowerCase('pt-BR');
  const produtosEncontrados = termoNormalizado
    ? produtos.filter((produto) =>
        produto.nome.toLocaleLowerCase('pt-BR').startsWith(termoNormalizado),
      )
    : [];

  return (
    <div style={styles.wrapper}>
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        focusable="false"
        style={styles.icon}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="search"
        placeholder="Pesquisar produtos..."
        aria-label="Pesquisar produtos"
        value={termoPesquisa}
        onChange={(event) => setTermoPesquisa(event.target.value)}
        style={styles.input}
      />
      {termoNormalizado && (
        <div style={styles.searchResults}>
          {carregando ? (
            <span style={styles.noSearchResults}>Carregando catálogo...</span>
          ) : erro ? (
            <span role="alert" style={styles.noSearchResults}>
              {erro}
              <button
                type="button"
                onClick={recarregar}
                style={styles.retryButton}
              >
                Tentar novamente
              </button>
            </span>
          ) : produtosEncontrados.length > 0 ? (
            produtosEncontrados.map((produto) => (
              <Link
                key={produto.id}
                to="/"
                onClick={() => setTermoPesquisa('')}
                style={styles.searchResult}
              >
                <img
                  src={produto.imagem}
                  alt=""
                  style={styles.searchResultImage}
                />
                <span style={styles.searchResultContent}>
                  <strong>{produto.nome}</strong>
                  <span style={styles.searchResultDescription}>
                    {produto.descricao}
                  </span>
                  <span style={styles.searchResultPrice}>
                    {produto.preco.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </span>
              </Link>
            ))
          ) : (
            <span style={styles.noSearchResults}>
              Nenhum produto encontrado.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '610px',
    marginLeft: '86px',
  },
  icon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94A3B8',
  },
  input: {
    width: '100%',
    height: '38px',
    background: '#F9FAFB',
    border: '1px solid #CBD2DC',
    borderRadius: '7px',
    padding: '0 16px 0 41px',
    color: '#334155',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  searchResults: {
    position: 'absolute',
    top: '46px',
    left: 0,
    right: 0,
    zIndex: 30,
    display: 'grid',
    gap: '4px',
    maxHeight: '320px',
    overflowY: 'auto',
    padding: '8px',
    background: '#FFFFFF',
    border: '1px solid #DDE2EA',
    borderRadius: '8px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14)',
  },
  searchResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    color: '#111827',
    textDecoration: 'none',
    borderRadius: '6px',
  },
  searchResultImage: {
    width: '48px',
    height: '48px',
    flex: '0 0 48px',
    objectFit: 'cover',
    borderRadius: '6px',
    background: '#F3F4F6',
  },
  searchResultContent: {
    minWidth: 0,
    display: 'grid',
    gap: '2px',
  },
  searchResultDescription: {
    overflow: 'hidden',
    color: '#64748B',
    fontSize: '12px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  searchResultPrice: {
    color: '#2563EB',
    fontSize: '13px',
    fontWeight: 700,
  },
  noSearchResults: {
    display: 'grid',
    gap: '8px',
    padding: '12px 8px',
    color: '#64748B',
    fontSize: '14px',
  },
  retryButton: {
    justifySelf: 'center',
    padding: '6px 10px',
    border: 0,
    borderRadius: '6px',
    background: '#2563EB',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};
