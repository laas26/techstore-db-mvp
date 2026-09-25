require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const { Decimal } = require('@prisma/client/runtime/library');
Decimal.prototype.toJSON = function () {
  return Number(this.toString());
};

function resolverDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbUser = process.env.DB_USER || 'techstore_user';
  const dbPassword = process.env.DB_PASSWORD || 'techstore_password';
  const dbName = process.env.DB_NAME || 'techstore_v2';
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolverDatabaseUrl(),
    },
  },
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

async function inicializarBanco() {
  try {
    await prisma.$connect();
    console.log('Ligação à base de dados PostgreSQL estabelecida com sucesso');
  } catch (error) {
    console.error('Erro ao ligar ao PostgreSQL com Prisma:', error);
    throw error;
  }
}

module.exports = {
  prisma,
  inicializarBanco,
};
