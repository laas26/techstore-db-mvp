// Apresenta os campos e ações do formulário de autenticação.
import { useState } from "react";
import { Link } from "react-router-dom";
import { PasswordVisibilityButton } from "../common/PasswordVisibilityButton";

// Renderiza o formulario controlado de entrada e seus estados visuais.
const fieldIconStyle = {
	position: "absolute",
	left: "14px",
	top: "50%",
	transform: "translateY(-50%)",
	color: "#9CA3AF",
	pointerEvents: "none",
};

export default function LoginForm({
	email,
	senha,
	lembrar,
	erro,
	carregando,
	onEmailChange,
	onSenhaChange,
	onLembrarChange,
	onSubmit,
}) {
	const [mostrarSenha, setMostrarSenha] = useState(false);

	return (
		<section className="auth-card" style={styles.card}>
			<div style={styles.header}>
				<h1 style={styles.title}>Acesse sua conta</h1>
				<p style={styles.subtitle}>Informe seus dados para continuar</p>
			</div>

			<form onSubmit={onSubmit} style={styles.form}>
				<div>
					<label htmlFor="email" style={styles.label}>
						E-mail
					</label>
					<div style={styles.fieldWrap}>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
							focusable="false"
							style={fieldIconStyle}
						>
							<path d="M4 4h16v16H4z" opacity="0" />
							<path d="M22 6l-10 7L2 6" />
							<path d="M2 6h20v12H2z" />
						</svg>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => onEmailChange(e.target.value)}
							placeholder="exemplo@techstore.io"
							required
							style={styles.input}
						/>
					</div>
				</div>

				<div>
					<div style={styles.passwordHeader}>
						<label htmlFor="senha" style={styles.passwordLabel}>
							Senha
						</label>
						<Link to="/forgot-password" style={styles.linkStrong}>
							Esqueceu a senha?
						</Link>
					</div>
					<div style={styles.fieldWrap}>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
							focusable="false"
							style={fieldIconStyle}
						>
							<rect x="5" y="11" width="14" height="10" rx="2" />
							<path d="M8 11V7a4 4 0 0 1 8 0v4" />
						</svg>
						<input
							id="senha"
							type={mostrarSenha ? "text" : "password"}
							value={senha}
							onChange={(e) => onSenhaChange(e.target.value)}
							placeholder="••••••••••••"
							required
							style={{ ...styles.input, paddingRight: "48px" }}
						/>
						<PasswordVisibilityButton
							mostrarSenha={mostrarSenha}
							onClick={() => setMostrarSenha((atual) => !atual)}
						/>
					</div>
				</div>

				<label style={styles.checkbox}>
					<input
						type="checkbox"
						checked={lembrar}
						onChange={(e) => onLembrarChange(e.target.checked)}
						style={styles.checkboxInput}
					/>
					Mantenha-me conectado
				</label>

				{erro && (
					<p role="alert" aria-live="polite" style={styles.error}>
						{erro}
					</p>
				)}

				<button type="submit" disabled={carregando} style={styles.submit}>
					{carregando ? "Entrando..." : "Entrar"}
				</button>

				<p style={styles.registerText}>
					Não tem uma conta?{" "}
					<Link to="/register" style={styles.link}>
						Cadastre-se aqui!
					</Link>
				</p>
			</form>
		</section>
	);
}

const styles = {
	card: {
		width: "100%",
		maxWidth: "448px",
		minHeight: "511px",
		background: "#FFFFFF",
		border: "1px solid #DDE2EA",
		borderRadius: "14px",
		boxShadow: "0 4px 10px rgba(17, 24, 39, 0.12)",
		padding: "42px 40px 40px",
	},
	header: {
		textAlign: "center",
		marginBottom: "29px",
	},
	title: {
		margin: "0 0 10px",
		fontSize: "24px",
		lineHeight: 1.25,
		fontWeight: 700,
		color: "#111827",
	},
	subtitle: {
		margin: 0,
		fontSize: "16px",
		lineHeight: 1.5,
		color: "#6B7280",
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: "24px",
	},
	label: {
		display: "block",
		marginBottom: "10px",
		fontSize: "14px",
		lineHeight: 1,
		fontWeight: 700,
		color: "#4B5563",
	},
	fieldWrap: {
		position: "relative",
	},
	input: {
		width: "100%",
		height: "50px",
		background: "#F9FAFB",
		border: "1px solid #CBD2DC",
		borderRadius: "8px",
		padding: "0 16px 0 42px",
		fontSize: "15px",
		color: "#111827",
		fontFamily: "inherit",
		outline: "none",
	},
	passwordHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: "10px",
		gap: "16px",
	},
	passwordLabel: {
		fontSize: "14px",
		lineHeight: 1,
		fontWeight: 700,
		color: "#4B5563",
	},
	linkStrong: {
		fontSize: "14px",
		lineHeight: 1,
		fontWeight: 700,
		color: "#2563EB",
		textDecoration: "none",
	},
	checkbox: {
		display: "flex",
		alignItems: "center",
		gap: "9px",
		color: "#5F6878",
		fontSize: "15px",
		cursor: "pointer",
	},
	checkboxInput: {
		width: "17px",
		height: "17px",
		margin: 0,
		accentColor: "#2563EB",
	},
	error: {
		color: "#DC2626",
		fontSize: "14px",
		margin: 0,
	},
	submit: {
		width: "100%",
		height: "44px",
		background: "#2563EB",
		color: "#FFFFFF",
		fontSize: "14px",
		fontWeight: 700,
		borderRadius: "8px",
		border: "none",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "9px",
		fontFamily: "inherit",
	},
	registerText: {
		textAlign: "center",
		fontSize: "14px",
		color: "#6B7280",
		margin: "2px 0 0",
	},
	link: {
		color: "#2563EB",
		textDecoration: "none",
		fontWeight: 500,
	},
};
