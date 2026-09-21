// Protege a área do cliente: exige login e impede que o admin caia aqui.
// Admin vai para "/dashboard"; deslogado vai para "/login".
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ClientRoute() {
	const { usuarioLogado, carregando, eAdmin } = useAuth();
	const location = useLocation();

	if (carregando) {
		return null;
	}

	if (!usuarioLogado) {
		return <Navigate replace state={{ from: location.pathname }} to="/login" />;
	}

	if (eAdmin) {
		return <Navigate replace to="/dashboard" />;
	}

	return <Outlet />;
}
