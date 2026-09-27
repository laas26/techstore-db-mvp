// Encapsula as chamadas HTTP de login, cadastro e recuperação de senha.
import { apiFetch } from "./api";

// Encapsula as requisicoes de login e encerramento de sessao.
async function login(email, senha) {
	return await apiFetch("/auth/login", {
		method: "POST",
		body: JSON.stringify({ email, senha }),
	});
}

async function logout() {
	return await apiFetch("/auth/logout", {
		method: "POST",
	});
}

async function register(nome, email, senha) {
	return await apiFetch("/register", {
		method: "POST",
		body: JSON.stringify({ nome, email, senha }),
	});
}

export { login, logout, register };
