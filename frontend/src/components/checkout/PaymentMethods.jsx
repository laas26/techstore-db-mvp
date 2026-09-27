// Apresenta as formas de pagamento disponiveis no checkout.
export default function PaymentMethods() {
  return (
    <div style={styles.payment}>
      <h3 style={styles.paymentTitle}>Método de Pagamento</h3>
      <label style={styles.paymentOption}>
        <input type="radio" name="payment" value="pix" defaultChecked />
        <span style={styles.qrIcon}>▦</span>
        <span>Pagamento Instantâneo PIX</span>
      </label>
    </div>
  );
}

const styles = {
  payment: { marginTop: '28px' },
  paymentTitle: {
    margin: '0 0 12px',
    color: '#64748b',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    border: '1px solid rgba(37, 99, 235, 0.45)',
    borderRadius: '8px',
    background: '#eff6ff',
    fontWeight: 650,
  },
  qrIcon: { color: '#2563eb', fontSize: '24px' },
};
