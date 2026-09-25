// Navegação principal, busca, acesso ao carrinho e menu da sessão atual.
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";
import ProductSearch from "../product/ProductSearch";

// Navegacao principal compartilhada pelas paginas publicas.
export function Navbar() {
	const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
	const [menuMobileAberto, setMenuMobileAberto] = useState(false);
	const { pathname } = useLocation();
	const { usuarioLogado, setUsuarioLogado, eAdmin, eCliente } = useAuth();
	const navigate = useNavigate();
	const isHome = pathname === "/";

	useEffect(() => {
		setMenuMobileAberto(false);
		setMenuPerfilAberto(false);
	}, [pathname]);

	async function handleLogout() {
		try {
			await logout();
		} catch (error) {
			console.error("Erro ao encerrar sessão:", error);
		} finally {
			setUsuarioLogado(null);
			setMenuPerfilAberto(false);
			navigate("/login");
		}
	}

	function abrirMenuPerfil() {
		if (!usuarioLogado) {
			navigate("/login");
			return;
		}

		setMenuPerfilAberto((aberto) => !aberto);
	}

	function fecharMenuMobile() {
		setMenuMobileAberto(false);
	}

	return (
		<header className="site-header" style={styles.header}>
			<div className="site-header-container" style={styles.container}>
				<Link className="site-logo-link" to="/" style={styles.logoLink}>
					<img className="site-logo" src="/logo.svg" alt="TechStore" style={styles.logo} />
				</Link>

				<button
					className="site-menu-toggle"
					type="button"
					aria-controls="site-navigation"
					aria-expanded={menuMobileAberto}
					aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
					onClick={() => setMenuMobileAberto((aberto) => !aberto)}
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						aria-hidden="true"
					>
						<path d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>

				<nav
					id="site-navigation"
					className={`site-navigation${menuMobileAberto ? " is-open" : ""}`}
					style={styles.navigation}
				>
					<Link
						to="/"
						onClick={fecharMenuMobile}
						style={isHome ? styles.activeLink : styles.navLink}
					>
						Loja
					</Link>
					<Link to="/support" onClick={fecharMenuMobile} style={styles.navLink}>
						Suporte
					</Link>
					{eAdmin && (
						<Link
							to="/dashboard"
							onClick={fecharMenuMobile}
							style={styles.adminLink}
						>
							Painel de Gestão
						</Link>
					)}
					{eCliente && (
						<Link
							to="/client"
							onClick={fecharMenuMobile}
							style={styles.adminLink}
						>
							Minha área
						</Link>
					)}
				</nav>

				<ProductSearch className="site-search" />

				<div className="site-actions" style={styles.actions}>
					<Link to="/cart" aria-label="Carrinho" style={styles.iconLink}>
						<svg {...iconProps}>
							<title>Ícone do carrinho</title>
							<path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
							<path d="M7 13L5.4 5M7 13l-2 4h13" />
							<circle cx="9" cy="20" r="1.5" />
							<circle cx="17" cy="20" r="1.5" />
						</svg>
					</Link>

					<div style={styles.profileWrapper}>
						<button
							type="button"
							aria-label="Abrir menu do perfil"
							aria-expanded={menuPerfilAberto}
							onClick={abrirMenuPerfil}
							style={styles.profileButton}
						>
							{usuarioLogado?.nome && (
								<span className="site-user-name" style={styles.userName}>
									Olá, {usuarioLogado.nome}
								</span>
							)}
							<svg {...iconProps}>
								<title>Ícone do perfil</title>
								<circle cx="12" cy="8" r="4" />
								<path d="M20 21a8 8 0 0 0-16 0" />
							</svg>
						</button>

						{usuarioLogado && menuPerfilAberto && (
							<div style={styles.profileMenu}>
								<Link
									to="/profile"
									onClick={() => setMenuPerfilAberto(false)}
									style={styles.profileLink}
								>
									Perfil
								</Link>
								<button
									type="button"
									onClick={handleLogout}
									style={styles.logoutButton}
								>
									Logout
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}

const iconProps = {
	width: "25",
	height: "25",
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "2",
	"aria-hidden": "true",
	focusable: "false",
};

const styles = {
	header: {
		height: "86px",
		background: "#FFFFFF",
		borderBottom: "1px solid #DDE2EA",
		display: "flex",
		alignItems: "center",
	},
	container: {
		width: "100%",
		maxWidth: "1260px",
		margin: "0 auto",
		padding: "0 28px",
		display: "flex",
		alignItems: "center",
		gap: "34px",
	},
	logoLink: {
		display: "inline-flex",
		alignItems: "center",
		width: "195px",
		height: "48px",
		overflow: "hidden",
		flexShrink: 0,
	},
	logo: {
		width: "195px",
		height: "48px",
		objectFit: "contain",
		objectPosition: "left center",
		filter:
			"invert(39%) sepia(88%) saturate(2288%) hue-rotate(211deg) brightness(99%) contrast(93%)",
	},
	navigation: {
		display: "flex",
		alignItems: "center",
		gap: "32px",
		flexShrink: 0,
	},
	navLink: {
		color: "#4B5563",
		borderBottom: "2px solid transparent",
		paddingBottom: "7px",
		fontSize: "16px",
		fontWeight: 500,
		textDecoration: "none",
	},
	activeLink: {
		color: "#2563EB",
		borderBottom: "2px solid #2563EB",
		paddingBottom: "7px",
		fontSize: "16px",
		fontWeight: 500,
		textDecoration: "none",
	},
	adminLink: {
		color: "#64748B",
		fontSize: "14px",
		fontWeight: 500,
		textDecoration: "none",
		whiteSpace: "nowrap",
	},
	actions: {
		display: "flex",
		alignItems: "center",
		gap: "24px",
		marginLeft: "34px",
	},
	iconLink: {
		color: "#64748B",
		display: "inline-flex",
		alignItems: "center",
	},
	profileWrapper: { position: "relative" },
	profileButton: {
		color: "#64748B",
		display: "inline-flex",
		alignItems: "center",
		gap: "10px",
		padding: 0,
		border: "none",
		background: "transparent",
		cursor: "pointer",
		fontFamily: "inherit",
	},
	userName: {
		color: "#4B5563",
		fontSize: "14px",
		fontWeight: 500,
		whiteSpace: "nowrap",
	},
	profileMenu: {
		position: "absolute",
		top: "34px",
		right: 0,
		width: "132px",
		background: "#FFFFFF",
		border: "1px solid #DDE2EA",
		borderRadius: "8px",
		boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
		padding: "8px",
		zIndex: 20,
	},
	profileLink: {
		display: "block",
		padding: "9px 10px",
		color: "#334155",
		fontSize: "14px",
		fontWeight: 500,
		textDecoration: "none",
	},
	logoutButton: {
		width: "100%",
		display: "block",
		padding: "9px 10px",
		color: "#DC2626",
		fontSize: "14px",
		fontWeight: 500,
		fontFamily: "inherit",
		textAlign: "left",
		border: "none",
		background: "transparent",
		cursor: "pointer",
	},
};
