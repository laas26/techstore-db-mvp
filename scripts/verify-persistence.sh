#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

DB_USER=${DB_USER:-techstore_user}
DB_NAME=${DB_NAME:-techstore_v2}
MARKER="stage3-persistence-$(date -u +%Y%m%dT%H%M%SZ)-$$"

wait_until_ready() {
  attempt=1
  while [ "$attempt" -le 60 ]; do
    if curl -fsS http://localhost:3002/health/ready >/dev/null 2>&1; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 2
  done

  echo 'A stack não ficou pronta após 120 segundos.' >&2
  return 1
}

cleanup() {
  docker compose up -d >/dev/null 2>&1 || true
  docker compose exec -T db psql \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -v ON_ERROR_STOP=1 \
    -c "DELETE FROM produtos WHERE nome = '$MARKER';" >/dev/null 2>&1 || true
}
trap cleanup EXIT HUP INT TERM

docker compose up -d >/dev/null
wait_until_ready

sentinel_id=$(docker compose exec -T db psql \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -v ON_ERROR_STOP=1 \
  -qAtc "INSERT INTO produtos (nome, descricao, preco, stock, categoria) VALUES ('$MARKER', 'Stage 3 persistence check', 1.00, 0, 'persistence-test') RETURNING id;")

docker compose down >/dev/null
docker compose up -d >/dev/null
wait_until_ready

persisted_id=$(docker compose exec -T db psql \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -Atc "SELECT id FROM produtos WHERE nome = '$MARKER';")

if [ "$persisted_id" != "$sentinel_id" ]; then
  echo "Persistência falhou: ID do sentinel mudou ($sentinel_id != $persisted_id)." >&2
  exit 1
fi

printf 'Persistência verificada após down/up: %s (id %s).\n' "$MARKER" "$sentinel_id"
