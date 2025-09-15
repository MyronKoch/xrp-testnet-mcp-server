/**
 * Tool Handler Registry
 * MBSS v3.0 Compliant Tool Organization
 */

// Core tools
import { handleGetChainInfo } from './core/xrp_get_chain_info.js';
import { handleGetBalance } from './core/xrp_get_balance.js';
import { handleGetTransaction } from './core/xrp_get_transaction.js';
import { handleGetBlock } from './core/xrp_get_block.js';
import { handleValidateAddress } from './core/xrp_validate_address.js';
import { handleGetTransactionHistory } from './core/xrp_get_transaction_history.js';
import { handleSendTransaction } from './core/xrp_send_transaction.js';
import { handleGetNetworkInfo } from './core/xrp_get_network_info.js';
import { handleSetNetwork } from './core/xrp_set_network.js';
import { handleGetGasPrice } from './core/xrp_get_gas_price.js';
import { handleGetMempoolInfo } from './core/xrp_get_mempool_info.js';
import { handleEstimateFees } from './core/xrp_estimate_fees.js';

// Wallet tools
import { handleCreateWallet } from './wallet/xrp_create_wallet.js';
import { handleImportWallet } from './wallet/xrp_import_wallet.js';
import { handleGetWalletInfo } from './wallet/xrp_get_wallet_info.js';
import { handleGenerateAddress } from './wallet/xrp_generate_address.js';

// Help tools
import { handleHelp } from './help/xrp_help.js';
import { handleSearchTools } from './help/xrp_search_tools.js';
import { handleListToolsByCategory } from './help/xrp_list_tools_by_category.js';

// Account tools
import { handleGetAccountInfo } from './account/xrp_get_account_info.js';
import { handleFundTestnetAccount } from './account/xrp_fund_testnet_account.js';
import { handleSetAccountSettings } from './account/xrp_set_account_settings.js';

// Token tools
import { handleCreateTrustline } from './tokens/xrp_create_trustline.js';
import { handleSendToken } from './tokens/xrp_send_token.js';
import { handleGetTrustlines } from './tokens/xrp_get_trustlines.js';
import { handleRemoveTrustline } from './tokens/xrp_remove_trustline.js';
import { handleGetTokenBalance } from './tokens/xrp_get_token_balance.js';
import { handleGetTokenInfo } from './tokens/xrp_get_token_info.js';
import { handleTransferToken } from './tokens/xrp_transfer_token.js';
import { handleApproveToken } from './tokens/xrp_approve_token.js';
import { handleGetTokenAllowance } from './tokens/xrp_get_token_allowance.js';

// NFT tools
import { handleMintNft } from './nft/xrp_mint_nft.js';
import { handleBurnNFT } from './nft/xrp_burn_nft.js';
import { handleCreateNFTOffer } from './nft/xrp_create_nft_offer.js';
import { handleAcceptNFTOffer } from './nft/xrp_accept_nft_offer.js';
import { handleGetNFTs } from './nft/xrp_get_nfts.js';

// Escrow tools
import { handleCreateEscrow } from './escrow/xrp_create_escrow.js';
import { handleFinishEscrow } from './escrow/xrp_finish_escrow.js';
import { handleCancelEscrow } from './escrow/xrp_cancel_escrow.js';
import { handleGetEscrows } from './escrow/xrp_get_escrows.js';

// DEX tools
import { handlePlaceOrder } from './dex/xrp_place_order.js';
import { handleCancelOrder } from './dex/xrp_cancel_order.js';
import { handleGetOffers } from './dex/xrp_get_offers.js';
import { handleGetOrderBook } from './dex/xrp_get_order_book.js';

// AMM tools
import { handleGetAMMInfo } from './amm/xrp_get_amm_info.js';

// Advanced tools
import { handleGetLedgerEntry } from './advanced/xrp_get_ledger_entry.js';
import { handleGetAccountObjects } from './advanced/xrp_get_account_objects.js';
import { handleSubscribe } from './advanced/xrp_subscribe.js';
import { handleDecodeTransaction } from './advanced/xrp_decode_transaction.js';

// Special tools
import { handleGetConversationGuidance } from './special/xrp_get_conversation_guidance.js';

/**
 * Tool Handler Registry
 * Maps tool names to their handler functions
 */
export const TOOL_HANDLERS: Record<string, (args: any, client?: any) => Promise<any>> = {
  // Core MBSS tools (25 mandatory)
  'xrp_get_chain_info': handleGetChainInfo,
  'xrp_get_balance': handleGetBalance,
  'xrp_get_transaction': handleGetTransaction,
  'xrp_get_block': handleGetBlock,
  'xrp_validate_address': handleValidateAddress,
  'xrp_get_transaction_history': handleGetTransactionHistory,
  'xrp_create_wallet': handleCreateWallet,
  'xrp_help': handleHelp,
  'xrp_search_tools': handleSearchTools,
  'xrp_list_tools_by_category': handleListToolsByCategory,
  'xrp_send_transaction': handleSendTransaction,
  'xrp_get_network_info': handleGetNetworkInfo,
  'xrp_set_network': handleSetNetwork,
  'xrp_get_gas_price': handleGetGasPrice,
  'xrp_get_mempool_info': handleGetMempoolInfo,
  'xrp_estimate_fees': handleEstimateFees,
  'xrp_import_wallet': handleImportWallet,
  'xrp_get_wallet_info': handleGetWalletInfo,
  'xrp_get_account_info': handleGetAccountInfo,
  'xrp_generate_address': handleGenerateAddress,
  'xrp_get_token_balance': handleGetTokenBalance,
  'xrp_get_token_info': handleGetTokenInfo,
  'xrp_transfer_token': handleTransferToken,
  'xrp_approve_token': handleApproveToken,
  'xrp_get_token_allowance': handleGetTokenAllowance,
  
  // XRP-specific tools
  'xrp_fund_testnet_account': handleFundTestnetAccount,
  'xrp_set_account_settings': handleSetAccountSettings,
  'xrp_create_trustline': handleCreateTrustline,
  'xrp_send_token': handleSendToken,
  'xrp_get_trustlines': handleGetTrustlines,
  'xrp_remove_trustline': handleRemoveTrustline,
  
  // NFT tools
  'xrp_mint_nft': handleMintNft,
  'xrp_burn_nft': handleBurnNFT,
  'xrp_create_nft_offer': handleCreateNFTOffer,
  'xrp_accept_nft_offer': handleAcceptNFTOffer,
  'xrp_get_nfts': handleGetNFTs,
  
  // Escrow tools
  'xrp_create_escrow': handleCreateEscrow,
  'xrp_finish_escrow': handleFinishEscrow,
  'xrp_cancel_escrow': handleCancelEscrow,
  'xrp_get_escrows': handleGetEscrows,
  
  // DEX tools
  'xrp_place_order': handlePlaceOrder,
  'xrp_cancel_order': handleCancelOrder,
  'xrp_get_offers': handleGetOffers,
  'xrp_get_order_book': handleGetOrderBook,
  
  // AMM tools
  'xrp_get_amm_info': handleGetAMMInfo,
  
  // Advanced tools
  'xrp_get_ledger_entry': handleGetLedgerEntry,
  'xrp_get_account_objects': handleGetAccountObjects,
  'xrp_subscribe': handleSubscribe,
  'xrp_decode_transaction': handleDecodeTransaction,

  // Special tools
  'xrp_get_conversation_guidance': handleGetConversationGuidance
};

// Export tool count for verification
export const TOOL_COUNT = Object.keys(TOOL_HANDLERS).length;
export const MBSS_CORE_TOOLS = 25;
