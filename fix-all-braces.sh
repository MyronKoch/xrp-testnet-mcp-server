#!/bin/bash

# Script to fix missing closing braces in XRP testnet server TypeScript files

echo "Fixing missing closing braces..."

find src/tools -name "*.ts" | while read file; do
  # Check if the file's last non-empty line is not a closing brace
  last_line=$(tail -1 "$file" | tr -d '[:space:]')
  
  if [[ "$last_line" != "}" ]]; then
    echo "Adding closing brace to $file"
    echo "}" >> "$file"
  fi
done

# Also fix other specific files
files_to_fix=(
  "src/constants.ts"
  "src/types.ts"
)

for file in "${files_to_fix[@]}"; do
  if [[ -f "$file" ]]; then
    last_line=$(tail -1 "$file" | tr -d '[:space:]')
    if [[ "$last_line" != "}" ]]; then
      echo "Adding closing brace to $file"
      echo "}" >> "$file"
    fi
  fi
done

echo "Done fixing closing braces."