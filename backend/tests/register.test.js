const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');

const usuariosPath = path.join(__dirname, '../data/usuarios.json');
const usuariosOriginais = fs.readFileSync(usuariosPath, 'utf8');

afterAll(() => {
  fs.writeFileSync(usuariosPath, usuariosOriginais, 'utf8');
});

describe('POST /api/register', () => {
  test('cadastra usuario, retorna JSON sem a senha e salva o hash', async () => {
    const response = await request(app).post('/api/register').send({
      nome: 'Novo Cliente',
      email: 'novo.cliente@exemplo.com',
      senha: 'senhaSegura123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: {
        id: expect.any(String),
        nome: 'Novo Cliente',
        email: 'novo.cliente@exemplo.com',
      },
    });

    const dados = JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
    const usuario = dados.usuarios.find(
      (item) => item.email === 'novo.cliente@exemplo.com',
    );

    expect(usuario.senhaHash).not.toBe('senhaSegura123');
    await expect(
      bcrypt.compare('senhaSegura123', usuario.senhaHash),
    ).resolves.toBe(true);
  });

  test('retorna 409 quando o e-mail ja esta cadastrado', async () => {
    const response = await request(app).post('/api/register').send({
      nome: 'Outro Cliente',
      email: 'cliente@techstore.local',
      senha: 'senhaSegura123',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ erro: 'E-mail já cadastrado' });
  });

  test('retorna 400 quando os dados sao invalidos', async () => {
    const response = await request(app).post('/api/register').send({
      nome: '',
      email: 'email-invalido',
      senha: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro');
  });
});
