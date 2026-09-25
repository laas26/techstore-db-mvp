async function bloquearUsuario(usuarioId, client) {
  const id = Number(usuarioId);
  if (!Number.isInteger(id) || id <= 0) return false;

  const registros = await client.$queryRaw`
    SELECT "id"
    FROM "usuarios"
    WHERE "id" = ${id}
    FOR UPDATE
  `;

  return registros.length === 1;
}

module.exports = { bloquearUsuario };
