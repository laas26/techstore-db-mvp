// Centraliza a persistência de pedidos no MariaDB usando Prisma.
const { prisma } = require("../database/connection");

async function criarPedido(dadosPedido) {
    const { usuarioId, total, status = "pendente", itens = [] } = dadosPedido;

    // A mágica das Escritas Alinhadas (Nested Writes) do Prisma:
    // Ele abre a transação, insere o pedido e todos os itens de uma só vez.
    const pedido = await prisma.pedido.create({
        data: {
            usuario_id: Number(usuarioId),
            total,
            status,
            itens: {
                create: itens.map(item => ({
                    produto_id: Number(item.produtoId),
                    quantidade: item.quantidade,
                    preco_unitario: item.preco
                }))
            }
        },
        include: {
            itens: true // Já traz os itens inseridos de volta confirmados
        }
    });

    return {
        id: String(pedido.id),
        usuarioId: String(pedido.usuario_id),
        total: Number(pedido.total),
        status: pedido.status,
        itens: itens, // Mantém o retorno idêntico ao esperado pelas camadas superiores
        criadoEm: pedido.created_at.toISOString(),
    };
}

async function removerPedido(id) {
    try {
        // Devido ao ON DELETE CASCADE configurado no schema.prisma,
        // remover o pedido deletará automaticamente todos os seus itens no banco
        await prisma.pedido.delete({
            where: { id: Number(id) }
        });
        return true;
    } catch (error) {
        if (error.code === "P2025") return false; // Registro não encontrado
        throw error;
    }
}

async function atualizarStatus(id, usuarioId, status) {
    try {
        // No Prisma 6, o update exige ID único no 'where'. 
        // Para garantir que o pedido pertence àquele usuário específico,
        // localizamos primeiro o registro correspondente.
        const pedidoExistente = await prisma.pedido.findFirst({
            where: {
                id: Number(id),
                usuario_id: Number(usuarioId)
            }
        });

        if (!pedidoExistente) return null;

        // Atualiza o status de forma direta e segura
        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoExistente.id },
            data: { status }
        });

        return {
            id: String(pedidoAtualizado.id),
            usuarioId: String(pedidoAtualizado.usuario_id),
            total: Number(pedidoAtualizado.total),
            status: pedidoAtualizado.status,
            criadoEm: pedidoAtualizado.created_at,
        };
    } catch (error) {
        throw error;
    }
}

module.exports = { atualizarStatus, criarPedido, removerPedido };
