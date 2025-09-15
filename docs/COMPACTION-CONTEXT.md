# Context Preservation for Auto-Compaction

## Project: XRP Testnet MCP Server Refactoring to MBPS v2.0 Standard

### Current Status
- Working in: `/servers/testnet/xrp-testnet-mcp-server-refactor/`
- **Completed**: 11 MBPS v2.0 core tools (90.9% test pass rate)
- **In Progress**: Migrating remaining ~28 additional tools from original server
- **Original Server**: Has 39+ total tools in `/servers/testnet/xrp-testnet-mcp-server/`

### Critical Context to Preserve

#### 1. MBPS v2.0 Standard (11 CORE TOOLS - MANDATORY)
```
1. {prefix}_get_chain_info
2. {prefix}_get_balance  
3. {prefix}_get_transaction
4. {prefix}_get_block
5. {prefix}_validate_address
6. {prefix}_get_transaction_history
7. {prefix}_create_wallet
8. {prefix}_help
9. {prefix}_search_tools
10. {prefix}_list_tools_by_category
11. {prefix}_send_transaction
```

#### 2. Project Standards Location
- `/new standards/MBPS-v2.0-COMPREHENSIVE.md` - Core standard
- `/new standards/MSAS.md` - Modular architecture 
- `/new standards/TESTING-STANDARDIZATION-INSTRUCTIONS.md` - Jest testing

#### 3. Completed Refactors
1. ✅ Bitcoin v2: `/servers/testnet/bitcoin-testnet-mcp-server-refactor-2/` (102 tools)
2. ✅ Avalanche: `/servers/testnet/avalanche-fuji-mcp-server-refactor/`
3. ✅ BSC: `/servers/testnet/bsc-testnet-mcp-server-refactor/`
4. ✅ XRP: `/servers/testnet/xrp-testnet-mcp-server-refactor/` (partially complete)

#### 4. XRP Refactor Current State
**Completed:**
- 11 MBPS core tools implemented and tested
- Jest configuration with tests
- Modular file structure: `src/tools/core/`, `src/tools/help/`
- Created directories: `src/tools/account/`, `src/tools/tokens/`, `src/tools/nft/`

**Files Created (partial list):**
- Core tools: All 11 MBPS tools in `src/tools/core/`
- Account: `xrp-get_account_info.ts`, `xrp-import_wallet.ts`, `xrp-fund_testnet_account.ts`
- Tokens: `xrp-create_trustline.ts`
- NFT: `xrp-mint_nft.ts`

**Remaining to Migrate (28+ tools):**
From `/servers/testnet/xrp-testnet-mcp-server/src/additional-tools.ts`:
- DEX Tools: place_order, cancel_order, get_offers, get_order_book
- Token Tools: send_token, get_trustlines, remove_trustline
- NFT Tools: burn_nft, create_nft_offer, accept_nft_offer, get_nfts
- Escrow Tools: create_escrow, finish_escrow, cancel_escrow, get_escrows
- AMM Tools: get_amm_info, create_amm, deposit_amm, withdraw_amm
- Advanced: get_ledger_entry, get_account_objects, subscribe, decode_transaction
- Special: get_conversation_guidance, generate_nft_image, mint_nft_with_ipfs

#### 5. Migration Pattern
Each tool needs:
1. Separate TypeScript file in appropriate category folder
2. Zod schema for input validation
3. Export async function with standard signature
4. Addition to main index.ts tool registry and handler
5. Update tool-registry.ts with metadata

#### 6. Key Technical Details
- Using xrpl library v4.4.0
- TypeScript with ES modules (.js extensions in imports)
- All tools return `{ content: Array<{ type: string; text: string }> }`
- Client connection handled in index.ts

### Next Action
Continue migrating the remaining 28+ tools from the original server to complete the XRP testnet refactor to full feature parity with the original 39+ tool implementation.