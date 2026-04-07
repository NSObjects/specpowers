#!/usr/bin/env bash
# Run hook wrapper for specpowers plugin
# Usage: run-hook.cmd <hook-name>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

HOOK_NAME="${1:-}"
if [ -z "$HOOK_NAME" ]; then
  echo "Usage: run-hook.cmd <hook-name>" >&2
  exit 1
fi

HOOK_SCRIPT="${SCRIPT_DIR}/${HOOK_NAME}"
if [ ! -f "$HOOK_SCRIPT" ]; then
  echo "Hook not found: ${HOOK_SCRIPT}" >&2
  exit 1
fi

exec bash "$HOOK_SCRIPT"
