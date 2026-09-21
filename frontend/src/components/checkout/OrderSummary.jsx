// Resume valores do carrinho e inicia a confirmação do pagamento.
import PaymentMethods from "./PaymentMethods";

// Exibe os totais do pedido e inicia a finalizacao do pagamento.
function formatarPreco(valor) {
	return valor.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export default function OrderSummary({
	quantidadeTotal,
	total,
	temProdutos,
	onFinalizarCompra,
}) {
	return (
		<aside style={styles.summary}>
			<h2 style={styles.sectionTitle}>Resumo do Pedido</h2>

			<div style={styles.summaryRows}>
				<div style={styles.summaryRow}>
					<span>
						Subtotal ({quantidadeTotal}{" "}
						{quantidadeTotal === 1 ? "item" : "itens"})
					</span>
					<span style={styles.summaryValue}>{formatarPreco(total)}</span>
				</div>
				<div style={styles.summaryRow}>
					<span>Frete</span>
					<span style={styles.freeShipping}>Grátis</span>
				</div>
			</div>

			<div style={styles.totalRow}>
				<span>Total</span>
				<strong>{formatarPreco(total)}</strong>
			</div>

			<PaymentMethods />

			<button
				style={{
					...styles.primaryButton,
					...(temProdutos ? null : styles.disabledButton),
				}}
				type="button"
				disabled={!temProdutos}
				onClick={onFinalizarCompra}
			>
				Finalizar Compra
			</button>

			<p style={styles.terms}>
				Ao finalizar, você concorda com nossos Termos de Serviço.
			</p>
		</aside>
	);
}

const styles = {
	summary: {
		position: "sticky",
		top: "112px",
		background: "#ffffff",
		border: "1px solid #e2e8f0",
		borderRadius: "8px",
		padding: "24px",
		boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
	},
	sectionTitle: {
		margin: "0 0 24px",
		paddingBottom: "16px",
		borderBottom: "1px solid #f1f5f9",
		fontSize: "24px",
		lineHeight: "32px",
		fontWeight: 650,
	},
	summaryRows: { display: "grid", gap: "16px", color: "#64748b" },
	summaryRow: { display: "flex", justifyContent: "space-between", gap: "16px" },
	summaryValue: { color: "#0f172a", fontWeight: 600 },
	freeShipping: { color: "#2563eb", fontWeight: 700 },
	totalRow: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		gap: "16px",
		marginTop: "24px",
		paddingTop: "24px",
		borderTop: "1px solid #e2e8f0",
		fontSize: "24px",
	},
	primaryButton: {
		width: "100%",
		minHeight: "52px",
		marginTop: "24px",
		border: 0,
		borderRadius: "8px",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "10px",
		background: "#2563eb",
		color: "#ffffff",
		fontWeight: 800,
		cursor: "pointer",
	},
	disabledButton: { opacity: 0.5, cursor: "not-allowed" },
	terms: {
		marginTop: "14px",
		color: "#64748b",
		textAlign: "center",
		fontSize: "12px",
	},
};
