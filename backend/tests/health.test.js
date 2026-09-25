const request = require('supertest');
const app = require('../src/app');

describe('Health Check - Testes de Integração', () => {
  test('GET /health/live deve retornar status 200 e status ok', async () => {
    const response = await request(app).get('/health/live');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('GET /health/ready deve confirmar o PostgreSQL', async () => {
    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ready', database: 'up' });
  });

  test('GET /health deve continuar disponível para compatibilidade', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('CORS não deve refletir origens desconhecidas', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://attacker.example');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
