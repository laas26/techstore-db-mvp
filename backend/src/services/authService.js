// Implementa autenticação, criação de usuários e recuperação segura de senha.
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

function obterJwtSecret() {
	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET não configurado");
	}

	return process.env.JWT_SECRET;
}

class CredenciaisInvalidasError extends Error {}

async function autenticar(email, senha) {
	const usuario = await userRepository.buscarPorEmail(email);
	if (!usuario) {
		throw new CredenciaisInvalidasError();
	}

	const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
	if (!senhaValida) {
		throw new CredenciaisInvalidasError();
	}

	const secret = obterJwtSecret();
	const token = jwt.sign({ id: usuario.id }, secret, {
		expiresIn: "1h",
		jwtid: crypto.randomUUID(),
	});

	return {
		token,
		usuario: {
			id: usuario.id,
			nome: usuario.nome,
			email: usuario.email,
			role: usuario.role || "user",
		},
	};
}

async function cadastrar(nome, email, senha) {
	const senhaHash = await bcrypt.hash(senha, 10);

	return userRepository.criarUsuario({ nome, email, senhaHash, role: "user" });
}

async function gerarTokenRecuperacao(email) {
	if (!email) {
		console.log("⚠️ E-mail vazio fornecido para recuperação.");
		return null;
	}

	const token = crypto.randomBytes(32).toString("hex");
	const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
	const expiraEm = Date.now() + 60 * 60 * 1000;

	const criado = await userRepository.criarTokenRedefinicao(
		email,
		tokenHash,
		expiraEm,
	);

	if (!criado) {
		console.log(
			`❌ Falha ao gerar token: O e-mail "${email}" não foi encontrado na base de dados.`,
		);
		return null;
	}

	console.log(`✅ Token gerado com sucesso para o e-mail: ${email}`);
	const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
	console.log(
		`🔗 Link de redefinição: ${frontendUrl}/reset-password?token=${token}`,
	);

	return { token, expiraEm };
}

class TokenRedefinicaoInvalidoError extends Error {}

async function redefinirSenha(token, novaSenha) {
	if (!token || !novaSenha) {
		throw new TokenRedefinicaoInvalidoError();
	}

	const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
	const senhaHash = await bcrypt.hash(novaSenha, 10);
	const atualizada = await userRepository.atualizarSenhaPorToken(
		tokenHash,
		senhaHash,
	);

	if (!atualizada) {
		throw new TokenRedefinicaoInvalidoError();
	}
}

module.exports = {
	autenticar,
	cadastrar,
	CredenciaisInvalidasError,
	obterJwtSecret,
	gerarTokenRecuperacao,
	redefinirSenha,
	TokenRedefinicaoInvalidoError,
};
