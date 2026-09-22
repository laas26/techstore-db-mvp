// Centraliza a persistência de usuários no PostgreSQL usando Prisma.
const { prisma } = require("../database/connection");

class EmailJaCadastradoError extends Error {}

async function buscarPorEmail(email) {
    if (!email) return null;
    const emailFormatado = email.trim().toLowerCase();
    
    return await prisma.usuario.findUnique({
        where: { email: emailFormatado },
    });
}

async function buscarPorId(id) {
    if (!id) return null;
    
    return await prisma.usuario.findUnique({
        where: { id: Number(id) },
    });
}

async function criarUsuario({ nome, email, senhaHash, role = "user" }) {
    const emailFormatado = email.trim().toLowerCase();

    try {
        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email: emailFormatado,
                senhaHash,
                role,
            },
        });

        return {
            ...usuario,
            id: String(usuario.id), // Mantém o ID como String para retrocompatibilidade
        };
    } catch (error) {
        // P2002 é o código do Prisma para violação de restrição única (Unique constraint failed)
        if (error.code === "P2002") {
            throw new EmailJaCadastradoError();
        }
        throw error;
    }
}

async function criarTokenRedefinicao(email, tokenHash, expiraEm) {
    const emailFormatado = email.trim().toLowerCase();

    try {
        const resultado = await prisma.usuario.update({
            where: { email: emailFormatado },
            data: {
                tokenRedefinicaoHash: tokenHash,
                // O Prisma mapeia BIGINT para BigInt do JS, aceitando o número diretamente
                tokenRedefinicaoExpiraEm: BigInt(expiraEm), 
            },
        });
        return !!resultado;
    } catch (error) {
        if (error.code === "P2025") return false; // Registro não encontrado
        throw error;
    }
}

async function atualizarSenhaPorToken(
    tokenHash,
    senhaHash,
    agora = Date.now(),
) {
    try {
        // Como o Prisma não possui um updateMany que retorne affectedRows facilmente para checagem,
        // localizamos primeiro o usuário que bate com os critérios de token e tempo válidos
        const usuarioValido = await prisma.usuario.findFirst({
            where: {
                tokenRedefinicaoHash: tokenHash,
                tokenRedefinicaoExpiraEm: {
                    gt: BigInt(agora), // gt = greater than (maior que o timestamp atual)
                },
            },
        });

        if (!usuarioValido) return false;

        // Atualiza a senha e limpa os campos de redefinição
        await prisma.usuario.update({
            where: { id: usuarioValido.id },
            data: {
                senhaHash: senhaHash,
                tokenRedefinicaoHash: null,
                tokenRedefinicaoExpiraEm: null,
            },
        });

        return true;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    buscarPorEmail,
    buscarPorId,
    criarUsuario,
    criarTokenRedefinicao,
    atualizarSenhaPorToken,
    EmailJaCadastradoError,
};
