// Valida formato e presença das credenciais antes de autenticar o usuário.
function validarLogin(req, res, next) {
	const { email, senha } = req.body;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!email || !senha) {
		return res.status(400).json({ erro: "E-mail e senha são obrigatórios" });
	}
	if (!emailRegex.test(email)) {
		return res.status(400).json({ erro: "Formato de e-mail inválido" });
	}

	next();
}

module.exports = validarLogin;
