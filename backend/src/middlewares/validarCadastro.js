// Valida os campos mínimos e a política de senha antes do cadastro.
function validarCadastro(req, res, next) {
	const { nome, email, senha } = req.body;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!nome?.trim() || !email?.trim() || !senha) {
		return res
			.status(400)
			.json({ erro: "Nome, e-mail e senha são obrigatórios" });
	}

	if (!emailRegex.test(email.trim())) {
		return res.status(400).json({ erro: "Formato de e-mail inválido" });
	}

	if (senha.length < 6) {
		return res
			.status(400)
			.json({ erro: "A senha deve ter pelo menos 6 caracteres" });
	}

	next();
}

module.exports = validarCadastro;
