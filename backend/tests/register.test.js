const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/database/connection');

let emailExistente;
let emailCadastrado;

beforeAll(async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  emailExistente = `existente-${suffix}@teste.local`;
  emailCadastrado = `cadastrado-${suffix}@teste.local`;

  await prisma.usuario.create({
    data: {
      nome: 'Usuário Existente',
      email: emailExistente,
      senhaHash: await bcrypt.hash('senha123', 10),
      role: 'user',
    },
  });
});

afterAll(async () => {
  if (emailCadastrado) {
    await prisma.usuario.deleteMany({ where: { email: emailCadastrado } });
  }
  if (emailExistente) {
    await prisma.usuario.deleteMany({ where: { email: emailExistente } });
  }
  await prisma.$disconnect();
});

describe('POST /api/register', () => {
  test('cadastra usuário, retorna JSON sem a senha e salva o hash', async () => {
    const response = await request(app).post('/api/register').send({
      nome: 'Novo Cliente',
      email: emailCadastrado,
      senha: 'senhaSegura123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: {
        id: expect.any(String),
        nome: 'Novo Cliente',
        email: emailCadastrado,
      },
    });

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailCadastrado },
    });

    expect(usuario.senhaHash).not.toBe('senhaSegura123');
    await expect(
      bcrypt.compare('senhaSegura123', usuario.senhaHash),
    ).resolves.toBe(true);
  });

  test('retorna 409 quando o e-mail já está cadastrado', async () => {
    const response = await request(app).post('/api/register').send({
      nome: 'Outro Cliente',
      email: emailExistente,
      senha: 'senhaSegura123',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ erro: 'E-mail já cadastrado' });
  });

  test('retorna 400 quando os dados são inválidos', async () => {
    const response = await request(app).post('/api/register').send({
      nome: '',
      email: 'email-invalido',
      senha: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro');
  });
});
