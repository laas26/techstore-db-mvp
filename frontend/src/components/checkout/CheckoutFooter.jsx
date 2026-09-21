// Rodapé compartilhado pelas telas relacionadas à finalização da compra.
export default function CheckoutFooter() {
	// Reune os links institucionais exibidos ao final do checkout.
	return (
		<footer style={styles.footer}>
			<div style={styles.footerContent}>
				<a href="/about" style={styles.footerLink}>
					Quem Somos
				</a>
				<a href="/privacy" style={styles.footerLink}>
					Política de Privacidade
				</a>
				<a href="/terms" style={styles.footerLink}>
					Termos de Serviço
				</a>
				<a href="/shipping" style={styles.footerLink}>
					Informações de Envio
				</a>
				<a href="/contact" style={styles.footerLink}>
					Contato
				</a>
				<span>
					© 2026 TechStore Premium Electronics. Todos os direitos reservados.
				</span>
			</div>
		</footer>
	);
}

const styles = {
	footer: {
		minHeight: "121px",
		marginTop: "48px",
		background: "#FFFFFF",
		borderTop: "1px solid #DDE2EA",
		display: "flex",
		alignItems: "center",
		padding: "24px 40px",
	},
	footerContent: {
		width: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexWrap: "wrap",
		gap: "18px 27px",
		color: "#5F6878",
		fontSize: "16px",
	},
	footerLink: { color: "inherit", textDecoration: "none" },
};
