#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Import client and logger (MBSS v3.0 compliant)
import { getXRPClient } from './client.js';
import logger from './logger.js';
import { TOOL_ALIASES } from './constants.js';

// Import core MBSS tools
import { handleGetChainInfo } from './tools/core/xrp_get_chain_info.js';
import { handleGetBalance } from './tools/core/xrp_get_balance.js';
import { handleGetTransaction } from './tools/core/xrp_get_transaction.js';
import { handleGetBlock } from './tools/core/xrp_get_block.js';
import { handleValidateAddress } from './tools/core/xrp_validate_address.js';
import { handleGetTransactionHistory } from './tools/core/xrp_get_transaction_history.js';
import { handleSendTransaction } from './tools/core/xrp_send_transaction.js';
import { handleGetNetworkInfo } from './tools/core/xrp_get_network_info.js';
// xrp_set_network removed - server is locked to testnet
import { handleGetGasPrice } from './tools/core/xrp_get_gas_price.js';
import { handleGetMempoolInfo } from './tools/core/xrp_get_mempool_info.js';
import { handleEstimateFees } from './tools/core/xrp_estimate_fees.js';

// Import wallet tools
import { handleCreateWallet } from './tools/wallet/xrp_create_wallet.js';
import { handleImportWallet } from './tools/wallet/xrp_import_wallet.js';
import { handleGetWalletInfo } from './tools/wallet/xrp_get_wallet_info.js';
import { handleGenerateAddress } from './tools/wallet/xrp_generate_address.js';

// Import help system tools
import { handleHelp } from './tools/help/xrp_help.js';
import { handleSearchTools } from './tools/help/xrp_search_tools.js';
import { handleListToolsByCategory } from './tools/help/xrp_list_tools_by_category.js';

// Import account tools
import { handleGetAccountInfo } from './tools/account/xrp_get_account_info.js';
import { handleFundTestnetAccount } from './tools/account/xrp_fund_testnet_account.js';
import { handleSetAccountSettings } from './tools/account/xrp_set_account_settings.js';

// Import token tools (MBSS compliant)
import { handleCreateTrustline } from './tools/tokens/xrp_create_trustline.js';
import { handleSendToken } from './tools/tokens/xrp_send_token.js';
import { handleGetTrustlines } from './tools/tokens/xrp_get_trustlines.js';
import { handleRemoveTrustline } from './tools/tokens/xrp_remove_trustline.js';
import { handleGetTokenBalance } from './tools/tokens/xrp_get_token_balance.js';
import { handleGetTokenInfo } from './tools/tokens/xrp_get_token_info.js';
import { handleTransferToken } from './tools/tokens/xrp_transfer_token.js';
import { handleApproveToken } from './tools/tokens/xrp_approve_token.js';
import { handleGetTokenAllowance } from './tools/tokens/xrp_get_token_allowance.js';

// Import NFT tools
import { handleMintNft } from './tools/nft/xrp_mint_nft.js';
import { handleBurnNFT } from './tools/nft/xrp_burn_nft.js';
import { handleCreateNFTOffer } from './tools/nft/xrp_create_nft_offer.js';
import { handleAcceptNFTOffer } from './tools/nft/xrp_accept_nft_offer.js';
import { handleGetNFTs } from './tools/nft/xrp_get_nfts.js';
import { handleGenerateNftImage } from './tools/nft/xrp_generate_nft_image.js';
import { handleMintNftWithIpfs } from './tools/nft/xrp_mint_nft_with_ipfs.js';

// Import escrow tools
import { handleCreateEscrow } from './tools/escrow/xrp_create_escrow.js';
import { handleFinishEscrow } from './tools/escrow/xrp_finish_escrow.js';
import { handleCancelEscrow } from './tools/escrow/xrp_cancel_escrow.js';
import { handleGetEscrows } from './tools/escrow/xrp_get_escrows.js';

// Import DEX tools
import { handlePlaceOrder } from './tools/dex/xrp_place_order.js';
import { handleCancelOrder } from './tools/dex/xrp_cancel_order.js';
import { handleGetOffers } from './tools/dex/xrp_get_offers.js';
import { handleGetOrderBook } from './tools/dex/xrp_get_order_book.js';

// Import AMM tools
import { handleGetAMMInfo } from './tools/amm/xrp_get_amm_info.js';

// Import advanced tools
import { handleGetLedgerEntry } from './tools/advanced/xrp_get_ledger_entry.js';
import { handleGetAccountObjects } from './tools/advanced/xrp_get_account_objects.js';
import { handleSubscribe } from './tools/advanced/xrp_subscribe.js';
import { handleDecodeTransaction } from './tools/advanced/xrp_decode_transaction.js';

// Import special tools
import { handleGetConversationGuidance } from './tools/special/xrp_get_conversation_guidance.js';

// Import tool definitions
import { TOOL_DEFINITIONS } from './tool-definitions.js';

// Initialize server
const server = new Server(
  {
    name: 'xrp_testnet-mcp-server',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize XRP client (MBSS v3.0 compliant)
const xrpClient = getXRPClient();

async function initializeClient() {
  try {
    await xrpClient.ensureConnection();
    const networkInfo = await xrpClient.getNetworkInfo();
    logger.info('Connected to XRP Ledger', {
      network: networkInfo.network,
      url: networkInfo.url
    });
  } catch (error) {
    console.error('[MBPS v2.1] Failed to connect to XRP Ledger:', error);
    throw error;
  }
}

async function ensureConnected() {
  if (!xrpClient || !xrpClient.isConnected()) {
    await initializeClient();
  }
}

// Tool definitions - MBPS v2.0 compliant with 39+ tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOL_DEFINITIONS,
  };
});

// Tool request handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Ensure xrpClient.getClient() is connected for tools that need it
    if (!['xrp_create_wallet', 'xrp_import_wallet', 'xrp_validate_address', 'xrp_help', 'xrp_search_tools', 'xrp_list_tools_by_category', 'xrp_get_conversation_guidance', 'xrp_generate_nft_image'].includes(name)) {
      await ensureConnected();
    }

    switch (name) {
      // Core MBPS Tools
      case 'xrp_get_chain_info':
        return await handleGetChainInfo(args, xrpClient.getClient());
      
      case 'xrp_get_balance':
        return await handleGetBalance(args, xrpClient.getClient());
      
      case 'xrp_get_transaction':
        return await handleGetTransaction(args, xrpClient.getClient());
      
      case 'xrp_get_block':
        return await handleGetBlock(args, xrpClient.getClient());
      
      case 'xrp_validate_address':
        return await handleValidateAddress(args);
      
      case 'xrp_get_transaction_history':
        return await handleGetTransactionHistory(args, xrpClient.getClient());
      
      case 'xrp_create_wallet':
        return await handleCreateWallet(args);
      
      case 'xrp_send_transaction':
        return await handleSendTransaction(args, xrpClient.getClient());

      // MBSS v3.0 Network Management Tools
      case 'xrp_get_network_info':
        return await handleGetNetworkInfo(args, xrpClient.getClient());

      case 'xrp_get_gas_price':
        return await handleGetGasPrice(args, xrpClient.getClient());

      case 'xrp_estimate_fees':
        return await handleEstimateFees(args, xrpClient.getClient());

      case 'xrp_get_mempool_info':
        return await handleGetMempoolInfo(args, xrpClient.getClient());

      // MBSS v3.0 Wallet Management Tools
      case 'xrp_generate_address':
        return await handleGenerateAddress(args);

      case 'xrp_get_wallet_info':
        return await handleGetWalletInfo(args, xrpClient.getClient());

      // Help System Tools
      case 'xrp_help':
        return await handleHelp(args);
      
      case 'xrp_search_tools':
        return await handleSearchTools(args);
      
      case 'xrp_list_tools_by_category':
        return await handleListToolsByCategory(args);
      
      // Account Tools
      case 'xrp_get_account_info':
        return await handleGetAccountInfo(args, xrpClient.getClient());
      
      case 'xrp_import_wallet':
        return await handleImportWallet(args);
      
      case 'xrp_fund_testnet_account':
        return await handleFundTestnetAccount(args, xrpClient.getClient());
      
      case 'xrp_set_account_settings':
        return await handleSetAccountSettings(args, xrpClient.getClient());
      
      // Token Tools
      case 'xrp_create_trustline':
        return await handleCreateTrustline(args, xrpClient.getClient());
      
      case 'xrp_send_token':
        return await handleSendToken(args, xrpClient.getClient());
      
      case 'xrp_get_trustlines':
        return await handleGetTrustlines(args, xrpClient.getClient());
      
      case 'xrp_remove_trustline':
        return await handleRemoveTrustline(args, xrpClient.getClient());

      // MBSS v3.0 Token Operations
      case 'xrp_get_token_balance':
        return await handleGetTokenBalance(args, xrpClient.getClient());

      case 'xrp_get_token_info':
        return await handleGetTokenInfo(args, xrpClient.getClient());

      case 'xrp_transfer_token':
        return await handleTransferToken(args, xrpClient.getClient());

      case 'xrp_approve_token':
        return await handleApproveToken(args, xrpClient.getClient());

      case 'xrp_get_token_allowance':
        return await handleGetTokenAllowance(args, xrpClient.getClient());

      // NFT Tools
      case 'xrp_mint_nft':
        return await handleMintNft(args, xrpClient.getClient());
      
      case 'xrp_burn_nft':
        return await handleBurnNFT(args, xrpClient.getClient());
      
      case 'xrp_create_nft_offer':
        return await handleCreateNFTOffer(args, xrpClient.getClient());
      
      case 'xrp_accept_nft_offer':
        return await handleAcceptNFTOffer(args, xrpClient.getClient());
      
      case 'xrp_get_nfts':
        return await handleGetNFTs(args, xrpClient.getClient());
      
      case 'xrp_generate_nft_image':
        return await handleGenerateNftImage(args);
      
      case 'xrp_mint_nft_with_ipfs':
        return await handleMintNftWithIpfs(args, xrpClient.getClient());
      
      // Escrow Tools
      case 'xrp_create_escrow':
        return await handleCreateEscrow(args, xrpClient.getClient());
      
      case 'xrp_finish_escrow':
        return await handleFinishEscrow(args, xrpClient.getClient());
      
      case 'xrp_cancel_escrow':
        return await handleCancelEscrow(args, xrpClient.getClient());
      
      case 'xrp_get_escrows':
        return await handleGetEscrows(args, xrpClient.getClient());
      
      // DEX Tools
      case 'xrp_place_order':
        return await handlePlaceOrder(args, xrpClient.getClient());
      
      case 'xrp_cancel_order':
        return await handleCancelOrder(args, xrpClient.getClient());
      
      case 'xrp_get_offers':
        return await handleGetOffers(args, xrpClient.getClient());
      
      case 'xrp_get_order_book':
        return await handleGetOrderBook(args, xrpClient.getClient());
      
      // AMM Tools
      case 'xrp_get_amm_info':
        return await handleGetAMMInfo(args, xrpClient.getClient());
      
      // Advanced Tools
      case 'xrp_get_ledger_entry':
        return await handleGetLedgerEntry(args, xrpClient.getClient());
      
      case 'xrp_get_account_objects':
        return await handleGetAccountObjects(args, xrpClient.getClient());
      
      case 'xrp_subscribe':
        return await handleSubscribe(args, xrpClient.getClient());
      
      case 'xrp_decode_transaction':
        return await handleDecodeTransaction(args, xrpClient.getClient());
      
      // Special Tools
      case 'xrp_get_conversation_guidance':
        return await handleGetConversationGuidance(args, xrpClient.getClient());
      
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) throw error;
    
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[MBPS v2.1] XRP Testnet MCP Server running');
    console.error('[MBPS v2.1] Network: XRP Testnet');
    console.error(`[MBPS v2.1] Total tools available: ${TOOL_DEFINITIONS.length}`);
  } catch (error) {
    console.error('[MBPS v2.1] Server startup failed:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
