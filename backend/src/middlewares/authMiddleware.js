// Valida o JWT recebido no cookie HttpOnly e anexa o usuário à requisição.
const jwt = require("jsonwebtoken");
const { obterJwtSecret } = require("../services/authService");
const { sessaoFoiRevogada } = require("../services/sessionService");

function authMiddleware(req, res, next) {
	// Pega o token do cookie (graças ao cookie-parser)
	const token = req.cookies.sessionToken;

	if (!token) {
		return res
			.status(401)
			.json({ erro: "Acesso negado. Token não fornecido." });
	}

	try {
		const secret = obterJwtSecret();
		const decoded = jwt.verify(token, secret);

		if (sessaoFoiRevogada(decoded.jti)) {
			return res.status(401).json({ erro: "Sessão invalidada." });
		}

		// Anexa os dados do usuário decodificados à requisição para uso posterior nas rotas
		req.usuarioId = decoded.id;

		next();
	} catch (error) {
		console.error("Falha na autenticação do token:", error);
		return res.status(403).json({ erro: "Token inválido ou expirado." });
	}
}

module.exports = authMiddleware;
