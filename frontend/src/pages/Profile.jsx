// Página de perfil com layout conforme o perfil: admin mantém o
// placeholder administrativo (com Sidebar); cliente vê um cartão neutro
// sem o painel de gestão.
import { useAuth } from "../context/AuthContext";
import { AdminPlaceholder } from "./AdminPlaceholder";

export default function Profile() {
	const { eAdmin } = useAuth();

	if (eAdmin) {
		return (
			<AdminPlaceholder
				description="Gerencie as configurações da sua conta."
				title="Configurações"
			/>
		);
	}

	return (
		<section
			style={{
				maxWidth: "640px",
				margin: "0 auto",
				padding: "32px 24px",
				background: "#FFFFFF",
				border: "1px solid #DDE2EA",
				borderRadius: "12px",
			}}
		>
			<h1 style={{ margin: "0 0 8px", fontSize: "22px" }}>Configurações</h1>
			<p style={{ margin: 0, color: "#5F6878" }}>
				Gerencie as configurações da sua conta. Novas opções do cliente
				aparecerão aqui em breve.
			</p>
		</section>
	);
}
