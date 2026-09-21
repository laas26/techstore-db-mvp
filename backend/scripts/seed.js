// scripts/seed.js
require('dotenv').config();

const { prisma } = require('../src/database/connection'); 
const bcrypt = require('bcrypt');

const SENHA_ADMIN_PADRAO = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const SENHA_CLIENTE_PADRAO = process.env.SEED_CLIENTE_PASSWORD || 'Cliente@123';

const usuariosIniciais = [
  {
    nome: 'Gerente TechStore',
    email: 'admin@techstore.local',
    senha: SENHA_ADMIN_PADRAO,
    role: 'admin',
  },
  {
    nome: 'Cliente TechStore',
    email: 'cliente@techstore.local',
    senha: SENHA_CLIENTE_PADRAO,
    role: 'user',
  },
];

const produtosIniciais = [
  {
    nome: 'Caixa Sonic',
    descricao: 'Caixa de som portátil com áudio potente para o dia a dia.',
    preco: 299.9,
    stock: 25,
    categoria: 'audio',
    imagem: '/img/caixasonic.jpg',
  },
  {
    nome: 'Sonic Buds X',
    descricao: 'Fones sem fio compactos com boa autonomia de bateria.',
    preco: 199.9,
    stock: 40,
    categoria: 'audio',
    imagem: '/img/sonicbudsx.png',
  },
  {
    nome: 'Notebook Titan',
    descricao: 'Notebook de alta performance para trabalho e estudos.',
    preco: 7499.9,
    stock: 12,
    categoria: 'notebooks',
    imagem: '/img/notetitan.jpg',
  },
  {
    nome: 'Note Slim',
    descricao: 'Notebook leve com design fino e tela ampla.',
    preco: 4299.9,
    stock: 18,
    categoria: 'notebooks',
    imagem: '/img/note-slim.jpg',
  },
  {
    nome: 'Mouse Precision',
    descricao: 'Mouse ergonômico com resposta rápida e rolagem suave.',
    preco: 89.9,
    stock: 60,
    categoria: 'perifericos',
    imagem: '/img/mouse.jpg',
  },
  {
    nome: 'Teclado Mecânico',
    descricao: 'Teclado confortável com switches precisos.',
    preco: 249.9,
    stock: 35,
    categoria: 'perifericos',
    imagem: '/img/teclado.jpg',
  },
  {
    nome: 'Pen Drive 128GB',
    descricao: 'Armazenamento portátil para arquivos e backups.',
    preco: 69.9,
    stock: 80,
    categoria: 'perifericos',
    imagem: '/img/pendrive.jpg',
  },
  {
    nome: 'Toca-discos Vintage',
    descricao: 'Toca-discos com acabamento clássico e som envolvente.',
    preco: 899.9,
    stock: 10,
    categoria: 'audio',
    imagem: '/img/tocadiscos.jpg',
  },
];

async function executarSeeds() { // Corrigido para "x"
  console.log('🌱 Iniciando semeio de dados com Prisma...');

  for (const usuario of usuariosIniciais) {
    const senhaHash = await bcrypt.hash(usuario.senha, 10);
    
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {
        nome: usuario.nome,
        senhaHash: senhaHash,
        role: usuario.role,
      },
      create: {
        nome: usuario.nome,
        email: usuario.email,
        senhaHash: senhaHash,
        role: usuario.role,
      },
    });
  }

  for (const produto of produtosIniciais) {
    const existente = await prisma.produto.findFirst({
      where: { nome: produto.nome }
    });

    if (existente) {
      await prisma.produto.update({
        where: { id: existente.id },
        data: {
          descricao: produto.descricao,
          preco: produto.preco,
          stock: produto.stock,
          categoria: produto.categoria,
          imagem: produto.imagem,
        }
      });
    } else {
      await prisma.produto.create({
        data: {
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco,
          stock: produto.stock,
          categoria: produto.categoria,
          imagem: produto.imagem,
        }
      });
    }
  }
}

async function executarComoScript() {
  try {
    await executarSeeds();
    console.log('✅ Seed executado com sucesso.');
    console.log('Gerente: admin@techstore.local / Admin@123');
    console.log('Cliente: cliente@techstore.local / Cliente@123');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  executarComoScript();
}

module.exports = {
  executarSeeds,
  produtosIniciais,
  usuariosIniciais,
};
