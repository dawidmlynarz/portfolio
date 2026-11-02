#!/usr/bin/env bash
# PreToolUse hook for Edit and Write: blocks raw colour values in style and component files.
# Token files are allowed, because that's where the raw values live. Needs jq.
input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
text=$(printf '%s' "$input" | jq -r '.tool_input.content // .tool_input.new_string // empty')

case "$file" in
  *token*) exit 0 ;;
  *.css | *.scss | *.tsx | *.jsx | *.vue | *.svelte | *.astro) ;;
  *) exit 0 ;;
esac

if printf '%s' "$text" | grep -Eq '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\('; then
  echo "Raw colour value in $file. Use a design token instead." >&2
  exit 2
fi
exit 0
