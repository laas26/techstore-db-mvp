// Tela do cliente (em desenvolvimento).
// Placeholder propositalmente sem o Sidebar administrativo: o cliente
// nunca deve ver o painel de gestão após o login.
import { Link } from "react-router-dom";

export default function Client() {
	return (
		<div
			style={{
				minHeight: "calc(100vh - 86px)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "16px",
				padding: "48px 24px",
				background: "#F5F6F8",
				color: "#1F2937",
				textAlign: "center",
			}}
		>
			<h1 style={{ margin: 0, fontSize: "28px" }}>Minha área</h1>
			<p style={{ margin: 0, maxWidth: "480px", color: "#5F6878" }}>
				Esta tela do cliente ainda está em desenvolvimento. Por enquanto,
				use a loja para ver produtos e o carrinho para finalizar compras.
			</p>
			<nav
				style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
				aria-label="Navegação do cliente"
			>
				<Link to="/">Loja</Link>
				<Link to="/cart">Carrinho</Link>
				<Link to="/profile">Perfil</Link>
			</nav>
		</div>
	);
}
