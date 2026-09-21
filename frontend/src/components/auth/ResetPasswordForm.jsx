// Formulário que envia o token e a nova senha para redefinição.
import { Link } from "react-router-dom";
import { useResetPassword } from "../../hooks/useResetPassword";
import Button from "../common/Button";
import Input from "../common/Input";
import { PasswordVisibilityButton } from "../common/PasswordVisibilityButton";

const fieldIconStyle = {
	position: "absolute",
	left: "14px",
	top: "50%",
	transform: "translateY(-50%)",
	color: "#9CA3AF",
	pointerEvents: "none",
};

const inputStyle = {
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
};

const styles = {
	card: {
		width: "100%",
		maxWidth: "448px",
		background: "#FFFFFF",
		border: "1px solid #DDE2EA",
		borderRadius: "14px",
		boxShadow: "0 4px 10px rgba(17, 24, 39, 0.12)",
		padding: "42px 40px 40px",
	},
	header: { textAlign: "center", marginBottom: "29px" },
	title: {
		margin: "0 0 10px",
		fontSize: "24px",
		lineHeight: 1.25,
		fontWeight: 700,
		color: "#111827",
	},
	subtitle: { margin: 0, fontSize: "16px", lineHeight: 1.5, color: "#6B7280" },
	form: { display: "flex", flexDirection: "column", gap: "20px" },
	label: {
		display: "block",
		marginBottom: "10px",
		fontSize: "14px",
		lineHeight: 1,
		fontWeight: 700,
		color: "#4B5563",
	},
	strength: {
		display: "flex",
		flexDirection: "column",
		gap: "5px",
		marginTop: "6px",
		fontSize: "12px",
		fontWeight: 700,
	},
	strengthTrack: {
		height: "4px",
		background: "#E5E7EB",
		borderRadius: "4px",
		overflow: "hidden",
	},
	error: { color: "#DC2626", fontSize: "14px", margin: 0 },
	success: { color: "#047857", fontSize: "14px", margin: 0 },
	submit: {
		width: "100%",
		height: "44px",
		background: "#2563EB",
		color: "#FFFFFF",
		fontSize: "14px",
		fontWeight: 700,
		borderRadius: "8px",
		border: "none",
		fontFamily: "inherit",
	},
	link: {
		display: "block",
		color: "#2563EB",
		fontSize: "14px",
		fontWeight: 500,
		textAlign: "center",
		textDecoration: "none",
	},
};

function Icon({ children }) {
	return (
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
			{children}
		</svg>
	);
}

function PasswordStrength({ senha }) {
	const temLetras = /[A-Za-z]/.test(senha);
	const temNumeros = /\d/.test(senha);
	const temEspecial = /[^A-Za-z\d]/.test(senha);
	const forte = senha.length > 8 && temLetras && temNumeros && temEspecial;
	const media =
		senha.length >= 6 && senha.length <= 8 && temLetras && temNumeros;
	const cor = forte ? "#16A34A" : media ? "#CA8A04" : "#DC2626";
	const nivel = forte ? "Forte" : media ? "Média" : "Fraca";
	const largura = forte ? "100%" : media ? "66%" : "33%";

	return (
		<div style={styles.strength} aria-live="polite">
			<span style={{ color: cor }}>{nivel}</span>
			<div style={styles.strengthTrack}>
				<div style={{ height: "100%", width: largura, background: cor }} />
			</div>
		</div>
	);
}

export default function ResetPasswordForm() {
	const state = useResetPassword();
	const {
		codigo,
		senha,
		confirmarSenha,
		erro,
		mensagem,
		mostrarSenha,
		setCodigo,
		setSenha,
		setConfirmarSenha,
		handleSubmit,
		toggleMostrarSenha,
	} = state;
	const visibilityButton = (
		<PasswordVisibilityButton
			mostrarSenha={mostrarSenha}
			onClick={toggleMostrarSenha}
		/>
	);

	return (
		<section style={styles.card}>
			<div style={styles.header}>
				<h1 style={styles.title}>Alterar senha</h1>
				<p style={styles.subtitle}>
					Informe o código enviado ao seu e-mail e escolha sua nova senha
				</p>
			</div>
			<form onSubmit={handleSubmit} style={styles.form}>
				<div>
					<label htmlFor="codigo" style={styles.label}>
						Código de verificação
					</label>
					<Input
						id="codigo"
						type="text"
						value={codigo}
						onChange={(event) => setCodigo(event.target.value)}
						placeholder="000000"
						required
						icon={
							<Icon>
								<rect x="5" y="11" width="14" height="10" rx="2" />
								<path d="M8 11V7a4 4 0 0 1 8 0v4" />
							</Icon>
						}
						inputStyle={inputStyle}
					/>
				</div>
				<div>
					<label htmlFor="senha" style={styles.label}>
						Nova senha
					</label>
					<Input
						id="senha"
						type={mostrarSenha ? "text" : "password"}
						value={senha}
						onChange={(event) => setSenha(event.target.value)}
						placeholder="••••••••••••"
						required
						icon={
							<Icon>
								<rect x="5" y="11" width="14" height="10" rx="2" />
								<path d="M8 11V7a4 4 0 0 1 8 0v4" />
							</Icon>
						}
						rightContent={visibilityButton}
						inputStyle={{ ...inputStyle, paddingRight: "48px" }}
					/>
					{senha && <PasswordStrength senha={senha} />}
				</div>
				<div>
					<label htmlFor="confirmarSenha" style={styles.label}>
						Confirmar nova senha
					</label>
					<Input
						id="confirmarSenha"
						type={mostrarSenha ? "text" : "password"}
						value={confirmarSenha}
						onChange={(event) => setConfirmarSenha(event.target.value)}
						placeholder="••••••••••••"
						required
						icon={
							<Icon>
								<rect x="5" y="11" width="14" height="10" rx="2" />
								<path d="M8 11V7a4 4 0 0 1 8 0v4" />
								<path d="M9 16l2 2 4-4" />
							</Icon>
						}
						rightContent={visibilityButton}
						inputStyle={{ ...inputStyle, paddingRight: "48px" }}
					/>
					{confirmarSenha && senha !== confirmarSenha && (
						<p role="alert" style={styles.error}>
							As senhas não coincidem.
						</p>
					)}
				</div>
				{erro && (
					<p role="alert" aria-live="polite" style={styles.error}>
						{erro}
					</p>
				)}
				{mensagem && (
					<p role="status" aria-live="polite" style={styles.success}>
						{mensagem}
					</p>
				)}
				<Button type="submit" style={styles.submit}>
					Resetar senha
				</Button>
				<Link to="/login" style={styles.link}>
					Voltar ao Login
				</Link>
			</form>
		</section>
	);
}
