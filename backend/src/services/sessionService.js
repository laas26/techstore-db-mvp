// Mantém a lista persistida de sessões JWT revogadas até sua expiração.
const fs = require("node:fs");
const path = require("node:path");

const SESSOES_PATH = path.join(__dirname, "../../data/sessoes_revogadas.json");

function lerSessoesRevogadas() {
	try {
		const conteudo = fs.readFileSync(SESSOES_PATH, "utf8");
		const sessoes = JSON.parse(conteudo);
		if (!Array.isArray(sessoes)) {
			return [];
		}

		const sessoesAtivas = sessoes.filter(
			(sessao) => sessao.expiraEm >= Date.now(),
		);

		if (sessoesAtivas.length !== sessoes.length) {
			fs.writeFileSync(
				SESSOES_PATH,
				`${JSON.stringify(sessoesAtivas, null, 2)}\n`,
				"utf8",
			);
		}

		return sessoesAtivas;
	} catch {
		return [];
	}
}

let sessoesRevogadas = lerSessoesRevogadas();

function salvarSessoesRevogadas() {
	fs.writeFileSync(
		SESSOES_PATH,
		JSON.stringify(sessoesRevogadas, null, 2),
		"utf8",
	);
}

function limparSessoesExpiradas() {
	const agora = Date.now();
	const sessoesAtivas = sessoesRevogadas.filter(
		(sessao) => sessao.expiraEm > agora,
	);

	if (sessoesAtivas.length !== sessoesRevogadas.length) {
		sessoesRevogadas = sessoesAtivas;
		salvarSessoesRevogadas();
	}
}

function revogarSessao(jti, expiraEm) {
	if (!jti || !expiraEm) {
		return;
	}

	limparSessoesExpiradas();
	if (!sessoesRevogadas.some((sessao) => sessao.jti === jti)) {
		sessoesRevogadas.push({ jti, expiraEm: expiraEm * 1000 });
		salvarSessoesRevogadas();
	}
}

function sessaoFoiRevogada(jti) {
	limparSessoesExpiradas();
	return Boolean(jti && sessoesRevogadas.some((sessao) => sessao.jti === jti));
}

module.exports = { revogarSessao, sessaoFoiRevogada };
