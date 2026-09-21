// Traduz requisições HTTP de autenticação em chamadas aos serviços de identidade.
const authService = require("../services/authService");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const { revogarSessao } = require("../services/sessionService");

async function login(req, res, next) {
	try {
		const email = req.body.email?.trim();
		const senha = req.body.senha || req.body.password;

		const { token, usuario } = await authService.autenticar(email, senha);

		res.cookie("sessionToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 1000, // 1 hora
		});

		return res.status(200).json({ usuario });
	} catch (err) {
		if (err instanceof authService.CredenciaisInvalidasError) {
			return res.status(401).json({ erro: "E-mail ou senha inválidos" });
		}
		next(err);
	}
}

async function register(req, res, next) {
	try {
		const nome = req.body.nome.trim();
		const email = req.body.email.trim();
		const usuario = await authService.cadastrar(nome, email, req.body.senha);

		return res.status(201).json({
			mensagem: "Usuário cadastrado com sucesso",
			usuario: {
				id: usuario.id,
				nome: usuario.nome,
				email: usuario.email,
			},
		});
	} catch (err) {
		if (err instanceof userRepository.EmailJaCadastradoError) {
			return res.status(409).json({ erro: "E-mail já cadastrado" });
		}

		return next(err);
	}
}

async function forgotPassword(req, res, next) {
	try {
		const email = req.body.email?.trim();

		await authService.gerarTokenRecuperacao(email);

		return res.status(200).json({
			mensagem:
				"Se o e-mail informado estiver cadastrado em nosso sistema, você receberá as instruções de recuperação em instantes.",
		});
	} catch (err) {
		return next(err);
	}
}

async function resetPassword(req, res, next) {
	try {
		const { token, novaSenha } = req.body;
		await authService.redefinirSenha(token, novaSenha);

		return res.status(200).json({ mensagem: "Senha redefinida com sucesso" });
	} catch (err) {
		if (err instanceof authService.TokenRedefinicaoInvalidoError) {
			return res.status(400).json({ erro: "Token inválido ou expirado" });
		}
		return next(err);
	}
}

function logout(req, res) {
	const token = req.cookies?.sessionToken;

	if (!token) {
		return res.status(401).json({ erro: "Nenhuma sessão ativa encontrada" });
	}

	let sessao;

	try {
		sessao = jwt.verify(token, authService.obterJwtSecret());
	} catch {
		return res.status(401).json({ erro: "Sessão inválida ou expirada" });
	}

	revogarSessao(sessao.jti, sessao.exp);

	res.clearCookie("sessionToken", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	return res.status(200).json({ mensagem: "Sessão encerrada com sucesso" });
}

module.exports = { login, logout, register, forgotPassword, resetPassword };
