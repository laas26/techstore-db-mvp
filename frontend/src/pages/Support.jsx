// Central de suporte e ajuda da TechStore.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";

const FAQS = [
	{
		categoria: "Pedidos",
		pergunta: "Como acompanho meu pedido?",
		resposta:
			"Acesse Minha área ou Perfil após o login e verifique o status do pedido. Assim que o pagamento via Pix for confirmado, o status muda de pendente para pago.",
	},
	{
		categoria: "Pedidos",
		pergunta: "Fiz o Pix mas o pedido continua pendente. O que faço?",
		resposta:
			"Volte ao checkout e use o botão de simular pagamento com o mesmo Idempotency-Key. O sistema impede cobrança duplicada: a mesma chave com o mesmo conteúdo retorna o pedido existente.",
	},
	{
		categoria: "Entregas",
		pergunta: "Qual o prazo e o valor do frete?",
		resposta:
			"O frete é exibido no resumo do checkout antes da finalização. No MVP o cálculo é simplificado (Grátis na vitrine do checkout) e o endereço é validado com CEP de 8 dígitos e autocomplete via ViaCEP.",
	},
	{
		categoria: "Trocas",
		pergunta: "Como solicito troca ou devolução?",
		resposta:
			"Entre em contato pelo formulário abaixo informando o número do pedido e o motivo. Produtos com histórico de venda são preservados no pedido, então a análise é feita sobre o snapshot de nome e preço da compra.",
	},
	{
		categoria: "Conta",
		pergunta: "Esqueci minha senha. Como recupero?",
		resposta:
			"Use a página Esqueci minha senha na tela de login. Você recebe um link de redefinição válido por 1 hora. Por segurança, a resposta é sempre genérica, mesmo se o e-mail não existir.",
	},
	{
		categoria: "Conta",
		pergunta: "Quais são os acessos de demonstração?",
		resposta:
			"Admin: admin@techstore.local / Admin@123 (acessa /dashboard). Cliente: cliente@techstore.local / Cliente@123 (acessa /client). Use a loja para comprar e o painel de gestão para gerenciar o estoque.",
	},
];

const CANAIS = [
	{
		titulo: "Chat da loja",
		descricao: "Seg–Sex, 8h às 18h. Resposta média em 5 minutos.",
		acao: "Iniciar conversa",
		icone: "💬",
	},
	{
		titulo: "E-mail",
		descricao: "suporte@techstore.local — retorno em até 24h úteis.",
		acao: "Escrever e-mail",
		icone: "✉️",
	},
	{
		titulo: "Telefone",
		descricao: "0800 555 0199 — Seg–Sex, 8h às 18h.",
		acao: "Ligar agora",
		icone: "📞",
	},
];

export default function Support() {
	const [busca, setBusca] = useState("");
	const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
	const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
	const [enviado, setEnviado] = useState(false);

	const categorias = useMemo(
		() => ["Todas", ...Array.from(new Set(FAQS.map((f) => f.categoria)))],
		[],
	);

	const faqsFiltradas = useMemo(() => {
		const termo = busca.trim().toLowerCase();
		return FAQS.filter((faq) => {
			const matchCategoria =
				categoriaAtiva === "Todas" || faq.categoria === categoriaAtiva;
			const matchBusca =
				!termo ||
				`${faq.pergunta} ${faq.resposta}`.toLowerCase().includes(termo);
			return matchCategoria && matchBusca;
		});
	}, [busca, categoriaAtiva]);

	function handleSubmit(event) {
		event.preventDefault();
		if (!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()) {
			return;
		}
		setEnviado(true);
	}

	return (
		<div
			style={{
				minHeight: "calc(100vh - 86px)",
				display: "flex",
				flexDirection: "column",
				background: "#F5F6F8",
				color: "#1F2937",
			}}
		>
			<main
				style={{
					width: "100%",
					maxWidth: "1200px",
					margin: "0 auto",
					padding: "32px 24px 72px",
					flex: 1,
					display: "grid",
					gap: "24px",
				}}
			>
				<section style={styles.hero}>
					<p style={styles.heroKicker}>Central de ajuda</p>
					<h1 style={styles.heroTitle}>Como podemos ajudar?</h1>
					<p style={styles.heroSubtitle}>
						Busque por pedidos, entregas, trocas ou conta. Se preferir,
						fale direto com o time da TechStore pelo formulário ou canais
						ao lado.
					</p>
					<input
						type="search"
						value={busca}
						onChange={(event) => setBusca(event.target.value)}
						placeholder="Buscar ajuda: ex. pedido, Pix, senha..."
						aria-label="Buscar ajuda"
						style={styles.searchInput}
					/>
				</section>

				<div style={styles.layout}>
					<section aria-label="Perguntas frequentes" style={styles.faqColumn}>
						<div style={styles.filterRow}>
							{categorias.map((categoria) => (
								<button
									key={categoria}
									type="button"
									onClick={() => setCategoriaAtiva(categoria)}
									style={
										categoriaAtiva === categoria
											? styles.filterActive
											: styles.filterButton
									}
								>
									{categoria}
								</button>
							))}
						</div>

						{faqsFiltradas.length === 0 ? (
							<p role="status" style={styles.empty}>
								Nenhum resultado para essa busca. Tente outro termo ou
								envie uma mensagem abaixo.
							</p>
						) : (
							faqsFiltradas.map((faq) => (
								<details key={faq.pergunta} style={styles.faqCard}>
									<summary style={styles.faqSummary}>
										<span style={styles.faqBadge}>{faq.categoria}</span>
										{faq.pergunta}
									</summary>
									<p style={styles.faqAnswer}>{faq.resposta}</p>
								</details>
							))
						)}

						<div style={styles.formCard}>
							<h2 style={styles.sectionTitle}>Ainda precisa de ajuda?</h2>
							<p style={styles.sectionSubtitle}>
								Envie uma mensagem e retornamos em até 24h úteis.
							</p>
							{enviado ? (
								<p role="status" style={styles.success}>
									Mensagem enviada com sucesso! Obrigado pelo contato,
									{form.nome ? ` ${form.nome.split(" ")[0]}` : ""}.
								</p>
							) : (
								<form onSubmit={handleSubmit} style={styles.form}>
									<label style={styles.label}>
										Nome
										<input
											className="input-field"
											value={form.nome}
											onChange={(event) =>
												setForm({ ...form, nome: event.target.value })
											}
											placeholder="Seu nome"
											required
										/>
									</label>
									<label style={styles.label}>
										E-mail
										<input
											className="input-field"
											type="email"
											value={form.email}
											onChange={(event) =>
												setForm({ ...form, email: event.target.value })
											}
											placeholder="voce@email.com"
											required
										/>
									</label>
									<label style={styles.label}>
										Mensagem
										<textarea
											className="input-field"
											value={form.mensagem}
											onChange={(event) =>
												setForm({ ...form, mensagem: event.target.value })
											}
											placeholder="Descreva o problema ou dúvida..."
											rows={4}
											required
											style={{ resize: "vertical" }}
										/>
									</label>
									<button type="submit" className="btn-primary">
										Enviar mensagem
									</button>
								</form>
							)}
						</div>
					</section>

					<aside aria-label="Canais de atendimento" style={styles.sideColumn}>
						{CANAIS.map((canal) => (
							<div key={canal.titulo} style={styles.channelCard}>
								<span aria-hidden="true" style={styles.channelIcon}>
									{canal.icone}
								</span>
								<strong style={styles.channelTitle}>{canal.titulo}</strong>
								<p style={styles.channelText}>{canal.descricao}</p>
								<span style={styles.channelAction}>{canal.acao}</span>
							</div>
						))}

						<div style={styles.shortcutCard}>
							<strong style={styles.channelTitle}>Atalhos rápidos</strong>
							<nav
								style={styles.shortcutNav}
								aria-label="Atalhos do suporte"
							>
								<Link to="/" style={styles.shortcutLink}>
									Ir para a loja
								</Link>
								<Link to="/cart" style={styles.shortcutLink}>
									Ver carrinho
								</Link>
								<Link to="/login" style={styles.shortcutLink}>
									Entrar na conta
								</Link>
								<Link to="/register" style={styles.shortcutLink}>
									Criar conta
								</Link>
							</nav>
						</div>
					</aside>
				</div>
			</main>
			<Footer />
		</div>
	);
}

const styles = {
	hero: {
		background: "#FFFFFF",
		border: "1px solid #E2E8F0",
		borderRadius: "12px",
		boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
		padding: "32px",
		display: "grid",
		gap: "12px",
	},
	heroKicker: {
		margin: 0,
		color: "#2563EB",
		fontSize: "12px",
		fontWeight: 700,
		textTransform: "uppercase",
		letterSpacing: "0.08em",
	},
	heroTitle: {
		margin: 0,
		fontSize: "32px",
		lineHeight: "40px",
		color: "#1F2937",
	},
	heroSubtitle: {
		margin: 0,
		color: "#5F6878",
		fontSize: "16px",
		maxWidth: "720px",
	},
	searchInput: {
		marginTop: "8px",
		padding: "12px 14px",
		border: "1px solid #DDE2EA",
		borderRadius: "8px",
		fontSize: "15px",
		maxWidth: "560px",
		width: "100%",
	},
	layout: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 320px)",
		gap: "24px",
		alignItems: "start",
	},
	faqColumn: {
		display: "grid",
		gap: "12px",
		alignContent: "start",
	},
	filterRow: {
		display: "flex",
		flexWrap: "wrap",
		gap: "8px",
	},
	filterButton: {
		padding: "8px 14px",
		border: "1px solid #DDE2EA",
		borderRadius: "999px",
		background: "#FFFFFF",
		color: "#4B5563",
		fontSize: "14px",
		fontWeight: 500,
		cursor: "pointer",
	},
	filterActive: {
		padding: "8px 14px",
		border: "1px solid #2563EB",
		borderRadius: "999px",
		background: "#2563EB",
		color: "#FFFFFF",
		fontSize: "14px",
		fontWeight: 600,
		cursor: "pointer",
	},
	empty: {
		margin: 0,
		padding: "24px",
		border: "1px solid #E2E8F0",
		borderRadius: "8px",
		background: "#FFFFFF",
		color: "#64748B",
		textAlign: "center",
	},
	faqCard: {
		background: "#FFFFFF",
		border: "1px solid #E2E8F0",
		borderRadius: "12px",
		boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
		padding: "16px 18px",
	},
	faqSummary: {
		cursor: "pointer",
		fontWeight: 600,
		fontSize: "15px",
		display: "flex",
		alignItems: "center",
		gap: "10px",
	},
	faqBadge: {
		flexShrink: 0,
		padding: "4px 8px",
		borderRadius: "999px",
		background: "#EFF6FF",
		color: "#2563EB",
		fontSize: "12px",
		fontWeight: 700,
	},
	faqAnswer: {
		margin: "12px 0 0",
		color: "#5F6878",
		fontSize: "14px",
		lineHeight: "22px",
	},
	formCard: {
		background: "#FFFFFF",
		border: "1px solid #E2E8F0",
		borderRadius: "12px",
		boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
		padding: "24px",
		display: "grid",
		gap: "12px",
	},
	sectionTitle: {
		margin: 0,
		fontSize: "20px",
		color: "#1F2937",
	},
	sectionSubtitle: {
		margin: 0,
		color: "#5F6878",
		fontSize: "14px",
	},
	form: {
		display: "grid",
		gap: "12px",
	},
	label: {
		display: "grid",
		gap: "6px",
		color: "#64748B",
		fontSize: "13px",
		fontWeight: 600,
	},
	success: {
		margin: 0,
		padding: "12px 14px",
		border: "1px solid #BBF7D0",
		borderRadius: "8px",
		background: "#F0FDF4",
		color: "#15803D",
		fontSize: "14px",
		fontWeight: 600,
	},
	sideColumn: {
		display: "grid",
		gap: "12px",
		alignContent: "start",
	},
	channelCard: {
		background: "#FFFFFF",
		border: "1px solid #E2E8F0",
		borderRadius: "12px",
		boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
		padding: "18px",
		display: "grid",
		gap: "6px",
	},
	channelIcon: {
		fontSize: "22px",
	},
	channelTitle: {
		fontSize: "15px",
		color: "#1F2937",
	},
	channelText: {
		margin: 0,
		color: "#5F6878",
		fontSize: "14px",
		lineHeight: "20px",
	},
	channelAction: {
		marginTop: "4px",
		color: "#2563EB",
		fontSize: "14px",
		fontWeight: 600,
	},
	shortcutCard: {
		background: "#FFFFFF",
		border: "1px solid #E2E8F0",
		borderRadius: "12px",
		boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
		padding: "18px",
		display: "grid",
		gap: "10px",
	},
	shortcutNav: {
		display: "grid",
		gap: "8px",
	},
	shortcutLink: {
		color: "#2563EB",
		fontSize: "14px",
		fontWeight: 500,
		textDecoration: "none",
	},
};
