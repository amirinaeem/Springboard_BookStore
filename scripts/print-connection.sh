

//==============================================================
// FILE: scripts/print-connection.sh
// DESCRIPTION: Helper to echo the DATABASE_URL for local Docker DB.
//==============================================================


#!/usr/bin/env bash
set -euo pipefail
USER=bookstore
PASS=bookstore
HOST=localhost
PORT=5432
DB=bookstore
printf "DATABASE_URL=postgresql://%s:%s@%s:%s/%s?schema=public
" "$USER" "$PASS" "$HOST" "$PORT" "$DB"

