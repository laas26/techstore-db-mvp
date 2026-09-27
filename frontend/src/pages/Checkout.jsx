// Coordena endereço, itens do carrinho e finalização do pedido.
import { useEffect, useState } from "react";
import AddressForm from "../components/checkout/AddressForm";
import CartItemList from "../components/checkout/CartItemList";
import CheckoutFooter from "../components/checkout/CheckoutFooter";
import OrderSummary from "../components/checkout/OrderSummary";
import PixPaymentModal from "../components/checkout/PixPaymentModal";
import { useAuth } from "../context/AuthContext";
import { useProductCatalog } from "../context/ProductCatalogContext";
import { useCart } from "../hooks/useCart";

export default function Checkout() {
	// A pagina coordena o estado do pedido e delega a apresentacao aos componentes.
	const [modalPixAberto, setModalPixAberto] = useState(false);
	const {
		itens: produtos,
		total,
		quantidadeTotal,
		erro: erroCarrinho,
		alterarQuantidade,
		removerProduto,
		limparCarrinho,
		carregando: carregandoCarrinho,
	} = useCart();
	const { usuarioLogado } = useAuth();
	const { recarregar } = useProductCatalog();
	const [dadosEntrega, setDadosEntrega] = useState({
		nome: usuarioLogado?.nome || "",
		endereco: "",
		numero: "",
		bairro: "",
		cidade: "",
		cep: "",
	});
	const [mensagemEntrega, setMensagemEntrega] = useState("");

	useEffect(() => {
		if (usuarioLogado?.nome) {
			setDadosEntrega((dadosAtuais) => ({
				...dadosAtuais,
				nome: usuarioLogado.nome,
			}));
		}
	}, [usuarioLogado?.nome]);

	useEffect(() => {
		const cep = dadosEntrega.cep.replace(/\D/g, "");

		if (cep.length !== 8) {
			return undefined;
		}

		const controller = new AbortController();

		async function buscarEndereco() {
			try {
				const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
					signal: controller.signal,
				});
				const dados = await resposta.json();

				if (resposta.ok && !dados.erro) {
					setDadosEntrega((dadosAtuais) => ({
						...dadosAtuais,
						endereco: dados.logradouro || "",
						bairro: dados.bairro || "",
						cidade: dados.localidade || "",
					}));
				}
			} catch (error) {
				if (error.name !== "AbortError") {
					setMensagemEntrega("Não foi possível consultar o CEP informado.");
				}
			}
		}

		buscarEndereco();

		return () => controller.abort();
	}, [dadosEntrega.cep]);

	function atualizarDadoEntrega(campo, valor) {
		setDadosEntrega((dadosAtuais) => ({
			...dadosAtuais,
			[campo]: valor,
		}));
		setMensagemEntrega("");
	}

	async function handlePagamentoConfirmado() {
		await limparCarrinho();
		recarregar();
	}

	function salvarDadosEntrega(event) {
		event.preventDefault();
		const camposObrigatorios = [
			"nome",
			"endereco",
			"numero",
			"bairro",
			"cidade",
			"cep",
		];
		const dadosValidos = camposObrigatorios.every((campo) =>
			dadosEntrega[campo].trim(),
		);

		if (!dadosValidos) {
			setMensagemEntrega("Preencha todos os campos obrigatórios.");
			return;
		}

		setMensagemEntrega("✓ Dados de entrega salvos com sucesso!");
		setTimeout(() => setMensagemEntrega(""), 3000);
	}

	return (
		<div className="checkout-page" style={styles.page}>
			<section style={styles.header}>
				<h1 className="checkout-title" style={styles.title}>Checkout</h1>
				<p style={styles.subtitle}>
					Revise seu hardware de alto desempenho e conclua sua transação segura.
				</p>
			</section>
			{erroCarrinho && <p role="alert">{erroCarrinho}</p>}

			{carregandoCarrinho ? (
				<p>Carregando carrinho...</p>
			) : (
				<div className="checkout-layout" style={styles.layout}>
					<div style={styles.leftColumn}>
						<AddressForm
							dados={dadosEntrega}
							mensagem={mensagemEntrega}
							onChange={atualizarDadoEntrega}
							onSave={salvarDadosEntrega}
						/>

						<CartItemList
							produtos={produtos}
							onAlterarQuantidade={alterarQuantidade}
							onRemover={removerProduto}
						/>
					</div>

					<OrderSummary
						quantidadeTotal={quantidadeTotal}
						total={total}
						temProdutos={produtos.length > 0}
						onFinalizarCompra={() => setModalPixAberto(true)}
					/>
				</div>
			)}

			{modalPixAberto && (
				<PixPaymentModal
					total={total}
					entrega={dadosEntrega}
					onClose={() => setModalPixAberto(false)}
					onPagamentoConfirmado={handlePagamentoConfirmado}
				/>
			)}

			<CheckoutFooter />
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
	title: { margin: 0, fontSize: "32px", lineHeight: "40px", fontWeight: 700 },
	subtitle: {
		marginTop: "8px",
		color: "#64748b",
		fontSize: "16px",
		lineHeight: "24px",
	},
	layout: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
		gap: "24px",
		alignItems: "start",
	},
	leftColumn: { display: "grid", gap: "24px" },
};
