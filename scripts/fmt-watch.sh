#!/usr/bin/env bash
set -euo pipefail

exec watchexec \
  --postpone \
  --emit-events-to=json-stdio \
  --fs-events=modify \
  -- sh -c \''jq -r ".tags[] | select(.kind==\"path\") | .absolute" | sort -u | tr "\n" "\0" | xargs -0 -r -- pnpm dlx prettier --write --ignore-unknown'\'
