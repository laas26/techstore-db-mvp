#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

DB_USER=${DB_USER:-techstore_user}
DB_NAME=${DB_NAME:-techstore_v2}
RESTORE_DB=${RESTORE_DB:-techstore_restore_test}
BACKUP_FILE=${BACKUP_FILE:-"$ROOT_DIR/backups/stage3-verify.dump"}

cleanup() {
  docker compose exec -T db dropdb \
    --if-exists \
    -U "$DB_USER" \
    "$RESTORE_DB" >/dev/null 2>&1 || true
  rm -f "$BACKUP_FILE"
}
trap cleanup EXIT HUP INT TERM

BACKUP_FILE="$BACKUP_FILE" sh "$SCRIPT_DIR/backup.sh" >/dev/null

docker compose exec -T db dropdb \
  --if-exists \
  -U "$DB_USER" \
  "$RESTORE_DB" >/dev/null
docker compose exec -T db createdb \
  -U "$DB_USER" \
  "$RESTORE_DB" >/dev/null

TARGET_DB="$RESTORE_DB" \
CONFIRM_RESTORE=YES \
BACKUP_FILE="$BACKUP_FILE" \
  sh "$SCRIPT_DIR/restore.sh" "$BACKUP_FILE" >/dev/null

for table in usuarios produtos carrinhos pedidos pedido_itens; do
  main_count=$(docker compose exec -T db psql \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -Atc "SELECT COUNT(*) FROM \"$table\";")
  restored_count=$(docker compose exec -T db psql \
    -U "$DB_USER" \
    -d "$RESTORE_DB" \
    -Atc "SELECT COUNT(*) FROM \"$table\";")

  if [ "$main_count" != "$restored_count" ]; then
    echo "Backup inválido: contagem de $table diferente ($main_count != $restored_count)" >&2
    exit 1
  fi
done

printf 'Backup e restauração verificados para todas as tabelas principais.\n'
