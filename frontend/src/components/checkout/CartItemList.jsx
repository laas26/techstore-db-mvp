// Mantem a exibicao dos valores do carrinho padronizada em reais.
function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function CartItemList({
  produtos,
  onAlterarQuantidade,
  onRemover,
}) {
  // Informa ao cliente quando nao ha itens para finalizar a compra.
  if (produtos.length === 0) {
    return (
      <div style={styles.emptyState}>
        Nenhum produto selecionado para finalizar a compra.
      </div>
    );
  }

  return (
    <section style={styles.itemsList}>
      {produtos.map((produto) => (
        <article style={styles.itemCard} key={produto.id}>
          <div style={styles.productImageWrap}>
            <img
              style={styles.productImage}
              src={produto.imagem}
              alt={produto.nome}
            />
          </div>
          <div style={styles.productContent}>
            <div style={styles.productTop}>
              <div style={styles.productText}>
                <h2 style={styles.productTitle}>{produto.nome}</h2>
                <p style={styles.productDescription}>{produto.descricao}</p>
              </div>
              <button
                style={styles.iconButton}
                type="button"
                aria-label={`Remover ${produto.nome}`}
                onClick={() => onRemover(produto.id)}
              >
                ×
              </button>
            </div>

            <div style={styles.productBottom}>
              <div style={styles.quantity}>
                <button
                  style={styles.quantityButton}
                  type="button"
                  aria-label={`Diminuir quantidade de ${produto.nome}`}
                  onClick={() => onAlterarQuantidade(produto.id, -1)}
                >
                  -
                </button>
                <span style={styles.quantityValue}>{produto.quantidade}</span>
                <button
                  style={styles.quantityButton}
                  type="button"
                  aria-label={`Aumentar quantidade de ${produto.nome}`}
                  onClick={() => onAlterarQuantidade(produto.id, 1)}
                >
                  +
                </button>
              </div>
              <strong style={styles.price}>
                {formatarPreco(produto.preco * produto.quantidade)}
              </strong>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

const styles = {
  emptyState: {
    padding: '24px',
    color: '#64748b',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
  },
  itemsList: { display: 'grid', gap: '16px' },
  itemCard: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
  },
  productImageWrap: {
    width: '128px',
    height: '128px',
    flex: '0 0 128px',
    overflow: 'hidden',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  productImage: { width: '100%', height: '100%', objectFit: 'cover' },
  productContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: 0,
  },
  productText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  productTop: { display: 'flex', justifyContent: 'space-between', gap: '16px' },
  productTitle: { margin: 0, fontSize: '22px', lineHeight: '30px' },
  productDescription: { marginTop: '6px', color: '#64748b' },
  iconButton: {
    width: '40px',
    height: '40px',
    border: 0,
    borderRadius: '999px',
    background: '#f8fafc',
    color: '#ef4444',
    fontSize: '26px',
    lineHeight: 1,
    cursor: 'pointer',
  },
  productBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
  },
  quantity: {
    display: 'inline-flex',
    alignItems: 'center',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    borderRadius: '999px',
    background: '#f8fafc',
  },
  quantityButton: {
    width: '38px',
    height: '32px',
    border: 0,
    background: 'transparent',
    color: '#2563eb',
    fontSize: '18px',
    cursor: 'pointer',
  },
  quantityValue: { width: '32px', textAlign: 'center', fontWeight: 700 },
  price: { fontSize: '22px' },
};
