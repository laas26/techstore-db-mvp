const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');
const { obterJwtSecret } = require('../src/services/authService');

const dataPaths = {
  carts: path.join(__dirname, '../data/carrinhos.json'),
  orders: path.join(__dirname, '../data/pedidos.json'),
  products: path.join(__dirname, '../data/produtos.json'),
};
const originalData = Object.fromEntries(
  Object.entries(dataPaths).map(([key, filePath]) => [
    key,
    fs.readFileSync(filePath, 'utf8'),
  ]),
);

const entrega = {
  nome: 'Cliente Dev',
  endereco: 'Rua Teste',
  numero: '100',
  bairro: 'Centro',
  cidade: 'São Paulo',
  cep: '01001000',
};

function cookieDoUsuario(usuarioId) {
  const token = jwt.sign({ id: usuarioId }, obterJwtSecret(), {
    expiresIn: '1h',
    jwtid: crypto.randomUUID(),
  });
  return `sessionToken=${token}`;
}

function restoreData() {
  for (const [key, filePath] of Object.entries(dataPaths)) {
    fs.writeFileSync(filePath, originalData[key], 'utf8');
  }
}

afterEach(() => {
  restoreData();
});

describe('Carrinho e finalização de pedidos', () => {
  test('isola o carrinho entre usuários autenticados', async () => {
    const clienteCookie = cookieDoUsuario('1');
    const adminCookie = cookieDoUsuario('2');

    const adicionar = await request(app)
      .post('/api/cart/items')
      .set('Cookie', clienteCookie)
      .send({ produtoId: '1', quantidade: 2 });
    expect(adicionar.status).toBe(200);

    const carrinhoCliente = await request(app)
      .get('/api/cart')
      .set('Cookie', clienteCookie);
    const carrinhoAdmin = await request(app)
      .get('/api/cart')
      .set('Cookie', adminCookie);

    expect(carrinhoCliente.body.carrinho.itens).toHaveLength(1);
    expect(carrinhoAdmin.body.carrinho.itens).toHaveLength(0);
  });

  test('ignora status pago enviado pelo cliente e cria pedido pendente', async () => {
    const cookie = cookieDoUsuario('1');
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ produtoId: '1', quantidade: 1 });

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ status: 'pago', entrega });

    expect(response.status).toBe(201);
    expect(response.body.pedido.status).toBe('pendente');
  });

  test('permite simular pagamento somente pela rota isolada de desenvolvimento', async () => {
    const cookie = cookieDoUsuario('1');
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ produtoId: '1', quantidade: 1 });

    const criado = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ status: 'pago', entrega });
    const simulado = await request(app)
      .post(`/api/orders/${criado.body.pedido.id}/simulate-payment`)
      .set('Cookie', cookie);

    expect(simulado.status).toBe(200);
    expect(simulado.body.pedido.status).toBe('pago');
  });

  test('bloqueia quantidade acima do estoque', async () => {
    const cookie = cookieDoUsuario('1');
    const response = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ produtoId: '1', quantidade: 25 });

    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/estoque/i);
  });

  test('rejeita entrega inválida e carrinho corrompido antes da baixa', async () => {
    const cookie = cookieDoUsuario('1');
    fs.writeFileSync(
      dataPaths.carts,
      JSON.stringify([
        { usuarioId: '1', itens: [{ produtoId: '1', quantidade: -2 }] },
      ]),
      'utf8',
    );

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ entrega: { cidade: 'São Paulo' } });

    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/entrega|carrinho|quantidade/i);
    const produtos = JSON.parse(fs.readFileSync(dataPaths.products, 'utf8'));
    expect(produtos.find((produto) => produto.id === '1').stock).toBe(24);
  });

  test('serializa duas finalizações concorrentes do mesmo carrinho', async () => {
    const cookie = cookieDoUsuario('1');
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ produtoId: '1', quantidade: 2 });

    const respostas = await Promise.all([
      request(app).post('/api/orders').set('Cookie', cookie).send({ entrega }),
      request(app).post('/api/orders').set('Cookie', cookie).send({ entrega }),
    ]);

    expect(respostas.map((response) => response.status).sort()).toEqual([
      201, 400,
    ]);
    const produtos = JSON.parse(fs.readFileSync(dataPaths.products, 'utf8'));
    expect(produtos.find((produto) => produto.id === '1').stock).toBe(22);
  });
});
