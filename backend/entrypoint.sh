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

# Segredo de sessão: prioriza o ambiente; se vier vazio, usa o arquivo local
# ou gera um novo na primeira subida — nada de segredo versionado no repositório.
if [ -z "${JWT_SECRET:-}" ]; then
  JWT_FILE="./.jwt_secret"
  if [ -s "$JWT_FILE" ]; then
    JWT_SECRET=$(cat "$JWT_FILE")
    echo "🔑 Segredo de sessao carregado do arquivo local"
  else
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    printf '%s' "$JWT_SECRET" > "$JWT_FILE"
    echo "🔑 Novo segredo de sessao gerado e guardado localmente"
  fi
  export JWT_SECRET
else
  echo "🔑 Segredo de sessao definido no ambiente"
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
