const request = require('supertest');
const app = require('../src/app');

describe('Rate limiting do login', () => {
  test('deve bloquear tentativas excessivas de login', async () => {
    const respostas = await Promise.all(
      Array.from({ length: 6 }, () =>
        request(app).post('/api/auth/login').send({
          email: 'cliente@exemplo.com',
          senha: 'senhaErrada',
        }),
      ),
    );

    expect(respostas.at(-1).status).toBe(429);
    expect(respostas.at(-1).body).toEqual({
      erro: 'Muitas tentativas de login. Tente novamente mais tarde.',
    });
  });
});
