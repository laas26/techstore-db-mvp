// Converte erros de domínio em respostas HTTP consistentes sem expor detalhes internos.
function errorHandler(err, _req, res, _next) {
  if (err.name === 'CredenciaisInvalidasError') {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
  }

  if (
    [
      'DadosProdutoInvalidosError',
      'CarrinhoInvalidoError',
      'PedidoInvalidoError',
      'TransicaoPedidoInvalidaError',
    ].includes(err.name)
  ) {
    return res.status(400).json({ erro: err.message });
  }

  if (['PedidoConflitoError', 'ProdutoEmUsoError'].includes(err.name)) {
    return res.status(409).json({ erro: err.message });
  }

  console.error(err.stack);
  return res.status(500).json({ erro: 'Erro interno no servidor' });
}

module.exports = errorHandler;
