// Coleta os dados necessarios para a entrega do pedido.
export default function AddressForm({ dados, mensagem, onChange, onSave }) {
  return (
    <section className="checkout-address-card" style={styles.card}>
      <h2 style={styles.sectionTitle}>Dados de Entrega</h2>
      <form className="checkout-address-form" style={styles.form} onSubmit={onSave}>
        <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
          <span style={styles.label}>Nome Completo</span>
          <input
            style={styles.input}
            type="text"
            value={dados.nome}
            onChange={(event) => onChange('nome', event.target.value)}
            placeholder="Nome completo"
            autoComplete="name"
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Endereço</span>
          <input
            style={styles.input}
            type="text"
            value={dados.endereco}
            onChange={(event) => onChange('endereco', event.target.value)}
            placeholder="Endereço"
            autoComplete="street-address"
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Número</span>
          <input
            style={styles.input}
            type="text"
            value={dados.numero}
            onChange={(event) => onChange('numero', event.target.value)}
            placeholder="Número"
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Bairro</span>
          <input
            style={styles.input}
            type="text"
            value={dados.bairro}
            onChange={(event) => onChange('bairro', event.target.value)}
            placeholder="Bairro"
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Cidade</span>
          <input
            style={styles.input}
            type="text"
            value={dados.cidade}
            onChange={(event) => onChange('cidade', event.target.value)}
            placeholder="Cidade"
            autoComplete="address-level2"
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>CEP</span>
          <div className="checkout-inline-field" style={styles.inlineField}>
            <input
              style={styles.input}
              type="text"
              value={dados.cep}
              onChange={(event) => onChange('cep', event.target.value)}
              placeholder="00000-000"
              autoComplete="postal-code"
            />
            <button style={styles.secondaryButton} type="submit">
              Salvar
            </button>
          </div>
        </label>

        {mensagem && (
          <p
            role={mensagem.startsWith('✓') ? 'status' : 'alert'}
            style={
              mensagem.startsWith('✓')
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {mensagem}
          </p>
        )}
      </form>
    </section>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
  },
  sectionTitle: {
    margin: '0 0 24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 650,
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  field: { display: 'grid', gap: '8px' },
  label: { color: '#334155', fontSize: '14px', fontWeight: 600 },
  input: {
    width: '100%',
    minHeight: '46px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#0f172a',
    background: '#f8fafc',
    font: 'inherit',
    outlineColor: '#2563eb',
  },
  inlineField: { display: 'flex', gap: '8px' },
  secondaryButton: {
    border: 0,
    borderRadius: '6px',
    padding: '0 18px',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  successMessage: {
    gridColumn: '1 / -1',
    margin: 0,
    color: '#15803d',
    fontWeight: 700,
  },
  errorMessage: {
    gridColumn: '1 / -1',
    margin: 0,
    color: '#dc2626',
    fontWeight: 600,
  },
};
