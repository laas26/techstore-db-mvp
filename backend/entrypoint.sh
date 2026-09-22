#!/bin/sh
# entrypoint.sh — bootstrap automático do banco no `docker compose up -d`.
# Usa a própria tentativa do Prisma (`db push`) como sonda de prontidão do
# PostgreSQL, com retry a cada 3s — dispensa checagem de socket da shell.
set -e

# Garante DATABASE_URL exportada para o Prisma CLI e para o seed.
# Se o ambiente (docker-compose.yml) já a definiu, respeita o valor;
# caso contrário, monta a partir das variáveis DB_* (host padrão: db).
if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="postgresql://${DB_USER:-techstore_user}:${DB_PASSWORD:-techstore_password}@${DB_HOST:-db}:${DB_PORT:-5432}/${DB_NAME:-techstore_v2}"
  echo "🔧 DATABASE_URL ausente — montada a partir de DB_* (host: ${DB_HOST:-db})"
else
  echo "🔧 DATABASE_URL respeitada do ambiente (host: ${DB_HOST:-db})"
fi

echo "⏳ Gerando Prisma Client a partir do schema atual..."
# Regenera o client a cada boot: protege contra cliente desatualizado
# (bind mount do ./backend + volume anonimo de node_modules podem ficar
# defasados quando o provider/schema muda — ex.: mysql -> postgresql).
npx prisma generate

echo "⏳ Aguardando e sincronizando banco de dados com Prisma..."

# Tenta sincronizar o schema com retries de 3s em caso de falha de conexao
until npx prisma db push --skip-generate; do
  echo "⏳ Banco indisponivel em db:5432 (tentando novamente em 3s)..."
  sleep 3
done

echo "✅ Banco de dados sincronizado!"
echo "🌱 Executando seed de dados..."
node scripts/seed.js || true
echo "🚀 Iniciando aplicacao..."
exec "$@"
