// Protege rotas administrativas verificando autenticação e role do usuário.
// Admin entra; cliente autenticado vai para "/client" (nunca vê a gestão);
// deslogado vai para "/login".
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute() {
	const { usuarioLogado, carregando, eAdmin } = useAuth();
	const location = useLocation();

	if (carregando) {
		return null;
	}

	if (!usuarioLogado) {
		return <Navigate replace state={{ from: location.pathname }} to="/login" />;
	}

	return eAdmin ? <Outlet /> : <Navigate replace to="/client" />;
}
