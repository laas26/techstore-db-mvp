const request = require('supertest');
const app = require('../src/app');

describe('Fluxo de Autenticação (Auth Integration Tests)', () => {
  let cookieHeader = '';

  test('POST /api/auth/login - Deve autenticar com sucesso e retornar o cookie de sessão', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'cliente@techstore.local', // Certifique-se de usar um e-mail válido que exista no seu banco/mock
      senha: 'Cliente@123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('usuario');

    // Captura o cookie gerado (sessionToken) para usar nos testes subsequentes
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    cookieHeader = cookies.find((cookie) => cookie.startsWith('sessionToken='));
  });

  test('POST /api/auth/login - Deve retornar 401 para credenciais inválidas', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'usuario@exemplo.com',
      senha: 'senhaErrada',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro', 'E-mail ou senha inválidos');
  });

  test('POST /api/auth/login - Deve retornar 400 para dados inválidos', async () => {
    const respostaSemSenha = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cliente@techstore.local' });
    const respostaEmailInvalido = await request(app)
      .post('/api/auth/login')
      .send({ email: 'email-invalido', senha: 'Cliente@123' });

    expect(respostaSemSenha.status).toBe(400);
    expect(respostaEmailInvalido.status).toBe(400);
  });

  test('POST /api/auth/logout - Deve encerrar a sessão limpando o cookie', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader); // Envia o cookie ativo obtido no login

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'mensagem',
      'Sessão encerrada com sucesso',
    );

    // Verifica se o cookie foi invalidado/expirado na resposta
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const clearedCookie = setCookieHeader.find((c) =>
        c.includes('sessionToken=;'),
      );
      expect(clearedCookie).toBeDefined();
    }

    const respostaRotaPrivada = await request(app)
      .get('/api/users/perfil')
      .set('Cookie', cookieHeader);

    expect(respostaRotaPrivada.status).toBe(401);

    expect(respostaRotaPrivada.body).toEqual({ erro: 'Sessão invalidada.' });
  });

  test('POST /api/auth/logout - Deve retornar 401 sem sessão', async () => {
    const response = await request(app).post('/api/auth/logout');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      'erro',
      'Nenhuma sessão ativa encontrada',
    );
  });
});
