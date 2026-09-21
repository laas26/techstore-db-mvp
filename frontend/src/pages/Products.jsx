// Painel administrativo para listar e manter produtos via API protegida.
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import ProductModal, {
	FORMULARIO_INICIAL,
} from "../components/product/ProductModal";
import {
	atualizarProduto,
	criarProduto,
	listarProdutos,
	removerProduto,
} from "../services/productService";
import "../styles/theme.css";

const CATEGORIAS = ["Notebooks", "Periféricos", "Áudio"];
const FILTRO_TODAS = "Todas as Categorias";

function statusDoEstoque(stock) {
	if (stock === 0) return "Sem Estoque";
	if (stock < 5) return "Estoque Baixo";
	return "Em Estoque";
}

function normalizarProdutos(produtos) {
	if (!Array.isArray(produtos)) return [];
	return produtos.map((produto) => ({
		...produto,
		category: produto.category === "Laptops" ? "Notebooks" : produto.category,
		status: statusDoEstoque(Number(produto.stock) || 0),
	}));
}

function adaptarProdutoHome(produto) {
	const estoque = Number.isInteger(produto.stock) ? produto.stock : 0;
	const categorias = {
		audio: "Áudio",
		notebooks: "Notebooks",
		perifericos: "Periféricos",
	};
	return {
		id: String(produto.id),
		name: produto.nome || "Produto sem nome",
		sku: produto.sku || `SKU-${String(produto.id).padStart(4, "0")}`,
		category:
			categorias[produto.categoria] || produto.categoria || CATEGORIAS[0],
		price: Number(produto.preco) || 0,
		stock: estoque,
		image: produto.imagem || "",
		description: produto.descricao || "",
		status: statusDoEstoque(estoque),
	};
}

function classeStatus(status) {
	if (status === "Sem Estoque") return "product-status product-status-error";
	if (status === "Estoque Baixo")
		return "product-status product-status-warning";
	return "product-status product-status-success";
}

function mensagemDeErro(error) {
	if (error.status === 401) return "Sua sessão expirou. Faça login novamente.";
	if (error.status === 403)
		return "Você não tem permissão para alterar o catálogo.";
	return error.erro || error.message || "Não foi possível concluir a operação.";
}

export function Products() {
	const [produtos, setProdutos] = useState([]);
	const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
	const [formulario, setFormulario] = useState(null);
	const [erro, setErro] = useState("");
	const [busca, setBusca] = useState("");
	const [categoria, setCategoria] = useState(FILTRO_TODAS);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		setCarregando(true);
		listarProdutos()
			.then((catalogo) => {
				if (!ativo) return;
				setProdutos(normalizarProdutos(catalogo.map(adaptarProdutoHome)));
			})
			.catch((error) => {
				if (ativo) setErro(mensagemDeErro(error));
			})
			.finally(() => {
				if (ativo) setCarregando(false);
			});
		return () => {
			ativo = false;
		};
	}, []);

	const produtosFiltrados = useMemo(() => {
		const termo = busca.trim().toLowerCase();
		return produtos.filter(
			(produto) =>
				produto.name?.toLowerCase().includes(termo) &&
				(categoria === FILTRO_TODAS || produto.category === categoria),
		);
	}, [busca, categoria, produtos]);

	function abrirCadastro() {
		setProdutoEmEdicao(null);
		setFormulario({ ...FORMULARIO_INICIAL });
		setErro("");
	}

	function abrirEdicao(produto) {
		setProdutoEmEdicao(produto);
		setFormulario({
			name: produto.name || "",
			sku: produto.sku || "",
			category: produto.category || CATEGORIAS[0],
			price: String(produto.price ?? ""),
			stock: String(produto.stock ?? ""),
			image: produto.image || "",
			description: produto.description || "",
		});
		setErro("");
	}

	function fecharModal() {
		setFormulario(null);
		setProdutoEmEdicao(null);
		setErro("");
	}

	async function salvarFormulario(event) {
		event.preventDefault();
		const name = formulario.name.trim();
		const price = Number(formulario.price);
		const stock = Number(formulario.stock);
		if (
			!name ||
			!Number.isFinite(price) ||
			price < 0 ||
			!Number.isInteger(stock) ||
			stock < 0
		) {
			setErro("Informe um nome, preço e estoque válidos.");
			return;
		}
		const dados = {
			name,
			sku: formulario.sku.trim() || `SKU-${Date.now()}`,
			category: formulario.category,
			price,
			stock,
			image: formulario.image.trim(),
			description: formulario.description.trim(),
		};
		if (!dados.description) {
			setErro("Informe uma descrição para o produto.");
			return;
		}

		try {
			const produtoSalvo = produtoEmEdicao
				? await atualizarProduto(produtoEmEdicao.id, dados)
				: await criarProduto(dados);
			const produtoNormalizado = adaptarProdutoHome(produtoSalvo);
			setProdutos((produtosAtuais) =>
				produtoEmEdicao
					? produtosAtuais.map((produto) =>
							produto.id === produtoNormalizado.id
								? produtoNormalizado
								: produto,
						)
					: [produtoNormalizado, ...produtosAtuais],
			);
			fecharModal();
		} catch (error) {
			setErro(mensagemDeErro(error));
		}
	}

	async function excluirProduto(id) {
		if (window.confirm("Tem certeza que deseja excluir este produto?")) {
			try {
				await removerProduto(id);
				setProdutos((produtosAtuais) =>
					produtosAtuais.filter((produto) => produto.id !== id),
				);
			} catch (error) {
				setErro(mensagemDeErro(error));
			}
		}
	}

	return (
		<div className="dash-container">
			<Sidebar />
			<main className="dash-main product-page">
				<header className="dash-header">
					<div>
						<h1>Gerenciamento de Estoque</h1>
						<p>Monitore e gerencie os produtos cadastrados.</p>
					</div>
					<button
						className="dash-btn-primary"
						onClick={abrirCadastro}
						type="button"
					>
						+ Novo Produto
					</button>
				</header>
				{erro && !formulario && (
					<p className="input-error-message" role="alert">
						{erro}
					</p>
				)}
				<section className="product-toolbar" aria-label="Filtros de produtos">
					<input
						aria-label="Buscar produtos"
						className="input-field"
						onChange={(event) => setBusca(event.target.value)}
						placeholder="Buscar por nome..."
						type="search"
						value={busca}
					/>
					<select
						aria-label="Filtrar por categoria"
						className="dash-select"
						onChange={(event) => setCategoria(event.target.value)}
						value={categoria}
					>
						<option>{FILTRO_TODAS}</option>
						{CATEGORIAS.map((item) => (
							<option key={item}>{item}</option>
						))}
					</select>
				</section>
				<section className="dash-card product-table-card">
					<div className="dash-table-wrapper">
						<table className="dash-table product-table">
							<thead>
								<tr>
									<th>Produto</th>
									<th>Categoria</th>
									<th>Preço (R$)</th>
									<th>Estoque</th>
									<th>Status</th>
									<th>Ações</th>
								</tr>
							</thead>
							<tbody>
								{carregando ? (
									<tr>
										<td colSpan="6">Carregando produtos...</td>
									</tr>
								) : (
									produtosFiltrados.map((produto) => (
										<tr key={produto.id}>
											<td className="product-name-cell">
												<div className="product-image-box">
													{produto.image ? (
														<img src={produto.image} alt="" />
													) : (
														<span aria-hidden="true">IMG</span>
													)}
												</div>
												<div>
													<strong>{produto.name}</strong>
													<span>SKU: {produto.sku || "Não informado"}</span>
												</div>
											</td>
											<td>{produto.category}</td>
											<td>R$ {Number(produto.price).toFixed(2)}</td>
											<td>{produto.stock} un.</td>
											<td>
												<span className={classeStatus(produto.status)}>
													{produto.status}
												</span>
											</td>
											<td className="product-actions">
												<button
													onClick={() => abrirEdicao(produto)}
													type="button"
												>
													Editar
												</button>
												<button
													onClick={() => excluirProduto(produto.id)}
													type="button"
												>
													Excluir
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
						{produtosFiltrados.length === 0 && (
							<p className="dash-empty-state">
								{produtos.length === 0
									? "Nenhum produto cadastrado."
									: "Nenhum produto encontrado."}
							</p>
						)}
					</div>
					<p className="product-total">
						Total de itens: <strong>{produtos.length}</strong>
					</p>
				</section>
			</main>
			<ProductModal
				produto={produtoEmEdicao}
				formulario={formulario}
				erro={erro}
				onChange={(event) =>
					setFormulario((atual) => ({
						...atual,
						[event.target.name]: event.target.value,
					}))
				}
				onClose={fecharModal}
				onSubmit={salvarFormulario}
			/>
		</div>
	);
}

export default Products;
