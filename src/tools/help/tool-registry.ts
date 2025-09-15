export interface ToolMetadata {
  name: string;
  category: string;
  description: string;
  parameters?: Record<string, any>;
  examples?: string[];
}

export const toolRegistry: ToolMetadata[] = [
  // Core MBPS Tools
  {
    name: 'xrp_get_chain_info',
    category: 'core',
    description: 'Get comprehensive XRP Ledger information'
  },
  {
    name: 'xrp_get_balance',
    category: 'core',
    description: 'Get XRP balance for an address'
  },
  {
    name: 'xrp_get_transaction',
    category: 'core',
    description: 'Get transaction details by hash'
  },
  {
    name: 'xrp_get_block',
    category: 'core',
    description: 'Get ledger (block) information'
  },
  {
    name: 'xrp_validate_address',
    category: 'core',
    description: 'Validate XRP address format'
  },
  {
    name: 'xrp_get_transaction_history',
    category: 'core',
    description: 'Get recent transactions for an address'
  },
  {
    name: 'xrp_create_wallet',
    category: 'core',
    description: 'Generate new XRP wallet'
  },
  {
    name: 'xrp_send_transaction',
    category: 'core',
    description: 'Send XRP to another address'
  },
  
  // Wallet Tools
  {
    name: 'xrp_import_wallet',
    category: 'wallet',
    description: 'Import wallet from seed'
  },
  {
    name: 'xrp_fund_testnet_account',
    category: 'wallet',
    description: 'Get test XRP from faucet'
  },
  
  // DEX Tools
  {
    name: 'xrp_place_order',
    category: 'dex',
    description: 'Place buy/sell order on DEX'
  },
  {
    name: 'xrp_get_order_book',
    category: 'dex',
    description: 'Get order book for currency pair'
  },
  {
    name: 'xrp_cancel_order',
    category: 'dex',
    description: 'Cancel existing DEX order'
  },
  {
    name: 'xrp_get_offers',
    category: 'dex',
    description: 'Get open offers for account'
  },
  
  // NFT Tools
  {
    name: 'xrp_mint_nft',
    category: 'nft',
    description: 'Mint new NFT on XRP Ledger'
  },
  {
    name: 'xrp_burn_nft',
    category: 'nft',
    description: 'Burn NFT you own'
  },
  {
    name: 'xrp_create_nft_offer',
    category: 'nft',
    description: 'Create buy/sell offer for NFT'
  },
  {
    name: 'xrp_accept_nft_offer',
    category: 'nft',
    description: 'Accept NFT offer'
  },
  {
    name: 'xrp_get_nfts',
    category: 'nft',
    description: 'Get all NFTs owned by account'
  },
  
  // Token Tools
  {
    name: 'xrp_create_trustline',
    category: 'tokens',
    description: 'Create trustline for custom token'
  },
  {
    name: 'xrp_remove_trustline',
    category: 'tokens',
    description: 'Remove trustline'
  },
  {
    name: 'xrp_get_trustlines',
    category: 'tokens',
    description: 'Get all trustlines for account'
  },
  {
    name: 'xrp_send_token',
    category: 'tokens',
    description: 'Send custom token'
  },
  
  // Escrow Tools
  {
    name: 'xrp_create_escrow',
    category: 'escrow',
    description: 'Create time/condition-locked escrow'
  },
  {
    name: 'xrp_finish_escrow',
    category: 'escrow',
    description: 'Complete escrow and release funds'
  },
  {
    name: 'xrp_cancel_escrow',
    category: 'escrow',
    description: 'Cancel expired escrow'
  },
  {
    name: 'xrp_get_escrows',
    category: 'escrow',
    description: 'Get all escrows for account'
  },
  
  // Account Settings
  {
    name: 'xrp_set_account_settings',
    category: 'account',
    description: 'Configure account settings'
  },
  {
    name: 'xrp_get_account_info',
    category: 'account',
    description: 'Get detailed account information'
  },
  {
    name: 'xrp_get_account_transactions',
    category: 'account',
    description: 'Get account transaction history'
  },
  {
    name: 'xrp_get_account_objects',
    category: 'account',
    description: 'Get all objects owned by account'
  },
  
  // Network Tools
  {
    name: 'xrp_get_server_info',
    category: 'network',
    description: 'Get server and network status'
  },
  {
    name: 'xrp_get_ledger',
    category: 'network',
    description: 'Get ledger information'
  },
  {
    name: 'xrp_get_ledger_entry',
    category: 'network',
    description: 'Get specific ledger entry'
  },
  {
    name: 'xrp_estimate_fees',
    category: 'network',
    description: 'Calculate network fees'
  },
  {
    name: 'xrp_check_payment_path',
    category: 'network',
    description: 'Find payment paths for cross-currency'
  }
];

export function getToolsByCategory(): Record<string, ToolMetadata[]> {
  const categories: Record<string, ToolMetadata[]> = {};
  
  for (const tool of toolRegistry) {
    if (!categories[tool.category]) {
      categories[tool.category] = [];
    }
    categories[tool.category].push(tool);
  }
  
  return categories;
}

export function searchTools(query: string): ToolMetadata[] {
  const lowerQuery = query.toLowerCase();
  return toolRegistry.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.category.toLowerCase().includes(lowerQuery)
  );
}
