const request = require('supertest');
const app = require('../src/app'); // Ajuste o caminho se necessário para o seu arquivo principal do app

describe('Testes de Integração - Rotas Protegidas e AuthMiddleware', () => {
  let cookieHeader;

  // Antes dos testes de usuário, fazemos login para capturar o cookie de sessão válido
  beforeAll(async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'cliente@techstore.local', // Substitua pelo e-mail de um usuário válido no seu usuarios.json
      senha: 'Cliente@123', // Substitua pela senha correspondente
    });

    const cookies = response.headers['set-cookie'];
    if (cookies) {
      cookieHeader = cookies.find((cookie) =>
        cookie.startsWith('sessionToken='),
      );
    }
  });

  test('GET /api/users/perfil - Deve bloquear o acesso (401) se o cookie não for enviado', async () => {
    const response = await request(app).get('/api/users/perfil');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro');
  });

  test('GET /api/users/perfil - Deve permitir o acesso com sucesso (200) usando o cookie de sessão', async () => {
    const response = await request(app)
      .get('/api/users/perfil')
      .set('Cookie', cookieHeader);

    expect(response.status).toBe(200);
  });
});
