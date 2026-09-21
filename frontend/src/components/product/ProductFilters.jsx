// Controles de categoria e faixa de preço da vitrine de produtos.
import { Headphones, Laptop, Mouse } from "lucide-react";

// Categorias e limites usados pelos controles de filtragem da vitrine.
const categorias = [
	{ label: "Todos", valor: "todos" },
	{ label: "Áudio", valor: "audio", Icone: Headphones },
	{ label: "Notebooks", valor: "notebooks", Icone: Laptop },
	{ label: "Periféricos", valor: "perifericos", Icone: Mouse },
];

const formatarPreco = (valor) =>
	valor.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});

export default function ProductFilters({
	categoriaAtiva,
	precoMaximo,
	precoMaximoPadrao,
	onCategoriaChange,
	onPrecoMaximoChange,
}) {
	return (
		<aside style={{ display: "grid", gap: "24px" }}>
			<section className="card" style={{ padding: "24px" }}>
				<h2
					style={{
						margin: "0 0 16px",
						color: "#111827",
						fontSize: "18px",
						fontWeight: 700,
					}}
				>
					Categorias
				</h2>
				<div style={{ display: "grid", gap: "8px" }}>
					{categorias.map(({ label, valor, Icone }) => {
						const ativo = valor === categoriaAtiva;

						return (
							<button
								key={valor}
								type="button"
								onClick={() => onCategoriaChange(valor)}
								style={{
									width: "100%",
									border: "none",
									borderRadius: "8px",
									padding: "12px 14px",
									display: "inline-flex",
									alignItems: "center",
									gap: "8px",
									textAlign: "left",
									background: ativo ? "#EFF6FF" : "transparent",
									color: ativo ? "#1D4ED8" : "#4B5563",
									fontWeight: ativo ? 700 : 500,
									cursor: "pointer",
								}}
							>
								{Icone && (
									<Icone size={18} strokeWidth={1.75} aria-hidden="true" />
								)}
								{label}
							</button>
						);
					})}
				</div>
			</section>

			<section className="card" style={{ padding: "24px" }}>
				<h2
					style={{
						margin: "0 0 16px",
						color: "#111827",
						fontSize: "18px",
						fontWeight: 700,
					}}
				>
					Faixa de Preço
				</h2>
				<input
					type="range"
					min="0"
					max={precoMaximoPadrao}
					step="10"
					value={precoMaximo}
					onChange={(e) => onPrecoMaximoChange(Number(e.target.value))}
					aria-label="Preço máximo"
					style={{
						width: "100%",
						accentColor: "#2563EB",
						cursor: "pointer",
					}}
				/>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						marginTop: "12px",
						color: "#6B7280",
						fontSize: "14px",
					}}
				>
					<span>{formatarPreco(precoMaximo)}</span>
				</div>
			</section>
		</aside>
	);
}
