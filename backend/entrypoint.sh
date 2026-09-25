#!/bin/sh
set -e

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="postgresql://${DB_USER:-techstore_user}:${DB_PASSWORD:-techstore_password}@${DB_HOST:-db}:${DB_PORT:-5432}/${DB_NAME:-techstore_v2}"
  echo "DATABASE_URL ausente; URL montada a partir das variáveis DB_*"
else
  echo "DATABASE_URL carregada do ambiente"
fi

if [ -z "${JWT_SECRET:-}" ]; then
  JWT_FILE="./.jwt_secret"

  if [ -s "$JWT_FILE" ]; then
    JWT_SECRET=$(cat "$JWT_FILE")
    echo "Segredo de sessão carregado do arquivo local"
  else
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    (umask 077; printf '%s' "$JWT_SECRET" > "$JWT_FILE")
    echo "Novo segredo de sessão gerado"
  fi

  chmod 600 "$JWT_FILE"
  export JWT_SECRET
else
  echo "Segredo de sessão definido no ambiente"
fi

npx prisma generate

until npx prisma db push --skip-generate; do
  echo "Banco indisponível; nova tentativa em 3 segundos"
  sleep 3
done

if [ "${SEED_ON_START:-true}" = "true" ]; then
  node scripts/seed.js
else
  echo "Carga inicial ignorada por SEED_ON_START=false"
fi

exec "$@"
