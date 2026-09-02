#!/usr/bin/env bash
set -euo pipefail

key="${API_KEY_21ST:-${TWENTYFIRST_TOKEN:-}}"
args=()

while (($#)); do
  case "$1" in
    --api-key)
      shift
      if (($# == 0)); then
        echo "Missing value for --api-key" >&2
        exit 1
      fi
      key="$1"
      shift
      ;;
    --api-key=*)
      key="${1#*=}"
      shift
      ;;
    *)
      args+=("$1")
      shift
      ;;
  esac
done

if [[ -n "${key}" ]]; then
  export TWENTYFIRST_TOKEN="${key}"
fi

exec 21st "${args[@]}"
