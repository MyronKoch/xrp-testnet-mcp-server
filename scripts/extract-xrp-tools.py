#!/usr/bin/env python3
import re
import os
from pathlib import Path

def extract_tools():
    # Read the main index.ts
    with open('src/index.ts', 'r') as f:
        main_content = f.read()
    
    # Read additional-tools.ts
    with open('src/additional-tools.ts', 'r') as f:
        additional_content = f.read()
    
    # Map tool names to categories
    tool_categories = {
        # Core (MBPS mandatory)
        'xrp_validate_address': 'core',
        'xrp_get_account_info': 'core', 
        'xrp_get_balance': 'core',
        'xrp_get_ledger': 'core',  # Will rename to get_block
        'xrp_get_transaction': 'core',
        'xrp_get_server_info': 'core',  # For get_chain_info
        
        # Wallet
        'xrp_create_wallet': 'wallet',
        'xrp_import_wallet': 'wallet',
        'xrp_fund_testnet_account': 'wallet',
        'xrp_get_wallet_address': 'wallet',
        
        # Transactions
        'xrp_send_payment': 'transactions',
        'xrp_get_account_transactions': 'transactions',
        'xrp_estimate_fees': 'transactions',
        'xrp_decode_transaction': 'transactions',
        
        # DEX
        'xrp_place_order': 'dex',
        'xrp_cancel_order': 'dex',
        'xrp_get_order_book': 'dex',
        'xrp_get_offers': 'dex',
        'xrp_check_payment_path': 'dex',
        
        # NFT
        'xrp_mint_nft': 'nft',
        'xrp_burn_nft': 'nft',
        'xrp_create_nft_offer': 'nft',
        'xrp_accept_nft_offer': 'nft',
        'xrp_get_nfts': 'nft',
        'xrp_generate_nft_image': 'nft',
        'xrp_mint_nft_with_ipfs': 'nft',
        
        # Escrow
        'xrp_create_escrow': 'escrow',
        'xrp_finish_escrow': 'escrow',
        'xrp_cancel_escrow': 'escrow',
        'xrp_get_escrows': 'escrow',
        
        # DeFi
        'xrp_create_trustline': 'defi',
        'xrp_remove_trustline': 'defi',
        'xrp_get_trustlines': 'defi',
        'xrp_send_token': 'defi',
        'xrp_get_amm_info': 'defi',
        'xrp_set_account_settings': 'defi',
        'xrp_get_account_objects': 'defi',
        'xrp_get_ledger_entry': 'defi',
        'xrp_subscribe': 'defi',
        
        # Help
        'xrp_get_conversation_guidance': 'help',
    }
    
    # Extract tools from main index.ts
    pattern = r"case '(xrp_[^']+)':\s*{([^}]*(?:{[^}]*}[^}]*)*)}"
    matches = re.finditer(pattern, main_content, re.MULTILINE | re.DOTALL)
    
    extracted_count = 0
    for match in matches:
        tool_name = match.group(1)
        tool_body = match.group(2)
        
        category = tool_categories.get(tool_name, 'misc')
        
        # Clean up the tool body
        tool_body = tool_body.strip()
        
        # Create the tool file
        file_name = f"src/tools/{category}/{tool_name.replace('xrp_', 'xrp-')}.ts"
        os.makedirs(os.path.dirname(file_name), exist_ok=True)
        
        # Generate the tool handler
        handler_content = f"""import {{ Client }} from 'xrpl';

export async function handle{tool_name.replace('xrp_', '').replace('_', ' ').title().replace(' ', '')}(
  args: any,
  client: Client
): Promise<{{ content: Array<{{ type: string; text: string }}> }}> {{
  try {{
    {tool_body}
  }} catch (error: any) {{
    throw new Error(`Failed to execute {tool_name}: ${{error.message}}`);
  }}
}}
"""
        
        with open(file_name, 'w') as f:
            f.write(handler_content)
        
        extracted_count += 1
        print(f"Extracted {tool_name} to {file_name}")
    
    print(f"\nExtracted {extracted_count} tools from main index.ts")
    
    # Now handle additional tools
    # These are in a different format as tool definitions
    tool_pattern = r"{\s*name:\s*'(xrp_[^']+)'[^}]*handler:\s*async\s*\([^)]*\)\s*=>\s*{([^}]*(?:{[^}]*}[^}]*)*)}"
    additional_matches = re.finditer(tool_pattern, additional_content, re.MULTILINE | re.DOTALL)
    
    additional_count = 0
    for match in additional_matches:
        tool_name = match.group(1)
        tool_body = match.group(2)
        
        category = tool_categories.get(tool_name, 'misc')
        
        file_name = f"src/tools/{category}/{tool_name.replace('xrp_', 'xrp-')}.ts"
        os.makedirs(os.path.dirname(file_name), exist_ok=True)
        
        # Check if file already exists
        if not os.path.exists(file_name):
            handler_content = f"""import {{ Client }} from 'xrpl';

export async function handle{tool_name.replace('xrp_', '').replace('_', ' ').title().replace(' ', '')}(
  args: any,
  client: Client
): Promise<{{ content: Array<{{ type: string; text: string }}> }}> {{
  try {{
    {tool_body}
  }} catch (error: any) {{
    throw new Error(`Failed to execute {tool_name}: ${{error.message}}`);
  }}
}}
"""
            
            with open(file_name, 'w') as f:
                f.write(handler_content)
            
            additional_count += 1
            print(f"Extracted {tool_name} to {file_name}")
    
    print(f"Extracted {additional_count} additional tools")
    print(f"Total tools extracted: {extracted_count + additional_count}")

if __name__ == "__main__":
    extract_tools()