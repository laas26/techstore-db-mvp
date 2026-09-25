jest.mock('../src/database/connection', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
    },
    produto: {
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

const { prisma } = require('../src/database/connection');
const {
  executarSeeds,
  usuariosIniciais,
  produtosIniciais,
} = require('../scripts/seed');

beforeEach(() => {
  jest.clearAllMocks();
  prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
  prisma.produto.findFirst.mockResolvedValue({ id: 1 });
});

test('não sobrescreve registros existentes', async () => {
  await executarSeeds();

  expect(prisma.usuario.findUnique).toHaveBeenCalledTimes(
    usuariosIniciais.length,
  );
  expect(prisma.produto.findFirst).toHaveBeenCalledTimes(
    produtosIniciais.length,
  );
  expect(prisma.usuario.create).not.toHaveBeenCalled();
  expect(prisma.produto.create).not.toHaveBeenCalled();
});

test('cria apenas registros ausentes', async () => {
  prisma.usuario.findUnique
    .mockResolvedValueOnce(null)
    .mockResolvedValue({ id: 2 });
  prisma.produto.findFirst
    .mockResolvedValueOnce(null)
    .mockResolvedValue({ id: 2 });

  await executarSeeds();

  expect(prisma.usuario.create).toHaveBeenCalledTimes(1);
  expect(prisma.produto.create).toHaveBeenCalledTimes(1);
});
