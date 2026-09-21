require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// 💡 DEVOPS: Ensina o JavaScript a converter BigInt e Decimal em formatos que o Express e o React entendem
BigInt.prototype.toJSON = function () { 
  return this.toString(); 
};

// Captura a biblioteca de runtime do Prisma para estender o comportamento do Decimal
const { Decimal } = require('@prisma/client/runtime/library');
Decimal.prototype.toJSON = function () { 
  return Number(this.toString()); 
};

// DevOps: usa DATABASE_URL quando definida (Docker Compose injeta com host 'db').
// Caso contrário, monta a URL a partir das partes DB_* (dev local usa DB_HOST=localhost).
// DB_NAME padrão alinhado com MYSQL_DATABASE do compose (techstore_v2).
function resolverDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '3306';
  const dbUser = process.env.DB_USER || 'techstore_user';
  const dbPassword = process.env.DB_PASSWORD || 'techstore_password';
  const dbName = process.env.DB_NAME || 'techstore_v2';
  return `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolverDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Função simples para testar a conexão na inicialização do servidor Express
async function inicializarBanco() {
  try {
    await prisma.$connect();
    console.log('✅ Ligação à base de dados MariaDB estabelecida com sucesso via Prisma ORM!');
  } catch (error) {
    console.error('❌ Erro crítico ao ligar ao MariaDB com Prisma:', error);
    process.exit(1);
  }
}

// Exporta o cliente do Prisma para você usar nos seus Controllers/Rotas
module.exports = {
  prisma,
  inicializarBanco
};
