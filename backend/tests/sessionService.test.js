jest.mock('../src/database/connection', () => ({
  prisma: {
    $transaction: jest.fn((callback) =>
      callback({
        sessaoRevogada: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          findFirst: jest.fn().mockResolvedValue(null),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
          create: jest.fn().mockResolvedValue({}),
        },
      }),
    ),
    sessaoRevogada: {
      findFirst: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));

const { prisma } = require('../src/database/connection');
const {
  revogarSessao,
  sessaoFoiRevogada,
} = require('../src/services/sessionService');

beforeEach(() => {
  jest.clearAllMocks();
  prisma.sessaoRevogada.findFirst.mockResolvedValue(null);
});

test('persiste a revogação no banco', async () => {
  const expiraEm = Math.floor(Date.now() / 1000) + 3600;

  await revogarSessao('jti-123', expiraEm);

  expect(prisma.$transaction).toHaveBeenCalled();
});

test('identifica uma revogação ainda válida', async () => {
  prisma.sessaoRevogada.findFirst.mockResolvedValue({
    jti: 'jti-123',
    revokedAt: new Date(),
    expiraEm: new Date(Date.now() + 3600000),
  });

  await expect(sessaoFoiRevogada('jti-123')).resolves.toBe(true);
});

test('remove uma revogação expirada', async () => {
  prisma.sessaoRevogada.findFirst.mockResolvedValue({
    jti: 'jti-123',
    revokedAt: new Date(Date.now() - 7200000),
    expiraEm: new Date(Date.now() - 3600000),
  });

  await expect(sessaoFoiRevogada('jti-123')).resolves.toBe(false);
  expect(prisma.sessaoRevogada.deleteMany).toHaveBeenCalledWith({
    where: { jti: 'jti-123' },
  });
});

test('recusa tokens sem claims de revogação', async () => {
  await expect(revogarSessao(undefined, 123)).rejects.toThrow(
    'Token de sessão sem identificador de revogação',
  );
  await expect(revogarSessao('jti-123')).rejects.toThrow(
    'Token de sessão sem data de expiração',
  );
});
