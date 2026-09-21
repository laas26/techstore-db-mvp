// Renderiza itens do carrinho e encaminha alterações ao contexto global.
import { Link } from "react-router-dom";

// Renderiza os produtos do carrinho e encaminha as acoes de quantidade e remocao.
function formatarPreco(valor) {
	return valor.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export default function CartItemList({
	produtos,
	onAlterarQuantidade,
	onRemoverProduto,
}) {
	return (
		<section style={styles.products}>
			<div style={styles.tableHeader}>
				<span>Produto</span>
				<span>Quantidade</span>
				<span>Subtotal</span>
				<span aria-hidden="true" />
			</div>

			{produtos.length > 0 ? (
				produtos.map((produto) => (
					<article style={styles.itemCard} key={produto.id}>
						<div style={styles.productInfo}>
							<div style={styles.imageWrap}>
								<img
									style={styles.productImage}
									src={produto.imagem}
									alt={produto.nome}
								/>
							</div>
							<div style={styles.productText}>
								<h2 style={styles.productTitle}>{produto.nome}</h2>
								<p style={styles.productDescription}>{produto.descricao}</p>
								<p style={styles.mobilePrice}>{formatarPreco(produto.preco)}</p>
							</div>
						</div>

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

						<strong style={styles.itemSubtotal}>
							{formatarPreco(produto.preco * produto.quantidade)}
						</strong>

						<button
							style={styles.removeButton}
							type="button"
							aria-label={`Remover ${produto.nome}`}
							onClick={() => onRemoverProduto(produto.id)}
						>
							×
						</button>
					</article>
				))
			) : (
				<div style={styles.emptyState}>
					Seu carrinho está vazio. Continue comprando para adicionar novos
					produtos.
				</div>
			)}

			<Link style={styles.continueLink} to="/">
				← Continuar Comprando
			</Link>
		</section>
	);
}

const styles = {
	products: { display: "grid", gap: "16px" },
	tableHeader: {
		display: "grid",
		gridTemplateColumns: "minmax(200px, 1fr) 110px 110px 44px",
		gap: "12px",
		padding: "14px 18px",
		color: "#64748b",
		background: "#ffffff",
		border: "1px solid #e2e8f0",
		borderRadius: "8px",
		fontSize: "14px",
		fontWeight: 700,
	},
	itemCard: {
		display: "grid",
		gridTemplateColumns: "minmax(200px, 1fr) 110px 110px 44px",
		gap: "12px",
		alignItems: "center",
		padding: "18px",
		background: "#ffffff",
		border: "1px solid #e2e8f0",
		borderRadius: "8px",
		boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
	},
	productInfo: {
		display: "flex",
		alignItems: "center",
		gap: "16px",
		minWidth: 0,
	},
	productText: { display: "flex", flexDirection: "column", minWidth: 0 },
	imageWrap: {
		width: "96px",
		height: "96px",
		flex: "0 0 96px",
		overflow: "hidden",
		borderRadius: "8px",
		border: "1px solid #e2e8f0",
		background: "#f8fafc",
	},
	productImage: { width: "100%", height: "100%", objectFit: "cover" },
	productTitle: { margin: 0, fontSize: "18px", lineHeight: "26px" },
	productDescription: { marginTop: "6px", color: "#64748b", lineHeight: 1.45 },
	mobilePrice: {
		display: "none",
		marginTop: "8px",
		color: "#0f172a",
		fontWeight: 700,
	},
	quantity: {
		justifySelf: "center",
		display: "inline-flex",
		alignItems: "center",
		overflow: "hidden",
		border: "1px solid #cbd5e1",
		borderRadius: "999px",
		background: "#f8fafc",
	},
	quantityButton: {
		width: "36px",
		height: "32px",
		border: 0,
		background: "transparent",
		color: "#2563eb",
		fontSize: "18px",
		cursor: "pointer",
	},
	quantityValue: { width: "32px", textAlign: "center", fontWeight: 700 },
	itemSubtotal: { justifySelf: "end", fontSize: "17px" },
	removeButton: {
		width: "38px",
		height: "38px",
		border: 0,
		borderRadius: "999px",
		background: "#fef2f2",
		color: "#dc2626",
		fontSize: "26px",
		lineHeight: 1,
		cursor: "pointer",
	},
	emptyState: {
		padding: "24px",
		color: "#64748b",
		background: "#ffffff",
		border: "1px solid #e2e8f0",
		borderRadius: "8px",
		boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
	},
	continueLink: {
		width: "fit-content",
		color: "#2563eb",
		fontWeight: 700,
		textDecoration: "none",
	},
};
