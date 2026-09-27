// Página autenticada que apresenta o carrinho persistido pela API.
import CartItemList from "../components/cart/CartItemList";
import CartSummary from "../components/cart/CartSummary";
import { useCart } from "../hooks/useCart";

export default function Cart() {
	const { itens, total, alterarQuantidade, removerProduto, erro, carregando } =
		useCart();

	return (
		<div className="cart-page" style={styles.page}>
			<section style={styles.header}>
				<h1 className="cart-title" style={styles.title}>Carrinho de Compras</h1>
				<p style={styles.subtitle}>
					Revise seus itens de alta performance antes de finalizar.
				</p>
			</section>

			<div style={styles.layout}>
				{erro && <p role="alert">{erro}</p>}
				{carregando ? (
					<p>Carregando carrinho...</p>
				) : (
					<>
						<CartItemList
							produtos={itens}
							onAlterarQuantidade={alterarQuantidade}
							onRemoverProduto={removerProduto}
						/>
						<CartSummary produtos={itens} subtotal={total} />
					</>
				)}
			</div>

			<footer className="cart-footer" style={styles.footer}>
				<div style={styles.footerContent}>
					<a href="/about" style={styles.footerLink}>
						Quem Somos
					</a>
					<a href="/privacy" style={styles.footerLink}>
						Política de Privacidade
					</a>
					<a href="/terms" style={styles.footerLink}>
						Termos de Serviço
					</a>
					<a href="/shipping" style={styles.footerLink}>
						Informações de Envio
					</a>
					<a href="/contact" style={styles.footerLink}>
						Contato
					</a>
					<span>
						© 2026 TechStore Premium Electronics. Todos os direitos reservados.
					</span>
				</div>
			</footer>
		</div>
	);
}

const styles = {
	page: {
		width: "100%",
		maxWidth: "1200px",
		margin: "0 auto",
		color: "#0f172a",
	},
	header: { marginBottom: "32px" },
	title: {
		margin: 0,
		fontSize: "32px",
		lineHeight: "40px",
		fontWeight: 700,
	},
	subtitle: {
		marginTop: "8px",
		color: "#64748b",
		fontSize: "16px",
		lineHeight: "24px",
	},
	layout: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
		gap: "24px",
		alignItems: "start",
	},
	footer: {
		minHeight: "121px",
		marginTop: "48px",
		background: "#FFFFFF",
		borderTop: "1px solid #DDE2EA",
		display: "flex",
		alignItems: "center",
		padding: "24px 40px",
	},
	footerContent: {
		width: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexWrap: "wrap",
		gap: "18px 27px",
		color: "#5F6878",
		fontSize: "16px",
	},
	footerLink: { color: "inherit", textDecoration: "none" },
};
