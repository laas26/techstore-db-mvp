// Página de entrada que autentica o usuário e inicia sua sessão.
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/authService";
import { isAdmin } from "../utils/role";

// Controla a autenticacao e redireciona o usuario para o destino original.
export default function Login() {
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [lembrar, setLembrar] = useState(
		() => localStorage.getItem("techstore-remember") === "true",
	);
	const [erro, setErro] = useState(null);
	const [carregando, setCarregando] = useState(false);

	const {
		usuarioLogado,
		carregando: carregandoAuth,
		setUsuarioLogado,
	} = useAuth();
	const navigate = useNavigate();

	if (carregandoAuth) {
		return null;
	}

	if (usuarioLogado) {
		return <Navigate replace to={isAdmin(usuarioLogado) ? "/dashboard" : "/client"} />;
	}

	async function handleSubmit(e) {
		// Limpa o estado anterior antes de iniciar uma nova tentativa de login.
		e.preventDefault();
		setCarregando(true);
		setErro(null);

		try {
			const resposta = await login(email, senha);
			const dadosUsuario = resposta?.usuario || resposta?.user || resposta;

			if (!dadosUsuario) {
				throw new Error("Resposta inválida do servidor");
			}

			localStorage.setItem("techstore-remember", String(lembrar));
			localStorage.removeItem("techstore-user");
			sessionStorage.removeItem("techstore-user");
			setUsuarioLogado(dadosUsuario);

			if (isAdmin(dadosUsuario)) {
				navigate("/dashboard", { replace: true });
			} else {
				navigate("/client", { replace: true });
			}
		} catch (err) {
			console.error("Erro detalhado no login:", err);
			const mensagem = err?.erro || err?.message || "E-mail ou senha inválidos";
			setErro(mensagem);
		} finally {
			setCarregando(false);
		}
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				background: "#F5F6F8",
				color: "#111827",
			}}
		>
			<Navbar />

			<main
				className="auth-main"
				style={{
					flex: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "48px 16px 104px",
				}}
			>
				<LoginForm
					email={email}
					senha={senha}
					lembrar={lembrar}
					erro={erro}
					carregando={carregando}
					onEmailChange={setEmail}
					onSenhaChange={setSenha}
					onLembrarChange={setLembrar}
					onSubmit={handleSubmit}
				/>
			</main>

			<footer
				className="auth-footer"
				style={{
					minHeight: "121px",
					background: "#FFFFFF",
					borderTop: "1px solid #DDE2EA",
					display: "flex",
					alignItems: "center",
					padding: "24px 40px",
				}}
			>
				<div
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexWrap: "wrap",
						gap: "18px 27px",
						color: "#5F6878",
						fontSize: "16px",
					}}
				>
					<a href="/about" style={{ color: "inherit", textDecoration: "none" }}>
						Quem Somos
					</a>
					<a
						href="/privacy"
						style={{ color: "inherit", textDecoration: "none" }}
					>
						Política de Privacidade
					</a>
					<a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
						Termos de Serviço
					</a>
					<a
						href="/shipping"
						style={{ color: "inherit", textDecoration: "none" }}
					>
						Informações de Envio
					</a>
					<a
						href="/contact"
						style={{ color: "inherit", textDecoration: "none" }}
					>
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
