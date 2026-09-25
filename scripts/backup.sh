#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

DB_USER=${DB_USER:-techstore_user}
DB_NAME=${DB_NAME:-techstore_v2}
umask 077
BACKUP_DIR=${BACKUP_DIR:-"$ROOT_DIR/backups"}
mkdir -p "$BACKUP_DIR"

if [ -n "${BACKUP_FILE:-}" ]; then
  case "$BACKUP_FILE" in
    /*) OUTPUT_FILE="$BACKUP_FILE" ;;
    *) OUTPUT_FILE="$ROOT_DIR/$BACKUP_FILE" ;;
  esac
else
  OUTPUT_FILE="$BACKUP_DIR/techstore-$(date -u +%Y%m%dT%H%M%SZ).dump"
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"
TEMP_FILE="$OUTPUT_FILE.tmp"
trap 'rm -f "$TEMP_FILE"' EXIT HUP INT TERM

docker compose exec -T db pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --no-owner \
  --no-privileges > "$TEMP_FILE"

mv "$TEMP_FILE" "$OUTPUT_FILE"
trap - EXIT HUP INT TERM
printf 'Backup criado em %s\n' "$OUTPUT_FILE"
