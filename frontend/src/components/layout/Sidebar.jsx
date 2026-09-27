// Menu lateral das áreas administrativas e operações protegidas.
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";

const navigationItems = [
	["Dashboard", "/dashboard", "ph-squares-four"],
	["Estoque", "/products", "ph-package"],
	["Pedidos", "/orders", "ph-receipt"],
	["Clientes", "/users", "ph-users"],
	["Pix", "/pix", "ph-currency-dollar"],
];

export function Sidebar() {
	const { setUsuarioLogado } = useAuth();
	const navigate = useNavigate();

	async function handleLogout() {
		try {
			await logout();
		} catch (error) {
			console.error("Erro ao encerrar sessão:", error);
		} finally {
			setUsuarioLogado(null);
			navigate("/login", { replace: true });
		}
	}

	return (
		<aside className="dash-sidebar">
			<div>
				<Link className="dash-logo" to="/">
					TechStore
				</Link>
				<nav className="dash-nav" aria-label="Navegação administrativa">
					<span className="dash-nav-title">Gestão TechStore</span>
					{navigationItems.map(([label, to, icon]) => (
						<NavLink
							className={({ isActive }) =>
								`dash-nav-link${isActive ? " active" : ""}`
							}
							key={to}
							to={to}
						>
							<i className={`ph ${icon} text-lg`} aria-hidden="true"></i>
							{label}
						</NavLink>
					))}
				</nav>
			</div>
			<div className="dash-sidebar-footer">
				<NavLink className="dash-nav-link" to="/profile">
					<i className="ph ph-gear text-lg" aria-hidden="true"></i>
					Configurações
				</NavLink>
				<button
					className="dash-nav-link danger"
					onClick={handleLogout}
					type="button"
				>
					<i className="ph ph-sign-out text-lg" aria-hidden="true"></i>
					Sair
				</button>
			</div>
		</aside>
	);
}
