// Modal compartilhado para cadastrar e editar produtos administrativos.
const CATEGORIAS = ["Notebooks", "Periféricos", "Áudio"];

export const FORMULARIO_INICIAL = {
	name: "",
	sku: "",
	category: CATEGORIAS[0],
	price: "",
	stock: "",
	image: "",
	description: "",
};

export default function ProductModal({
	produto,
	formulario,
	erro,
	onChange,
	onClose,
	onSubmit,
}) {
	if (!formulario) return null;

	return (
		<div className="product-modal-backdrop" role="presentation">
			<section
				aria-labelledby="product-modal-title"
				aria-modal="true"
				className="product-modal"
				role="dialog"
			>
				<h2 id="product-modal-title">
					{produto ? "Editar Produto" : "Novo Produto"}
				</h2>
				<form onSubmit={onSubmit}>
					<label>
						Nome do produto
						<input
							className="input-field"
							name="name"
							onChange={onChange}
							required
							value={formulario.name}
						/>
					</label>
					<label>
						SKU
						<input
							className="input-field"
							name="sku"
							onChange={onChange}
							placeholder="Ex.: SBX-2026"
							value={formulario.sku}
						/>
					</label>
					<label>
						Categoria
						<select
							className="input-field"
							name="category"
							onChange={onChange}
							value={formulario.category}
						>
							{CATEGORIAS.map((categoria) => (
								<option key={categoria}>{categoria}</option>
							))}
						</select>
					</label>
					<div className="product-form-grid">
						<label>
							Preço (R$)
							<input
								className="input-field"
								min="0"
								name="price"
								onChange={onChange}
								required
								step="0.01"
								type="number"
								value={formulario.price}
							/>
						</label>
						<label>
							Estoque
							<input
								className="input-field"
								min="0"
								name="stock"
								onChange={onChange}
								required
								step="1"
								type="number"
								value={formulario.stock}
							/>
						</label>
					</div>
					<label>
						URL da imagem
						<input
							className="input-field"
							name="image"
							onChange={onChange}
							placeholder="/img/produto.jpg"
							value={formulario.image}
						/>
					</label>
					<label>
						Descrição
						<textarea
							className="input-field"
							name="description"
							onChange={onChange}
							required
							value={formulario.description}
						/>
					</label>
					{erro && (
						<p className="input-error-message" role="alert">
							{erro}
						</p>
					)}
					<div className="product-modal-actions">
						<button className="btn-secondary" onClick={onClose} type="button">
							Cancelar
						</button>
						<button className="btn-primary" type="submit">
							{produto ? "Salvar" : "Cadastrar"}
						</button>
					</div>
				</form>
			</section>
		</div>
	);
}
