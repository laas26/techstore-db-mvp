// Controla a alternância visual entre senha mascarada e texto visível.
const visibilityButtonStyle = {
	position: "absolute",
	right: "10px",
	top: "50%",
	transform: "translateY(-50%)",
	border: "none",
	background: "transparent",
	color: "#9CA3AF",
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "6px",
};

export function PasswordVisibilityButton({ mostrarSenha, onClick }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
			style={visibilityButtonStyle}
		>
			{mostrarSenha ? (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
					focusable="false"
				>
					<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
					<line x1="1" y1="1" x2="23" y2="23" />
				</svg>
			) : (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
					focusable="false"
				>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
			)}
		</button>
	);
}
