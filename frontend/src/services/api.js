// Centraliza chamadas HTTP, cookies de sessão e normalização de erros da API.
const rawBaseUrl = import.meta.env.VITE_API_URL || "/api";

function removerBarrasFinais(url) {
	let urlSemBarras = url;

	while (urlSemBarras.endsWith("/")) {
		urlSemBarras = urlSemBarras.slice(0, -1);
	}

	return urlSemBarras;
}

const baseUrlClean = removerBarrasFinais(rawBaseUrl);

// Impede a duplicação do prefixo '/api'
const API_URL = baseUrlClean.endsWith("/api")
	? baseUrlClean
	: `${baseUrlClean}/api`;

export async function apiFetch(endpoint, options = {}) {
	// Padroniza headers, cookies e tratamento de erros das requisicoes HTTP.
	const config = {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		credentials: "include", // Envia e recebe cookies de sessão (HttpOnly)
	};

	const formattedEndpoint = endpoint.startsWith("/")
		? endpoint
		: `/${endpoint}`;

	const response = await fetch(`${API_URL}${formattedEndpoint}`, config);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));

		// Captura mensagens do Express ou exibe o status HTTP real caso a rota não exista
		const mensagemErro =
			errorData.erro ||
			errorData.message ||
			`Erro na requisição (Status ${response.status})`;

		const error = new Error(mensagemErro);
		error.erro = mensagemErro;
		error.status = response.status;
		throw error;
	}

	if (response.status === 204) {
		return null;
	}

	return response.json();
}
