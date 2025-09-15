// Tool definitions for all XRP testnet MCP server tools

export const TOOL_DEFINITIONS = [
  // Core MBPS Tools (11 required)
  {
    name: 'xrp_get_chain_info',
    description: 'Get comprehensive XRP Ledger information including network status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'xrp_get_balance',
    description: 'Get XRP balance for an address',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'XRP address' }
      },
      required: ['address'],
    },
  },
  {
    name: 'xrp_get_transaction',
    description: 'Get transaction details by hash',
    inputSchema: {
      type: 'object',
      properties: {
        hash: { type: 'string', description: 'Transaction hash' }
      },
      required: ['hash'],
    },
  },
  {
    name: 'xrp_get_block',
    description: 'Get ledger (block) information by number',
    inputSchema: {
      type: 'object',
      properties: {
        blockNumber: { type: ['number', 'string'], description: 'Ledger index or "validated"' }
      },
    },
  },
  {
    name: 'xrp_validate_address',
    description: 'Validate XRP address format',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Address to validate' }
      },
      required: ['address'],
    },
  },
  {
    name: 'xrp_get_transaction_history',
    description: 'Get transaction history for an address',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'XRP address' },
        limit: { type: 'number', description: 'Number of transactions (max 100)', default: 10 }
      },
      required: ['address'],
    },
  },
  {
    name: 'xrp_create_wallet',
    description: 'Generate new XRP wallet with address and keys',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'xrp_help',
    description: 'Get help and guidance for XRP MCP tools',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Help topic or tool name' }
      },
    },
  },
  {
    name: 'xrp_search_tools',
    description: 'Search available tools by keyword',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results', default: 10 }
      },
      required: ['query'],
    },
  },
  {
    name: 'xrp_list_tools_by_category',
    description: 'List tools organized by category',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Specific category to list' },
        includeDescriptions: { type: 'boolean', default: true }
      },
    },
  },
  {
    name: 'xrp_send_transaction',
    description: 'Send XRP to another address',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient address' },
        amount: { type: 'string', description: 'Amount in XRP' },
        privateKey: { type: 'string', description: 'Sender seed/private key' }
      },
      required: ['to', 'amount'],
    },
  },

  // MBSS v3.0 Network Management Tools
  {
    name: 'xrp_get_network_info',
    description: 'Get current XRP Ledger network configuration and connection status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'xrp_get_gas_price',
    description: 'Get current transaction fee (gas) pricing in drops',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'xrp_estimate_fees',
    description: 'Estimate transaction fees for different transaction types',
    inputSchema: {
      type: 'object',
      properties: {
        transactionType: { type: 'string', description: 'Type of transaction (Payment, TrustSet, OfferCreate, etc.)' }
      },
    },
  },
  {
    name: 'xrp_get_mempool_info',
    description: 'Get open ledger (mempool) transaction statistics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  // MBSS v3.0 Wallet Management Tools
  {
    name: 'xrp_generate_address',
    description: 'Generate new XRP addresses with optional derivation paths',
    inputSchema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Number of addresses to generate', default: 1 }
      },
    },
  },
  {
    name: 'xrp_get_wallet_info',
    description: 'Get comprehensive wallet information including balance, nonce, and transaction count',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'XRP account address' }
      },
      required: ['address'],
    },
  },

  // Account Tools
  {
    name: 'xrp_get_account_info',
    description: 'Get complete account information including balance and settings',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'XRP account address' }
      },
      required: ['address'],
    },
  },
  {
    name: 'xrp_import_wallet',
    description: 'Import an existing XRP wallet from seed',
    inputSchema: {
      type: 'object',
      properties: {
        seed: { type: 'string', description: 'Wallet seed (starts with s)' }
      },
      required: ['seed'],
    },
  },
  {
    name: 'xrp_fund_testnet_account',
    description: 'Fund a testnet account with test XRP',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Address to fund' }
      },
      required: ['address'],
    },
  },
  {
    name: 'xrp_set_account_settings',
    description: 'Configure account settings (transfer fees, flags, etc)',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        domain: { type: 'string', description: 'Domain associated with account' },
        email_hash: { type: 'string', description: 'MD5 hash of email' },
        message_key: { type: 'string', description: 'Public key for messages' },
        transfer_fee: { type: 'number', description: 'Transfer fee (0-100000)' },
        require_auth: { type: 'boolean', description: 'Require authorization' },
        require_dest_tag: { type: 'boolean', description: 'Require destination tag' }
      },
      required: ['privateKey'],
    },
  },

  // Token Tools
  {
    name: 'xrp_create_trustline',
    description: 'Create a trustline to hold a custom token',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        currency: { type: 'string', description: 'Currency code (3 chars)' },
        issuer: { type: 'string', description: 'Token issuer address' },
        limit: { type: 'string', description: 'Maximum amount to hold' }
      },
      required: ['privateKey', 'currency', 'issuer', 'limit'],
    },
  },
  {
    name: 'xrp_send_token',
    description: 'Send custom token to another account',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Sender private key' },
        destination: { type: 'string', description: 'Recipient address' },
        currency: { type: 'string', description: 'Currency code' },
        issuer: { type: 'string', description: 'Token issuer' },
        amount: { type: 'string', description: 'Amount to send' }
      },
      required: ['privateKey', 'destination', 'currency', 'issuer', 'amount'],
    },
  },
  {
    name: 'xrp_get_trustlines',
    description: 'Get all trustlines for an account',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' }
      },
      required: ['address'],
    },
  },
  {
    name: 'xrp_remove_trustline',
    description: 'Remove a trustline (set limit to 0)',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        currency: { type: 'string', description: 'Currency code' },
        issuer: { type: 'string', description: 'Token issuer address' }
      },
      required: ['privateKey', 'currency', 'issuer'],
    },
  },

  // MBSS v3.0 Token Operations
  {
    name: 'xrp_get_token_balance',
    description: 'Get custom token (trustline) balance for an account',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' },
        currency: { type: 'string', description: 'Currency code' },
        issuer: { type: 'string', description: 'Token issuer address' }
      },
      required: ['address', 'currency', 'issuer'],
    },
  },
  {
    name: 'xrp_get_token_info',
    description: 'Get token metadata and issuer information',
    inputSchema: {
      type: 'object',
      properties: {
        currency: { type: 'string', description: 'Currency code' },
        issuer: { type: 'string', description: 'Token issuer address' }
      },
      required: ['currency', 'issuer'],
    },
  },
  {
    name: 'xrp_transfer_token',
    description: 'Transfer custom tokens between accounts',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Sender private key' },
        destination: { type: 'string', description: 'Recipient address' },
        currency: { type: 'string', description: 'Currency code' },
        issuer: { type: 'string', description: 'Token issuer' },
        amount: { type: 'string', description: 'Amount to send' }
      },
      required: ['privateKey', 'destination', 'currency', 'issuer', 'amount'],
    },
  },
  {
    name: 'xrp_approve_token',
    description: 'Set token spending authorization (trustline management)',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        currency: { type: 'string', description: 'Currency code' },
        issuer: { type: 'string', description: 'Token issuer address' },
        limit: { type: 'string', description: 'Authorized spending limit' }
      },
      required: ['privateKey', 'currency', 'issuer', 'limit'],
    },
  },
  {
    name: 'xrp_get_token_allowance',
    description: 'Get token trustline limit (spending allowance)',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' },
        currency: { type: 'string', description: 'Currency code' },
        issuer: { type: 'string', description: 'Token issuer address' }
      },
      required: ['address', 'currency', 'issuer'],
    },
  },

  // NFT Tools
  {
    name: 'xrp_mint_nft',
    description: 'Mint a new NFT on XRP Ledger',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Minter private key' },
        uri: { type: 'string', description: 'NFT metadata URI' },
        flags: { type: 'number', description: 'NFT flags (burnable, transferable, etc)' },
        transfer_fee: { type: 'number', description: 'Creator fee (0-50000 = 0-50%)' },
        taxon: { type: 'number', description: 'NFT collection/series identifier' }
      },
      required: ['privateKey', 'uri'],
    },
  },
  {
    name: 'xrp_burn_nft',
    description: 'Burn an NFT you own',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Owner private key' },
        nft_id: { type: 'string', description: 'NFT Token ID to burn' }
      },
      required: ['privateKey', 'nft_id'],
    },
  },
  {
    name: 'xrp_create_nft_offer',
    description: 'Create buy or sell offer for NFT',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        nft_id: { type: 'string', description: 'NFT Token ID' },
        amount: { type: 'string', description: 'Offer amount in drops' },
        flags: { type: 'number', description: '1 for sell offer, 0 for buy' },
        destination: { type: 'string', description: 'Specific buyer/seller (optional)' }
      },
      required: ['privateKey', 'nft_id', 'amount'],
    },
  },
  {
    name: 'xrp_accept_nft_offer',
    description: 'Accept an NFT buy or sell offer',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        offer_id: { type: 'string', description: 'NFT Offer ID to accept' }
      },
      required: ['privateKey', 'offer_id'],
    },
  },
  {
    name: 'xrp_get_nfts',
    description: 'Get all NFTs owned by an account',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' }
      },
      required: ['address'],
    },
  },

  // Escrow Tools
  {
    name: 'xrp_create_escrow',
    description: 'Create time or condition-locked escrow',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Sender private key' },
        destination: { type: 'string', description: 'Recipient address' },
        amount: { type: 'string', description: 'Amount in XRP' },
        condition: { type: 'string', description: 'Crypto condition (optional)' },
        finish_after: { type: 'number', description: 'Unix timestamp when escrow can be finished' },
        cancel_after: { type: 'number', description: 'Unix timestamp when escrow can be cancelled' }
      },
      required: ['privateKey', 'destination', 'amount'],
    },
  },
  {
    name: 'xrp_finish_escrow',
    description: 'Complete an escrow and release funds',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        owner: { type: 'string', description: 'Escrow creator address' },
        escrow_sequence: { type: 'number', description: 'Escrow sequence number' },
        fulfillment: { type: 'string', description: 'Fulfillment for condition (if required)' }
      },
      required: ['privateKey', 'owner', 'escrow_sequence'],
    },
  },
  {
    name: 'xrp_cancel_escrow',
    description: 'Cancel an expired escrow',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        owner: { type: 'string', description: 'Escrow creator address' },
        escrow_sequence: { type: 'number', description: 'Escrow sequence number' }
      },
      required: ['privateKey', 'owner', 'escrow_sequence'],
    },
  },
  {
    name: 'xrp_get_escrows',
    description: 'Get all escrows for an account',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' }
      },
      required: ['address'],
    },
  },

  // DEX Tools
  {
    name: 'xrp_place_order',
    description: 'Place a buy or sell order on the DEX',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        taker_gets: { 
          type: 'object',
          properties: {
            currency: { type: 'string' },
            issuer: { type: 'string' },
            value: { type: 'string' }
          }
        },
        taker_pays: { 
          type: 'object',
          properties: {
            currency: { type: 'string' },
            issuer: { type: 'string' },
            value: { type: 'string' }
          }
        }
      },
      required: ['privateKey', 'taker_gets', 'taker_pays'],
    },
  },
  {
    name: 'xrp_cancel_order',
    description: 'Cancel an existing DEX order',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Account private key' },
        offer_sequence: { type: 'number', description: 'Sequence number of offer to cancel' }
      },
      required: ['privateKey', 'offer_sequence'],
    },
  },
  {
    name: 'xrp_get_offers',
    description: 'Get open offers for an account',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' }
      },
      required: ['address'],
    },
  },
  {
    name: 'xrp_get_order_book',
    description: 'Get order book depth for a currency pair',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of orders to return' },
        taker_gets: { type: 'object', description: 'Currency being sold' },
        taker_pays: { type: 'object', description: 'Currency being bought' }
      },
      required: ['taker_gets', 'taker_pays'],
    },
  },

  // AMM Tools
  {
    name: 'xrp_get_amm_info',
    description: 'Get info about an AMM pool',
    inputSchema: {
      type: 'object',
      properties: {
        asset1: { 
          type: 'object',
          properties: {
            currency: { type: 'string' },
            issuer: { type: 'string' }
          }
        },
        asset2: { 
          type: 'object',
          properties: {
            currency: { type: 'string' },
            issuer: { type: 'string' }
          }
        }
      },
      required: ['asset1', 'asset2'],
    },
  },

  // Advanced Tools
  {
    name: 'xrp_get_ledger_entry',
    description: 'Get specific ledger entry by ID',
    inputSchema: {
      type: 'object',
      properties: {
        ledger_hash: { type: 'string', description: 'Ledger hash' },
        ledger_index: { type: 'string', description: 'Ledger index or shortcut' },
        accounts: { type: 'boolean', description: 'Include account info' },
        index: { type: 'string', description: 'Ledger entry ID' }
      },
      required: [],
    },
  },
  {
    name: 'xrp_get_account_objects',
    description: 'Get all objects owned by an account',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' },
        type: { type: 'string', description: 'Filter by object type' }
      },
      required: ['address'],
    },
  },
  {
    name: 'xrp_subscribe',
    description: 'Subscribe to real-time ledger updates',
    inputSchema: {
      type: 'object',
      properties: {
        streams: { 
          type: 'array',
          items: { type: 'string' },
          description: 'Streams to subscribe: ledger, transactions, etc'
        },
        accounts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Accounts to monitor'
        }
      },
      required: ['streams'],
    },
  },
  {
    name: 'xrp_decode_transaction',
    description: 'Decode a transaction blob',
    inputSchema: {
      type: 'object',
      properties: {
        tx_blob: { type: 'string', description: 'Signed transaction blob' }
      },
      required: ['tx_blob'],
    },
  },

  // Special Tools
  {
    name: 'xrp_get_conversation_guidance',
    description: 'Get conversation prompts and guidance for specific XRP operations',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { 
          type: 'string', 
          description: 'Type of operation: nft_creation, payment, trading, escrow, general',
          enum: ['nft_creation', 'payment', 'trading', 'escrow', 'general']
        },
        user_request: { 
          type: 'string', 
          description: 'Original user request for context' 
        }
      },
      required: ['operation'],
    },
  },
  {
    name: 'xrp_generate_nft_image',
    description: 'Generate AI image for NFT using free APIs (FLUX.1, Stable Diffusion, Playground AI)',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { 
          type: 'string', 
          description: 'Text description of the image to generate' 
        },
        style: { 
          type: 'string', 
          description: 'Art style for the image',
          enum: ['realistic', 'artistic', 'cartoon', 'fantasy', 'cyberpunk', 'minimalist']
        },
        aspectRatio: { 
          type: 'string', 
          description: 'Image aspect ratio',
          enum: ['1:1', '16:9', '9:16', '4:3', '3:4'],
          default: '1:1'
        },
        quality: { 
          type: 'string', 
          description: 'Generation quality',
          enum: ['standard', 'high', 'ultra'],
          default: 'high'
        }
      },
      required: ['prompt'],
    },
  },
  {
    name: 'xrp_mint_nft_with_ipfs',
    description: 'Create NFT with IPFS storage for images and metadata (Enhanced version of xrp_mint_nft)',
    inputSchema: {
      type: 'object',
      properties: {
        privateKey: { type: 'string', description: 'Wallet private key for signing' },
        name: { type: 'string', description: 'NFT name' },
        description: { type: 'string', description: 'NFT description' },
        imageUrl: { type: 'string', description: 'URL of image to upload to IPFS' },
        imagePath: { type: 'string', description: 'Local path to image file' },
        attributes: { 
          type: 'array', 
          description: 'NFT attributes/traits',
          items: {
            type: 'object',
            properties: {
              trait_type: { type: 'string' },
              value: { type: ['string', 'number'] }
            }
          }
        },
        flags: { type: 'number', description: 'NFT flags (8=transferable, 1=burnable)', default: 8 },
        taxon: { type: 'number', description: 'Collection ID', default: 0 },
        transferFee: { type: 'number', description: 'Royalty in basis points (0-50000)', default: 0 },
        ipfsApiKey: { type: 'string', description: 'API key for IPFS service (uses env if not provided)' }
      },
      required: ['privateKey', 'name', 'description'],
    },
  }
];
