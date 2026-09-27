const jwt = require('jsonwebtoken');
const { obterJwtSecret } = require('../services/authService');
const { sessaoFoiRevogada } = require('../services/sessionService');

async function authMiddleware(req, res, next) {
  const token = req.cookies?.sessionToken;

  if (!token) {
    return res
      .status(401)
      .json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, obterJwtSecret());
  } catch (error) {
    console.error('Falha na autenticação do token:', error);
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }

  if (!decoded.jti || !decoded.exp) {
    return res.status(403).json({ erro: 'Token sem claims de sessão.' });
  }

  try {
    if (await sessaoFoiRevogada(decoded.jti)) {
      return res.status(401).json({ erro: 'Sessão invalidada.' });
    }
  } catch (error) {
    console.error('Falha ao consultar sessões revogadas:', error);
    return res
      .status(503)
      .json({ erro: 'Serviço de autenticação indisponível.' });
  }

  req.usuarioId = decoded.id;
  return next();
}

module.exports = authMiddleware;
