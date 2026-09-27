const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/database/connection');
const { obterJwtSecret } = require('../src/services/authService');

const entrega = {
  nome: 'Cliente Teste',
  endereco: 'Rua Teste',
  numero: '100',
  bairro: 'Centro',
  cidade: 'São Paulo',
  cep: '01001000',
};

let usuario;
let segundoUsuario;
let produto;
let cookie;
let segundoCookie;

function tokenParaUsuario(usuarioId) {
  const token = jwt.sign({ id: usuarioId }, obterJwtSecret(), {
    expiresIn: '1h',
    jwtid: crypto.randomUUID(),
  });
  return `sessionToken=${token}`;
}

async function adicionarItem(quantidade = 1) {
  return request(app)
    .post('/api/cart/items')
    .set('Cookie', cookie)
    .send({ produtoId: String(produto.id), quantidade });
}

async function adicionarItemPara(
  cookieUsuario,
  quantidade = 1,
  produtoId = produto.id,
) {
  return request(app)
    .post('/api/cart/items')
    .set('Cookie', cookieUsuario)
    .send({ produtoId: String(produtoId), quantidade });
}

beforeAll(async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  usuario = await prisma.usuario.create({
    data: {
      nome: 'Cliente Teste',
      email: `cliente-${suffix}@teste.local`,
      senhaHash: await bcrypt.hash('senha123', 10),
      role: 'user',
    },
  });
  segundoUsuario = await prisma.usuario.create({
    data: {
      nome: 'Segundo Cliente',
      email: `segundo-${suffix}@teste.local`,
      senhaHash: await bcrypt.hash('senha123', 10),
      role: 'user',
    },
  });
  produto = await prisma.produto.create({
    data: {
      nome: `Produto Teste ${suffix}`,
      descricao: 'Produto usado nos testes de integração',
      preco: 25,
      stock: 10,
      categoria: 'testes',
    },
  });
  cookie = tokenParaUsuario(usuario.id);
  segundoCookie = tokenParaUsuario(segundoUsuario.id);
});

beforeEach(async () => {
  const usuarios = [usuario.id, segundoUsuario.id];
  await prisma.pedido.deleteMany({ where: { usuario_id: { in: usuarios } } });
  await prisma.carrinho.deleteMany({ where: { usuario_id: { in: usuarios } } });
  await prisma.produto.update({
    where: { id: produto.id },
    data: { stock: 10 },
  });
});

afterAll(async () => {
  if (usuario || segundoUsuario) {
    const usuarios = [usuario?.id, segundoUsuario?.id].filter(Boolean);
    await prisma.pedido.deleteMany({ where: { usuario_id: { in: usuarios } } });
    await prisma.carrinho.deleteMany({
      where: { usuario_id: { in: usuarios } },
    });
  }
  if (produto) {
    await prisma.produto.delete({ where: { id: produto.id } });
  }
  if (usuario) {
    await prisma.usuario.delete({ where: { id: usuario.id } });
  }
  if (segundoUsuario) {
    await prisma.usuario.delete({ where: { id: segundoUsuario.id } });
  }
  await prisma.$disconnect();
});

test('retorna o carrinho atualizado na mesma resposta', async () => {
  const response = await adicionarItem(2);

  expect(response.status).toBe(200);
  expect(response.body.carrinho.itens).toEqual([
    expect.objectContaining({
      produtoId: String(produto.id),
      quantidade: 2,
    }),
  ]);
});

test('persiste entrega, pagamento e evita pedido duplicado', async () => {
  await adicionarItem(2);
  const idempotencyKey = `checkout-${crypto.randomUUID()}`;
  const requestBody = { entrega, pagamento: 'pix-simulado' };

  const first = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .set('Idempotency-Key', idempotencyKey)
    .send(requestBody);
  const second = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .set('Idempotency-Key', idempotencyKey)
    .send(requestBody);

  expect(first.status).toBe(201);
  expect(second.status).toBe(201);
  expect(second.body.pedido.id).toBe(first.body.pedido.id);
  expect(first.body.pedido.entrega).toEqual(entrega);
  expect(first.body.pedido.pagamento).toBe('pix-simulado');
  expect(first.body.pedido.itens[0].nome).toContain('Produto Teste');

  const pedidos = await prisma.pedido.findMany({
    where: { usuario_id: usuario.id },
    include: { itens: true },
  });
  const carrinho = await prisma.carrinho.findMany({
    where: { usuario_id: usuario.id },
  });
  const estoque = await prisma.produto.findUnique({
    where: { id: produto.id },
  });

  expect(pedidos).toHaveLength(1);
  expect(pedidos[0].entrega).toEqual(entrega);
  expect(pedidos[0].itens[0].nomeProduto).toContain('Produto Teste');
  expect(carrinho).toHaveLength(0);
  expect(estoque.stock).toBe(8);
});

test('processa a simulação de pagamento de forma idempotente', async () => {
  await adicionarItem(1);
  const created = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .set('Idempotency-Key', `payment-${crypto.randomUUID()}`)
    .send({ entrega });

  const first = await request(app)
    .post(`/api/orders/${created.body.pedido.id}/simulate-payment`)
    .set('Cookie', cookie);
  const second = await request(app)
    .post(`/api/orders/${created.body.pedido.id}/simulate-payment`)
    .set('Cookie', cookie);

  expect(created.status).toBe(201);
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
  expect(first.body.pedido.status).toBe('pago');
  expect(second.body.pedido.id).toBe(first.body.pedido.id);
});

test('rejeita o reaproveitamento da chave com outro payload', async () => {
  await adicionarItem(1);
  const idempotencyKey = `conflito-${crypto.randomUUID()}`;

  const first = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .set('Idempotency-Key', idempotencyKey)
    .send({ entrega });
  const conflict = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .set('Idempotency-Key', idempotencyKey)
    .send({ entrega: { ...entrega, cidade: 'Rio de Janeiro' } });

  expect(first.status).toBe(201);
  expect(conflict.status).toBe(409);
  expect(conflict.body.erro).toContain('outro pedido');
  const pedidos = await prisma.pedido.findMany({
    where: { usuario_id: usuario.id },
  });
  expect(pedidos).toHaveLength(1);
});

test('impede que duas finalizações concorrentes consumam o mesmo estoque', async () => {
  await adicionarItem(2);

  const responses = await Promise.all([
    request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .set('Idempotency-Key', `concurrent-a-${crypto.randomUUID()}`)
      .send({ entrega }),
    request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .set('Idempotency-Key', `concurrent-b-${crypto.randomUUID()}`)
      .send({ entrega }),
  ]);

  expect(responses.map((response) => response.status).sort()).toEqual([
    201, 400,
  ]);

  const pedidos = await prisma.pedido.findMany({
    where: { usuario_id: usuario.id },
  });
  const estoque = await prisma.produto.findUnique({
    where: { id: produto.id },
  });

  expect(pedidos).toHaveLength(1);
  expect(estoque.stock).toBe(8);
});

test('impede oversell quando usuários diferentes compram em paralelo', async () => {
  await prisma.produto.update({
    where: { id: produto.id },
    data: { stock: 1 },
  });
  await adicionarItemPara(cookie, 1);
  await adicionarItemPara(segundoCookie, 1);

  const responses = await Promise.all([
    request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .set('Idempotency-Key', `oversell-a-${crypto.randomUUID()}`)
      .send({ entrega }),
    request(app)
      .post('/api/orders')
      .set('Cookie', segundoCookie)
      .set('Idempotency-Key', `oversell-b-${crypto.randomUUID()}`)
      .send({ entrega }),
  ]);

  expect(responses.map((response) => response.status).sort()).toEqual([
    201, 400,
  ]);
  const estoque = await prisma.produto.findUnique({
    where: { id: produto.id },
  });
  expect(estoque.stock).toBe(0);
  const pedidos = await prisma.pedido.findMany({
    where: { usuario_id: { in: [usuario.id, segundoUsuario.id] } },
  });
  expect(pedidos).toHaveLength(1);
});

test('reverte a baixa de estoque quando um item do pedido falha', async () => {
  const produtoIndisponivel = await prisma.produto.create({
    data: {
      nome: `Produto Indisponível ${crypto.randomUUID()}`,
      descricao: 'Produto usado para validar rollback',
      preco: 7.5,
      stock: 1,
      categoria: 'testes',
    },
  });

  try {
    await adicionarItemPara(cookie, 1);
    await adicionarItemPara(cookie, 1, produtoIndisponivel.id);
    await prisma.produto.update({
      where: { id: produtoIndisponivel.id },
      data: { stock: 0 },
    });

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .set('Idempotency-Key', `rollback-${crypto.randomUUID()}`)
      .send({ entrega });

    expect(response.status).toBe(400);
    const estoque = await prisma.produto.findUnique({
      where: { id: produto.id },
    });
    const carrinho = await prisma.carrinho.findMany({
      where: { usuario_id: usuario.id },
    });
    const pedidos = await prisma.pedido.findMany({
      where: { usuario_id: usuario.id },
    });

    expect(estoque.stock).toBe(10);
    expect(carrinho).toHaveLength(2);
    expect(pedidos).toHaveLength(0);
  } finally {
    await prisma.pedido.deleteMany({ where: { usuario_id: usuario.id } });
    await prisma.carrinho.deleteMany({ where: { usuario_id: usuario.id } });
    await prisma.produto.delete({ where: { id: produtoIndisponivel.id } });
  }
});

test('exige uma chave de idempotência sem alterar o carrinho', async () => {
  await adicionarItem(1);

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ entrega });

  expect(response.status).toBe(400);
  expect(response.body.erro).toContain('Idempotency-Key');
  const carrinho = await prisma.carrinho.findMany({
    where: { usuario_id: usuario.id },
  });
  const estoque = await prisma.produto.findUnique({
    where: { id: produto.id },
  });
  expect(carrinho).toHaveLength(1);
  expect(estoque.stock).toBe(10);
});

test('mantém o carrinho e o estoque quando a entrega é inválida', async () => {
  await adicionarItem(1);

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ entrega: { cidade: 'São Paulo' } });

  expect(response.status).toBe(400);
  const carrinho = await prisma.carrinho.findMany({
    where: { usuario_id: usuario.id },
  });
  const estoque = await prisma.produto.findUnique({
    where: { id: produto.id },
  });

  expect(carrinho).toHaveLength(1);
  expect(estoque.stock).toBe(10);
});
