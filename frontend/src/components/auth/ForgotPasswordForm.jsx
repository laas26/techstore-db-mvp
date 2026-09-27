// Formulário responsável por solicitar instruções de recuperação de senha.
import { Link } from "react-router-dom";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import Button from "../common/Button";
import Input from "../common/Input";

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
	form: { display: "flex", flexDirection: "column", gap: "24px" },
	label: {
		display: "block",
		marginBottom: "10px",
		fontSize: "14px",
		lineHeight: 1,
		fontWeight: 700,
		color: "#4B5563",
	},
	message: { color: "#047857", fontSize: "14px", margin: 0 },
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

function EmailIcon() {
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
			style={{
				position: "absolute",
				left: "14px",
				top: "50%",
				transform: "translateY(-50%)",
				color: "#9CA3AF",
				pointerEvents: "none",
			}}
		>
			<path d="M4 4h16v16H4z" opacity="0" />
			<path d="M22 6l-10 7L2 6" />
			<path d="M2 6h20v12H2z" />
		</svg>
	);
}

export default function ForgotPasswordForm() {
	const { email, mensagem, setEmail, handleSubmit } = useForgotPassword();

	return (
		<section className="auth-card" style={styles.card}>
			<div style={styles.header}>
				<h1 style={styles.title}>Recuperar senha</h1>
				<p style={styles.subtitle}>
					Informe seu e-mail para receber as instruções de recuperação
				</p>
			</div>
			<form onSubmit={handleSubmit} style={styles.form}>
				<div>
					<label htmlFor="email" style={styles.label}>
						E-mail
					</label>
					<Input
						id="email"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="exemplo@techstore.io"
						required
						icon={<EmailIcon />}
						inputStyle={inputStyle}
					/>
				</div>
				{mensagem && (
					<p role="status" aria-live="polite" style={styles.message}>
						{mensagem}
					</p>
				)}
				<Button type="submit" style={styles.submit}>
					Enviar instruções
				</Button>
				<Link to="/login" style={styles.link}>
					Voltar ao Login
				</Link>
			</form>
		</section>
	);
}
