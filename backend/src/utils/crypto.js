// Agrupa operações criptográficas e leitura da chave usada pelos tokens JWT.
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function obterJwtSecret() {
	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET não configurado");
	}

	return process.env.JWT_SECRET;
}

const hashSenha = async (senhaPura) => {
	const saltRounds = 10;
	return await bcrypt.hash(senhaPura, saltRounds);
};

const compararSenha = async (senhaPura, senhaHash) => {
	return await bcrypt.compare(senhaPura, senhaHash);
};

const gerarToken = (payload) => {
	return jwt.sign(payload, obterJwtSecret(), { expiresIn: "1h" });
};

const verificarToken = (token) => {
	return jwt.verify(token, obterJwtSecret());
};

module.exports = {
	hashSenha,
	compararSenha,
	gerarToken,
	verificarToken,
};
