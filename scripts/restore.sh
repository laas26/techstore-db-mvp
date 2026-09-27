#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

DB_USER=${DB_USER:-techstore_user}
DB_NAME=${DB_NAME:-techstore_v2}
TARGET_DB=${TARGET_DB:-$DB_NAME}
BACKUP_FILE=${1:-${BACKUP_FILE:-}}

if [ -z "$BACKUP_FILE" ]; then
  echo 'Uso: sh scripts/restore.sh CAMINHO_DO_BACKUP.dump' >&2
  echo 'Para restaurar em outro banco, defina TARGET_DB.' >&2
  exit 2
fi

case "$BACKUP_FILE" in
  /*) ;;
  *) BACKUP_FILE="$ROOT_DIR/$BACKUP_FILE" ;;
esac

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup não encontrado: $BACKUP_FILE" >&2
  exit 1
fi

if [ "${CONFIRM_RESTORE:-}" != "YES" ]; then
  echo 'Restauração cancelada. Defina CONFIRM_RESTORE=YES para confirmar.' >&2
  exit 2
fi

case "$TARGET_DB" in
  ''|*[!A-Za-z0-9_]* )
    echo "Nome de banco inválido: $TARGET_DB" >&2
    exit 2
    ;;
esac

if [ "${RESTORE_CLEAN:-false}" = "true" ]; then
  docker compose exec -T db pg_restore \
    -U "$DB_USER" \
    -d "$TARGET_DB" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --exit-on-error < "$BACKUP_FILE"
else
  docker compose exec -T db pg_restore \
    -U "$DB_USER" \
    -d "$TARGET_DB" \
    --no-owner \
    --no-privileges \
    --exit-on-error < "$BACKUP_FILE"
fi

printf 'Backup restaurado no banco %s\n' "$TARGET_DB"
