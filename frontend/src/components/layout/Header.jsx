// Cabeçalho de navegação usado pelas áreas internas da aplicação.
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";
import Logo from "./common/Logo";

// Cabecalho autenticado com acesso ao perfil e encerramento da sessao.
function Header() {
	const { usuarioLogado, setUsuarioLogado } = useAuth();
	const navigate = useNavigate();

	async function handleLogout() {
		try {
			await logout();
		} catch (error) {
			console.error("Erro ao encerrar sessão:", error);
		} finally {
			setUsuarioLogado(null); // Limpa o estado global em memória
			navigate("/login"); // Redireciona para o login
		}
	}

	if (!usuarioLogado) return null;

	return (
		<header
			className="internal-header"
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "var(--space-2) var(--space-3)",
				background: "var(--color-surface)",
				borderBottom: "1px solid var(--color-border)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
				<Logo size={24} />
				<span style={{ color: "var(--color-text)" }}>
					Olá, {usuarioLogado.nome}
				</span>
			</div>
			<button type="button" className="btn-secondary" onClick={handleLogout}>
				Sair
			</button>
		</header>
	);
}

export default Header;
