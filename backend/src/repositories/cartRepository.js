// Centraliza a persistência de carrinhos no MariaDB usando Prisma.
const { prisma } = require("../database/connection");

async function buscarPorUsuarioId(usuarioId) {
    // Busca os itens do carrinho incluindo os dados do relacionamento com a tabela de produtos
    const registros = await prisma.carrinho.findMany({
        where: { usuario_id: Number(usuarioId) },
        include: {
            produto: true // Realiza o JOIN automático definido no schema.prisma
        }
    });

    // Mapeia o resultado do Prisma para manter o mesmo contrato esperado pela aplicação
    const itens = registros.map(registro => ({
        produtoId: String(registro.produto_id),
        quantidade: registro.quantidade,
        nome: registro.produto.nome,
        preco: Number(registro.produto.preco),
        imagem: registro.produto.imagem,
        subtotal: Number(registro.produto.preco) * registro.quantidade
    }));

    return {
        usuarioId: String(usuarioId),
        itens: itens
    };
}

async function salvarPorUsuarioId(usuarioId, itens) {
    // Usamos a transação do Prisma para garantir consistência atômica das operações
    return await prisma.$transaction(async (tx) => {
        const uId = Number(usuarioId);

        // 1. Remove todos os itens antigos do carrinho deste usuário
        await tx.carrinho.deleteMany({
            where: { usuario_id: uId }
        });

        // 2. Insere os novos itens de forma otimizada
        // Filtra para garantir que apenas itens com quantidade válida entrem no banco
        const novosItens = itens
            .filter(item => item.quantidade > 0)
            .map(item => ({
                usuario_id: uId,
                produto_id: Number(item.produtoId),
                quantidade: item.quantidade
            }));

        if (novosItens.length > 0) {
            // O Prisma 6 permite criar múltiplos registros em lote usando o createMany
            await tx.carrinho.createMany({
                data: novosItens
            });
        }

        // Retorna o estado final estruturado consumindo a função de busca
        // Passamos o tx (contexto da transação) se necessário, ou chamamos a função principal
        return await buscarPorUsuarioId(usuarioId);
    });
}

module.exports = { buscarPorUsuarioId, salvarPorUsuarioId };
