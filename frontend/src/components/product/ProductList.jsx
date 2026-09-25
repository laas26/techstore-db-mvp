// Organiza os produtos filtrados em uma grade de cartões reutilizáveis.
import ProductCard from "./ProductCard";

// Organiza os cards dos produtos filtrados em uma lista responsiva.
export default function ProductList({
	produtos,
	quantidades,
	onAdicionarProduto,
}) {
	return (
		<section
			className="product-grid"
			aria-label="Produtos"
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
				gap: "24px",
			}}
		>
			{produtos.map((produto) => (
				<ProductCard
					key={produto.id}
					produto={produto}
					quantidade={quantidades[produto.id] || 0}
					onAdicionar={onAdicionarProduto}
				/>
			))}

			{produtos.length === 0 && (
				<div className="card" style={{ padding: "24px" }}>
					<p style={{ color: "#6B7280" }}>
						Nenhum produto encontrado nessa faixa de preço.
					</p>
				</div>
			)}
		</section>
	);
}
