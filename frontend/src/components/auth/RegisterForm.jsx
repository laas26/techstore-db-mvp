// Coleta e valida os dados necessários para criar uma conta de cliente.
import { Link } from "react-router-dom";
import { useRegister } from "../../hooks/useRegister";
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

const formStyles = {
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
	subtitle: {
		margin: 0,
		fontSize: "16px",
		lineHeight: 1.5,
		color: "#6B7280",
	},
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
	success: { color: "#16A34A", fontSize: "14px", margin: 0 },
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
	loginText: {
		textAlign: "center",
		fontSize: "14px",
		color: "#6B7280",
		margin: "2px 0 0",
	},
	link: { color: "#2563EB", textDecoration: "none", fontWeight: 500 },
};

function _Icon({ children }) {
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
	const cor = forte ? "#16A34A" : media ? "#D97706" : "#DC2626";
	const nivel = forte ? "Forte" : media ? "Média" : "Fraca";
	const largura = forte ? "100%" : media ? "66%" : "33%";

	return (
		<div style={formStyles.strength} aria-live="polite">
			<span style={{ color: cor }}>{nivel}</span>
			<div style={formStyles.strengthTrack}>
				<div
					style={{
						height: "100%",
						width: largura,
						background: cor,
						transition: "width 160ms ease, background-color 160ms ease",
					}}
				/>
			</div>
		</div>
	);
}

function RegisterInput({
	id,
	label,
	type,
	value,
	onChange,
	placeholder,
	icon,
	rightContent,
}) {
	return (
		<div>
			<label htmlFor={id} style={formStyles.label}>
				{label}
			</label>
			<Input
				id={id}
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required
				icon={icon}
				rightContent={rightContent}
				inputStyle={{
					...inputStyle,
					paddingRight: rightContent ? "48px" : "16px",
				}}
			/>
		</div>
	);
}

export default function RegisterForm() {
	const registerState = useRegister();
	const {
		formData,
		erro,
		sucesso,
		carregando,
		mostrarSenha,
		handleChange,
		handleSubmit,
		onToggleMostrarSenha,
	} = registerState;

	const passwordVisibilityButton = (
		<PasswordVisibilityButton
			mostrarSenha={mostrarSenha}
			onClick={onToggleMostrarSenha}
		/>
	);

	return (
		<section className="auth-card" style={formStyles.card}>
			<div style={formStyles.header}>
				<h1 style={formStyles.title}>Criar conta</h1>
				<p style={formStyles.subtitle}>Preencha seus dados para começar</p>
			</div>

			<form onSubmit={handleSubmit} style={formStyles.form}>
				<RegisterInput
					id="nome"
					label="Nome"
					type="text"
					value={formData.nome}
					onChange={handleChange}
					placeholder="Seu nome completo"
					icon={
						<>
							<path d="M20 21a8 8 0 0 0-16 0" />
							<circle cx="12" cy="7" r="4" />
						</>
					}
				/>
				<RegisterInput
					id="email"
					label="E-mail"
					type="email"
					value={formData.email}
					onChange={handleChange}
					placeholder="exemplo@techstore.io"
					icon={
						<>
							<path d="M4 4h16v16H4z" opacity="0" />
							<path d="M22 6l-10 7L2 6" />
							<path d="M2 6h20v12H2z" />
						</>
					}
				/>
				<RegisterInput
					id="senha"
					label="Senha"
					type={mostrarSenha ? "text" : "password"}
					value={formData.senha}
					onChange={handleChange}
					placeholder="••••••••••••"
					rightContent={passwordVisibilityButton}
					icon={
						<>
							<rect x="5" y="11" width="14" height="10" rx="2" />
							<path d="M8 11V7a4 4 0 0 1 8 0v4" />
						</>
					}
				/>
				{formData.senha && <PasswordStrength senha={formData.senha} />}
				<RegisterInput
					id="confirmarSenha"
					label="Confirmar senha"
					type={mostrarSenha ? "text" : "password"}
					value={formData.confirmarSenha}
					onChange={handleChange}
					placeholder="••••••••••••"
					rightContent={passwordVisibilityButton}
					icon={
						<>
							<rect x="5" y="11" width="14" height="10" rx="2" />
							<path d="M8 11V7a4 4 0 0 1 8 0v4" />
							<path d="M9 16l2 2 4-4" />
						</>
					}
				/>
				{formData.confirmarSenha &&
					formData.senha !== formData.confirmarSenha && (
						<p role="alert" style={formStyles.error}>
							As senhas não coincidem.
						</p>
					)}
				{erro && (
					<p role="alert" aria-live="polite" style={formStyles.error}>
						{erro}
					</p>
				)}
				{sucesso && (
					<p role="status" aria-live="polite" style={formStyles.success}>
						Cadastro realizado com sucesso! Redirecionando...
					</p>
				)}
				<Button type="submit" disabled={carregando} style={formStyles.submit}>
					{carregando ? "Cadastrando..." : "Cadastrar"}
				</Button>
				<div style={formStyles.loginText}>
					Já tem uma conta?{" "}
					<Link to="/login" style={formStyles.link}>
						Entrar
					</Link>
				</div>
			</form>
		</section>
	);
}
