// Layout estrutural para páginas que compartilham cabeçalho e rodapé.
import Footer from "./Footer";
import { Navbar } from "./Navbar";

// Estrutura base para paginas com titulo e conteudo principal.
export default function PageLayout({ title, children }) {
	return (
		<div
			style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
		>
			<Navbar />
			<div
				className="page-layout page-layout-main"
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					gap: "24px",
					alignItems: "center",
					justifyContent: "center",
					padding: "48px 16px",
				}}
			>
				{title && <h1 className="page-title">{title}</h1>}
				{children}
			</div>
			<Footer />
		</div>
	);
}
