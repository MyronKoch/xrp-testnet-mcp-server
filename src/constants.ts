/**
 * XRP Ledger Constants and Configuration
 * MBSS v3.0 Compliant Constants File
 */

// Network Configuration
export const NETWORKS = {
  mainnet: {
    name: 'xrp_XRP Ledger Mainnet',
    url: 'wss://s1.ripple.com',
    explorer: 'https://livenet.xrpl.org',
    faucet: null
  },
  testnet: {
    name: 'xrp_XRP Ledger Testnet',
    url: 'wss://s.altnet.rippletest.net:51233',
    explorer: 'https://testnet.xrpl.org',
    faucet: 'https://faucet.altnet.rippletest.net'
  },
  devnet: {
    name: 'xrp_XRP Ledger Devnet',
    url: 'wss://s.devnet.rippletest.net:51233',
    explorer: 'https://devnet.xrpl.org',
    faucet: 'https://faucet.devnet.rippletest.net'
  }
} as const;

// Fee Configuration (in drops, 1 XRP = 1,000,000 drops)
export const FEES = {
  BASE_FEE: '10', // 10 drops
  RESERVE_BASE: '10000000', // 10 XRP
  RESERVE_INCREMENT: '2000000', // 2 XRP
  ACCOUNT_DELETE: '2000000', // 2 XRP
  REFERENCE_FEE: '10' // Reference fee for calculations
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  PAYMENT: 'Payment',
  TRUST_SET: 'TrustSet',
  OFFER_CREATE: 'OfferCreate',
  OFFER_CANCEL: 'OfferCancel',
  ACCOUNT_SET: 'AccountSet',
  SET_REGULAR_KEY: 'SetRegularKey',
  SIGNER_LIST_SET: 'SignerListSet',
  ESCROW_CREATE: 'EscrowCreate',
  ESCROW_FINISH: 'EscrowFinish',
  ESCROW_CANCEL: 'EscrowCancel',
  PAYMENT_CHANNEL_CREATE: 'PaymentChannelCreate',
  PAYMENT_CHANNEL_FUND: 'PaymentChannelFund',
  PAYMENT_CHANNEL_CLAIM: 'PaymentChannelClaim',
  NFT_MINT: 'NFTokenMint',
  NFT_BURN: 'NFTokenBurn',
  NFT_CREATE_OFFER: 'NFTokenCreateOffer',
  NFT_CANCEL_OFFER: 'NFTokenCancelOffer',
  NFT_ACCEPT_OFFER: 'NFTokenAcceptOffer',
  AMM_CREATE: 'AMMCreate',
  AMM_DEPOSIT: 'AMMDeposit',
  AMM_WITHDRAW: 'AMMWithdraw',
  AMM_VOTE: 'AMMVote'
} as const;

// Ledger Constants
export const LEDGER_CONSTANTS = {
  GENESIS_LEDGER: 32570,
  LEDGER_CLOSE_TIME: 4, // seconds
  MAX_TRANSACTIONS_PER_LEDGER: 1000,
  MAX_MEMO_SIZE: 1024,
  MIN_XRP: '0.000001', // 1 drop
  MAX_XRP: '100000000000000000', // 100 billion XRP
} as const;

// Account Flags
export const ACCOUNT_FLAGS = {
  REQUIRE_DEST_TAG: 0x00000001,
  REQUIRE_AUTH: 0x00000002,
  DISALLOW_XRP: 0x00000008,
  DISABLE_MASTER: 0x00000100,
  NO_FREEZE: 0x00200000,
  GLOBAL_FREEZE: 0x00400000,
  DEFAULT_RIPPLE: 0x00800000
} as const;

// Trust Line Flags
export const TRUST_LINE_FLAGS = {
  SET_NO_RIPPLE: 0x00020000,
  CLEAR_NO_RIPPLE: 0x00040000,
  SET_FREEZE: 0x00000020,
  CLEAR_FREEZE: 0x00000040
} as const;

// NFT Flags
export const NFT_FLAGS = {
  BURNABLE: 0x0001,
  ONLY_XRP: 0x0002,
  TRUSTLINE: 0x0004,
  TRANSFERABLE: 0x0008
} as const;

// Offer Flags
export const OFFER_FLAGS = {
  PASSIVE: 0x00010000,
  IMMEDIATE_OR_CANCEL: 0x00020000,
  FILL_OR_KILL: 0x00040000,
  SELL: 0x00080000
} as const;

// Path Finding
export const PATH_FINDING = {
  MAX_PATHS: 10,
  MAX_PATH_LENGTH: 8,
  DEFAULT_SLIPPAGE: 0.01 // 1%
} as const;

// AMM (Automated Market Maker) Constants
export const AMM_CONSTANTS = {
  MIN_POOL_XRP: '1000000', // 1 XRP minimum
  TRADING_FEE: 0.003, // 0.3%
  MAX_SLIPPAGE: 0.05 // 5%
} as const;

// Validation
export const VALIDATION = {
  ADDRESS_REGEX: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  CURRENCY_CODE_REGEX: /^[A-Z]{3}$/,
  HEX_CURRENCY_REGEX: /^[A-F0-9]{40}$/,
  HASH_REGEX: /^[A-F0-9]{64}$/,
  MAX_DROPS: BigInt('100000000000000000'), // 100 billion XRP in drops
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_ADDRESS: 'Invalid XRP address format',
  INVALID_AMOUNT: 'Invalid amount specified',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  ACCOUNT_NOT_FOUND: 'Account not found',
  NETWORK_ERROR: 'Network connection error',
  TRANSACTION_FAILED: 'Transaction failed',
  INVALID_NETWORK: 'Invalid network specified',
  CONNECTION_FAILED: 'Failed to connect to XRP Ledger',
  INVALID_CURRENCY: 'Invalid currency code',
  INVALID_HASH: 'Invalid transaction hash'
} as const;

// Tool Aliases for MBSS Compliance
export const TOOL_ALIASES = {
  'xrp_get_gas_price': 'xrp_get_fee',
  'xrp_estimate_fees': 'xrp_estimate_transaction_fee',
  'xrp_transfer_token': 'xrp_send_token',
  'xrp_get_token_balance': 'xrp_get_trustlines',
  'xrp_approve_token': 'xrp_create_trustline',
  'xrp_get_token_allowance': 'xrp_get_trustline_limit',
  'xrp_get_mempool_info': 'xrp_get_queue_info',
  'xrp_generate_address': 'xrp_create_wallet'
} as const;

// Default Values
export const DEFAULTS = {
  LIMIT: 20,
  MAX_LIMIT: 400,
  TIMEOUT: 20000, // 20 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000 // 1 second
}
