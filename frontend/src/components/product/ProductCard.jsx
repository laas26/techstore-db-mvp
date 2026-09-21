// Apresenta um produto e permite adiciona-lo ao carrinho.
const formatarPreco = (valor) =>
  valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default function ProductCard({ produto, quantidade = 0, onAdicionar }) {
  return (
    <article
      className="card"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          minHeight: '180px',
          background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7280',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        <img
          src={produto.imagem}
          alt={produto.nome}
          style={{
            width: '100%',
            height: '180px',
            objectFit: 'cover',
          }}
        />
      </div>
      <div
        style={{
          padding: '20px',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
        }}
      >
        <h2
          style={{
            margin: '0 0 8px',
            color: '#111827',
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          {produto.nome}
        </h2>
        <p
          style={{
            color: '#6B7280',
            fontSize: '14px',
            lineHeight: 1.5,
            marginBottom: '18px',
          }}
        >
          {produto.descricao}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginTop: 'auto',
          }}
        >
          <strong style={{ color: '#111827', fontSize: '20px' }}>
            {formatarPreco(produto.preco)}
          </strong>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              aria-live="polite"
              style={{
                minWidth: '22px',
                color: '#4B5563',
                fontSize: '14px',
                fontWeight: 700,
                textAlign: 'right',
              }}
            >
              {quantidade}
            </span>
            <button
              type="button"
              aria-label={`Adicionar ${produto.nome}`}
              onClick={() => onAdicionar(produto)}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
