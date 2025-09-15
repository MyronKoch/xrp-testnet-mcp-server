#!/bin/bash

# Script to fix missing closing braces in XRP testnet server TypeScript files

files=(
  "src/tools/core/xrp-validate_address.ts"
  "src/tools/core/xrp-get_chain_info.ts"
  "src/tools/wallet/xrp-create_wallet.ts"
  "src/tools/dex/xrp-get_offers.ts"
  "src/tools/dex/xrp-cancel_order.ts"
  "src/tools/dex/xrp-place_order.ts"
  "src/tools/wallet/xrp-get_wallet_info.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Checking $file..."
    
    # Check if file ends properly with a closing brace
    last_line=$(tail -1 "$file")
    if [[ "$last_line" != "}" ]]; then
      echo "Adding missing closing brace to $file"
      echo "}" >> "$file"
    fi
  fi
done

echo "Done fixing closing braces."