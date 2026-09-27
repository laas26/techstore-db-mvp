// Rodapé institucional compartilhado pela vitrine pública.
export default function Footer() {
	return (
		<footer
			className="site-footer"
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
				<a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
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
				<a href="/contact" style={{ color: "inherit", textDecoration: "none" }}>
					Contato
				</a>
				<span>
					© 2026 TechStore Premium Electronics. Todos os direitos reservados.
				</span>
			</div>
		</footer>
	);
}
