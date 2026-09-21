// Converte erros de domínio em respostas HTTP consistentes sem expor detalhes internos.
function errorHandler(err, _req, res, _next) {
	console.error(err.stack);

	if (err.name === "CredenciaisInvalidasError") {
		return res.status(401).json({ erro: "E-mail ou senha inválidos" });
	}

	if (
		[
			"DadosProdutoInvalidosError",
			"CarrinhoInvalidoError",
			"PedidoInvalidoError",
		].includes(err.name)
	) {
		return res.status(400).json({ erro: err.message });
	}

	return res.status(500).json({ erro: "Erro interno no servidor" });
}

module.exports = errorHandler;
