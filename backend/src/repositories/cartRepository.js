const { prisma } = require('../database/connection');

function mapearItem(registro) {
  return {
    produtoId: String(registro.produto_id),
    quantidade: registro.quantidade,
    nome: registro.produto.nome,
    descricao: registro.produto.descricao,
    preco: Number(registro.produto.preco),
    imagem: registro.produto.imagem,
    subtotal: Number(registro.produto.preco) * registro.quantidade,
  };
}

async function buscarPorUsuarioId(usuarioId, client = prisma) {
  const registros = await client.carrinho.findMany({
    where: { usuario_id: Number(usuarioId) },
    include: { produto: true },
    orderBy: { produto_id: 'asc' },
  });

  return {
    usuarioId: String(usuarioId),
    itens: registros.map(mapearItem),
  };
}

async function salvarPorUsuarioId(usuarioId, itens = [], client = prisma) {
  const salvar = async (tx) => {
    const uId = Number(usuarioId);
    const novosItens = itens
      .filter((item) => item.quantidade > 0)
      .map((item) => ({
        usuario_id: uId,
        produto_id: Number(item.produtoId),
        quantidade: item.quantidade,
      }));
    const produtoIds = novosItens.map((item) => item.produto_id);

    if (produtoIds.length === 0) {
      await tx.carrinho.deleteMany({ where: { usuario_id: uId } });
    } else {
      await tx.carrinho.deleteMany({
        where: {
          usuario_id: uId,
          produto_id: { notIn: produtoIds },
        },
      });

      for (const item of novosItens) {
        await tx.carrinho.upsert({
          where: {
            usuario_id_produto_id: {
              usuario_id: item.usuario_id,
              produto_id: item.produto_id,
            },
          },
          update: { quantidade: item.quantidade },
          create: item,
        });
      }
    }

    return buscarPorUsuarioId(usuarioId, tx);
  };

  if (client === prisma) {
    return prisma.$transaction(salvar);
  }

  return salvar(client);
}

module.exports = { buscarPorUsuarioId, salvarPorUsuarioId };
