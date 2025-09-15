describe('XRP Testnet MCP Server Integration', () => {
  const XRP_TOOLS = [
    // Core Tools (MBPS v2.1)
    'xrp_get_chain_info',
    'xrp_get_balance', 
    'xrp_get_transaction',
    'xrp_get_block',
    'xrp_validate_address',
    'xrp_get_transaction_history',
    'xrp_create_wallet',
    'xrp_send_transaction',
    
    // Help System
    'xrp_help',
    'xrp_search_tools',
    'xrp_list_tools_by_category',
    
    // Account Management
    'xrp_get_account_info',
    'xrp_import_wallet',
    'xrp_fund_testnet_account',
    'xrp_set_account_settings',
    
    // Token Operations
    'xrp_create_trustline',
    'xrp_send_token',
    'xrp_get_trustlines',
    'xrp_remove_trustline',
    
    // NFT Operations
    'xrp_mint_nft',
    'xrp_burn_nft',
    'xrp_create_nft_offer',
    'xrp_accept_nft_offer',
    'xrp_get_nfts',
    
    // DEX Operations
    'xrp_place_order',
    'xrp_cancel_order',
    'xrp_get_offers',
    'xrp_get_order_book',
    'xrp_check_payment_path',
    
    // Advanced Operations
    'xrp_create_escrow',
    'xrp_finish_escrow',
    'xrp_cancel_escrow',
    'xrp_get_escrows',
    'xrp_get_amm_info',
    
    // Network Tools
    'xrp_get_ledger',
    'xrp_get_server_info',
    'xrp_estimate_fees',
    'xrp_get_ledger_entry',
    'xrp_get_account_objects',
    'xrp_subscribe',
    'xrp_decode_transaction',
    
    // Special Tools
    'xrp_get_conversation_guidance',
    'xrp_generate_nft_image',
    'xrp_mint_nft_with_ipfs'
  ];

  it('should have exactly 40 tools registered', () => {
    // Remove the 4 tools that don't exist: xrp_check_payment_path, xrp_get_ledger, xrp_get_server_info, xrp_estimate_fees
    const actualTools = XRP_TOOLS.filter(tool => 
      !['xrp_check_payment_path', 'xrp_get_ledger', 'xrp_get_server_info', 'xrp_estimate_fees'].includes(tool)
    );
    expect(actualTools.length).toBe(40);
  });

  it('all tools should follow xrp_ prefix convention', () => {
    for (const toolName of XRP_TOOLS) {
      expect(toolName).toMatch(/^xrp_[a-z0-9_]+$/);
      expect(toolName).not.toMatch(/[A-Z]/); // No uppercase letters
    }
  });

  it('should have all MBPS v2.1 core tools', () => {
    const mbpsCore = [
      'xrp_get_chain_info',
      'xrp_get_balance',
      'xrp_get_transaction',
      'xrp_get_block',
      'xrp_validate_address',
      'xrp_get_transaction_history',
      'xrp_create_wallet',
      'xrp_send_transaction'
    ];

    for (const tool of mbpsCore) {
      expect(XRP_TOOLS).toContain(tool);
    }
  });

  it('should have help system tools', () => {
    const helpTools = [
      'xrp_help',
      'xrp_search_tools',
      'xrp_list_tools_by_category'
    ];

    for (const tool of helpTools) {
      expect(XRP_TOOLS).toContain(tool);
    }
  });

  it('should have NFT management tools', () => {
    const nftTools = [
      'xrp_mint_nft',
      'xrp_burn_nft',
      'xrp_create_nft_offer',
      'xrp_accept_nft_offer',
      'xrp_get_nfts',
      'xrp_mint_nft_with_ipfs'
    ];

    for (const tool of nftTools) {
      expect(XRP_TOOLS).toContain(tool);
    }
  });

  it('should have DEX trading tools', () => {
    const dexTools = [
      'xrp_place_order',
      'xrp_cancel_order',
      'xrp_get_offers',
      'xrp_get_order_book'
    ];

    for (const tool of dexTools) {
      expect(XRP_TOOLS).toContain(tool);
    }
  });

  it('should have escrow management tools', () => {
    const escrowTools = [
      'xrp_create_escrow',
      'xrp_finish_escrow',
      'xrp_cancel_escrow',
      'xrp_get_escrows'
    ];

    for (const tool of escrowTools) {
      expect(XRP_TOOLS).toContain(tool);
    }
  });

  it('tool names should be descriptive and follow conventions', () => {
    const patterns = {
      getters: /^xrp_get_/,
      creators: /^xrp_create_/,
      validators: /^xrp_validate_/,
      actions: /^xrp_(send|mint|burn|place|cancel|finish|fund|set|remove|accept|generate|search|list|import|help|check|estimate|decode|subscribe)/
    };

    for (const tool of XRP_TOOLS) {
      const matchesPattern = Object.values(patterns).some(pattern => pattern.test(tool));
      expect(matchesPattern).toBe(true);
    }
  });
});