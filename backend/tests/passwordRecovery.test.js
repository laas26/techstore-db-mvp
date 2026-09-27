const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/database/connection');

const SENHA_INICIAL = 'SenhaInicial@123';
const SENHA_NOVA = 'SenhaNova@123';
const MENSAGEM_GENERICA =
	'Se o e-mail informado estiver cadastrado em nosso sistema, você receberá as instruções de recuperação em instantes.';

let emailRecuperacao;
let consoleLogSpy;

function hashearToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

function extrairTokenDosLogs() {
	const logs = consoleLogSpy.mock.calls
		.map((argumentos) => argumentos.join(' '))
		.join('\n');
	const correspondencia = logs.match(/token=([a-f0-9]{64})/);
	return correspondencia?.[1];
}

beforeAll(async () => {
	const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	emailRecuperacao = `recuperacao-${suffix}@teste.local`;

	await prisma.usuario.create({
		data: {
			nome: 'Usuário de Recuperação',
			email: emailRecuperacao,
			senhaHash: await bcrypt.hash(SENHA_INICIAL, 10),
			role: 'user',
		},
	});

	consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
	consoleLogSpy?.mockClear();
});

afterAll(async () => {
	if (emailRecuperacao) {
		await prisma.usuario.deleteMany({ where: { email: emailRecuperacao } });
	}
	consoleLogSpy?.mockRestore();
	await prisma.$disconnect();
});

describe('Recuperação de senha', () => {
	test('gera token, redefine a senha e permite novo login', async () => {
		const solicitacao = await request(app)
			.post('/api/auth/forgot-password')
			.send({ email: emailRecuperacao });

		expect(solicitacao.status).toBe(200);
		expect(solicitacao.body).toEqual({ mensagem: MENSAGEM_GENERICA });

		const token = extrairTokenDosLogs();
		expect(token).toMatch(/^[a-f0-9]{64}$/);

		const usuarioComToken = await prisma.usuario.findUnique({
			where: { email: emailRecuperacao },
		});
		expect(usuarioComToken.tokenRedefinicaoHash).toBe(hashearToken(token));
		expect(Number(usuarioComToken.tokenRedefinicaoExpiraEm)).toBeGreaterThan(
			Date.now(),
		);

		const redefinicao = await request(app).post('/api/auth/reset-password').send({
			token,
			novaSenha: SENHA_NOVA,
		});

		expect(redefinicao.status).toBe(200);
		expect(redefinicao.body).toEqual({
			mensagem: 'Senha redefinida com sucesso',
		});

		const usuarioAtualizado = await prisma.usuario.findUnique({
			where: { email: emailRecuperacao },
		});
		expect(usuarioAtualizado.tokenRedefinicaoHash).toBeNull();
		expect(usuarioAtualizado.tokenRedefinicaoExpiraEm).toBeNull();
		await expect(
			bcrypt.compare(SENHA_NOVA, usuarioAtualizado.senhaHash),
		).resolves.toBe(true);

		const login = await request(app).post('/api/auth/login').send({
			email: emailRecuperacao,
			senha: SENHA_NOVA,
		});

		expect(login.status).toBe(200);
		expect(login.body.usuario.email).toBe(emailRecuperacao);
	});

	test('não revela se um e-mail está cadastrado', async () => {
		const resposta = await request(app).post('/api/auth/forgot-password').send({
			email: 'nao-cadastrado@teste.local',
		});

		expect(resposta.status).toBe(200);
		expect(resposta.body).toEqual({ mensagem: MENSAGEM_GENERICA });
	});

	test('recusa token inválido', async () => {
		const resposta = await request(app).post('/api/auth/reset-password').send({
			token: 'token-invalido',
			novaSenha: SENHA_NOVA,
		});

		expect(resposta.status).toBe(400);
		expect(resposta.body).toEqual({ erro: 'Token inválido ou expirado' });
	});
});
