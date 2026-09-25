// Exibe totais calculados e o acesso ao fluxo de checkout.
import { Link } from "react-router-dom";

// Resume os valores do carrinho e direciona o usuario para o checkout.
function formatarPreco(valor) {
	return valor.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export default function CartSummary({ produtos, subtotal }) {
	const quantidadeTotal = produtos.reduce(
		(total, produto) => total + produto.quantidade,
		0,
	);

	return (
		<aside className="cart-summary" style={styles.summary}>
			<h2 style={styles.sectionTitle}>Resumo do Pedido</h2>
			<div style={styles.summaryRows}>
				<div style={styles.summaryRow}>
					<span>Subtotal ({quantidadeTotal} itens)</span>
					<span style={styles.summaryValue}>{formatarPreco(subtotal)}</span>
				</div>

				<label style={styles.shipping}>
					<span style={styles.label}>Calcular Frete</span>
					<div style={styles.shippingControls}>
						<input
							style={styles.input}
							type="text"
							placeholder="00000-000"
							autoComplete="postal-code"
						/>
						<button style={styles.secondaryButton} type="button">
							Calcular
						</button>
					</div>
				</label>

				<div style={styles.summaryRow}>
					<span>Frete</span>
					<span style={styles.mutedValue}>A calcular</span>
				</div>
			</div>

			<div style={styles.totalRow}>
				<span>Total</span>
				<strong>{formatarPreco(subtotal)}</strong>
			</div>

			<Link
				style={{
					...styles.primaryButton,
					...(produtos.length === 0 ? styles.disabledLink : null),
				}}
				to={produtos.length === 0 ? "#" : "/checkout"}
			>
				Checkout
			</Link>
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
	summaryRows: { display: "grid", gap: "18px", color: "#64748b" },
	summaryRow: { display: "flex", justifyContent: "space-between", gap: "16px" },
	summaryValue: { color: "#0f172a", fontWeight: 700 },
	mutedValue: { color: "#94a3b8" },
	shipping: { display: "grid", gap: "8px" },
	label: { color: "#334155", fontSize: "14px", fontWeight: 700 },
	shippingControls: { display: "flex", gap: "8px" },
	input: {
		minWidth: 0,
		flex: 1,
		minHeight: "42px",
		border: "1px solid #cbd5e1",
		borderRadius: "6px",
		padding: "8px 10px",
		color: "#0f172a",
		background: "#f8fafc",
		font: "inherit",
		outlineColor: "#2563eb",
	},
	secondaryButton: {
		border: "1px solid #2563eb",
		borderRadius: "6px",
		padding: "0 14px",
		background: "#ffffff",
		color: "#2563eb",
		fontWeight: 700,
		cursor: "pointer",
	},
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
		borderRadius: "8px",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		background: "#2563eb",
		color: "#ffffff",
		fontWeight: 800,
		textDecoration: "none",
	},
	disabledLink: { opacity: 0.5, pointerEvents: "none" },
};
