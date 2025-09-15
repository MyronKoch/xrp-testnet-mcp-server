#!/bin/bash

# Fix xrp-get_mempool_info.ts - remove extra closing brace
sed -i.bak '93,94d' src/tools/core/xrp-get_mempool_info.ts

# Fix xrp-approve_token.ts - add missing closing brace
echo "}" >> src/tools/tokens/xrp-approve_token.ts

# Fix xrp-get_token_allowance.ts - add missing closing brace
echo "}" >> src/tools/tokens/xrp-get_token_allowance.ts

# Fix xrp-get_token_info.ts - add missing closing brace
echo "}" >> src/tools/tokens/xrp-get_token_info.ts

# Fix xrp-transfer_token.ts - add missing closing brace
echo "}" >> src/tools/tokens/xrp-transfer_token.ts

# Fix xrp-get_wallet_info.ts - add missing closing brace
echo "}" >> src/tools/wallet/xrp-get_wallet_info.ts

# Fix index.ts - remove extra closing brace
sed -i.bak '157,158d' src/tools/index.ts

echo "Syntax fixes applied!"
