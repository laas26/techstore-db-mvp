const { prisma } = require('../database/connection');

const DEFAULT_SESSION_TTL_MS = 60 * 60 * 1000;

function toExpiration(expiraEm) {
  const timestamp =
    expiraEm instanceof Date ? expiraEm.getTime() : Number(expiraEm) * 1000;

  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

async function revogarSessao(jti, expiraEm) {
  if (!jti) {
    throw new Error('Token de sessão sem identificador de revogação');
  }

  const expiration = toExpiration(expiraEm);
  if (!expiration) {
    throw new Error('Token de sessão sem data de expiração');
  }

  await prisma.$transaction(async (tx) => {
    await tx.sessaoRevogada.deleteMany({
      where: { expiraEm: { lt: new Date() } },
    });

    const existing = await tx.sessaoRevogada.findFirst({
      where: { jti },
    });

    if (existing) {
      await tx.sessaoRevogada.updateMany({
        where: { jti },
        data: { expiraEm: expiration },
      });
      return;
    }

    await tx.sessaoRevogada.create({ data: { jti, expiraEm: expiration } });
  });
}

async function sessaoFoiRevogada(jti) {
  if (!jti) return false;

  const revogada = await prisma.sessaoRevogada.findFirst({
    where: { jti },
  });

  if (!revogada) return false;

  const revokedAt = revogada.revokedAt
    ? new Date(revogada.revokedAt).getTime()
    : Date.now();
  const expiration =
    revogada.expiraEm || new Date(revokedAt + DEFAULT_SESSION_TTL_MS);

  if (expiration <= new Date()) {
    await prisma.sessaoRevogada.deleteMany({ where: { jti } });
    return false;
  }

  return true;
}

module.exports = { revogarSessao, sessaoFoiRevogada };
