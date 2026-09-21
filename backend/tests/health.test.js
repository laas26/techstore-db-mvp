const request = require('supertest');
const app = require('../src/app');

describe('Health Check - Testes de Integração', () => {
  test('GET /health deve retornar status 200 e status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
