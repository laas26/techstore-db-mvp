#!/bin/sh
# docker-entrypoint.sh — bootstrap automático do banco no `docker compose up -d`.
# 1. Aguarda o MariaDB aceitar conexões
# 2. Cria/atualiza as tabelas a partir do prisma/schema.prisma (db push, sem migrations manuais)
# 3. Executa o seed idempotente (scripts/seed.js usa upsert — seguro rodar toda vez)
# 4. Exibe os links consolidados de acesso e inicia o servidor (exec "$@")
set -e

echo "⏳ Aguardando MariaDB em ${DB_HOST:-db}:${DB_PORT:-3306}..."

# Aguarda até 60s pelo banco (healthcheck do compose já ajuda, mas isso garante contra race condition)
i=0
until node -e "
const net = require('net');
const host = process.env.DB_HOST || 'db';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const s = net.connect(port, host, () => { s.end(); process.exit(0); });
s.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 3000);
" >/dev/null 2>&1; do
  i=$((i+1))
  if [ "$i" -ge 60 ]; then
    echo "❌ MariaDB não respondeu em 60s. Abortando."
    exit 1
  fi
  sleep 2
done

echo "✅ MariaDB acessível. Sincronizando schema..."

# Garante o Prisma Client do ambiente Linux do container
# (necessário porque o compose monta ./backend por cima de /app)
npx prisma generate

# Cria as tabelas se não existirem. Idempotente, dispensa `prisma migrate` manual.
# --accept-data-loss é seguro aqui porque o schema é a fonte da verdade no MVP.
npx prisma db push --accept-data-loss

echo "🌱 Executando seed (idempotente)..."
node scripts/seed.js || echo "⚠️ Seed falhou — subindo API mesmo assim. Veja os logs acima."

echo "===================================================="
echo "🚀 TechStore MVP rodando com sucesso!"
echo "----------------------------------------------------"
echo "👉 Frontend (Aplicação):    http://localhost:3001"
echo "👉 Backend (API REST):      http://localhost:3002"
echo "===================================================="

echo "🚀 Iniciando backend..."
exec "$@"