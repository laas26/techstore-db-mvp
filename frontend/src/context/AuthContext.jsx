// Mantém o usuário autenticado e sincroniza o estado com a sessão do navegador.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getRole, isAdmin, isClient } from "../utils/role";

// Compartilha o usuario autenticado e sincroniza sua sessao com o armazenamento local.
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [usuarioLogado, setUsuarioLogado] = useState(null);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		const usuarioSalvo =
			localStorage.getItem("techstore-user") ||
			sessionStorage.getItem("techstore-user");

		if (usuarioSalvo) {
			try {
				setUsuarioLogado(JSON.parse(usuarioSalvo));
			} catch {
				localStorage.removeItem("techstore-user");
				sessionStorage.removeItem("techstore-user");
			}
		}

		setCarregando(false);
	}, []);

	useEffect(() => {
		if (carregando) {
			return;
		}

		if (usuarioLogado) {
			const lembrar = localStorage.getItem("techstore-remember") === "true";
			const armazenamento = lembrar ? localStorage : sessionStorage;
			const outroArmazenamento = lembrar ? sessionStorage : localStorage;

			armazenamento.setItem("techstore-user", JSON.stringify(usuarioLogado));
			outroArmazenamento.removeItem("techstore-user");
			return;
		}

		localStorage.removeItem("techstore-user");
		sessionStorage.removeItem("techstore-user");
	}, [carregando, usuarioLogado]);

	const role = getRole(usuarioLogado);
	const eAdmin = isAdmin(usuarioLogado);
	const eCliente = isClient(usuarioLogado);

	const valorDoContexto = useMemo(
		() => ({ usuarioLogado, setUsuarioLogado, carregando, eAdmin, eCliente, role }),
		[carregando, eAdmin, eCliente, role, usuarioLogado],
	);

	return (
		<AuthContext.Provider value={valorDoContexto}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
