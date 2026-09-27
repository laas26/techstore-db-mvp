// Centraliza a leitura da role do usuário logado.
//
// O backend devolve `{ id, nome, email, role }` com role "admin" ou "user",
// mas o objeto pode chegar aninhado (usuario/user) conforme o ponto de uso.
// Todo perfil autenticado que não é admin é tratado como cliente.
export function getRole(usuario) {
	const bruta =
		usuario?.role ??
		usuario?.usuario?.role ??
		usuario?.user?.role ??
		usuario?.permissao ??
		"";
	return String(bruta).trim().toLowerCase();
}

export function isAdmin(usuario) {
	if (!usuario) {
		return false;
	}
	return getRole(usuario) === "admin" || usuario?.isAdmin === true;
}

export function isClient(usuario) {
	return Boolean(usuario) && !isAdmin(usuario);
}
