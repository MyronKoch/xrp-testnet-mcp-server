# Changelog

All notable changes to the XRP Testnet MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-15

### Added
- 🆕 Tool #37: `xrp_mint_nft_with_ipfs` - Enhanced NFT minting with IPFS storage
- IPFS integration supporting multiple providers:
  - Pinata (recommended - 1GB free tier)
  - Web3.Storage (free tier available)
  - NFT.Storage (deprecated but supported)
- Automatic image and metadata upload to IPFS
- Environment variable configuration for IPFS services
- Comprehensive IPFS documentation in README
- Security documentation for wallet management

### Changed
- Updated total tool count from 36 to 37
- Enhanced NFT operations with dual options (basic and IPFS-enabled)
- Improved error handling for IPFS uploads
- Added `.mcp.json` to `.gitignore` for security

### Fixed
- Fixed transaction parsing in test #10
- Fixed escrow cancellation in test #23 (added CancelAfter parameter)
- Corrected IPFS upload implementation for Pinata API

## [1.0.0] - 2025-09-14

### Added
- Initial release with 36 fully working tools
- Complete XRP Ledger testnet integration
- Account & wallet operations (7 tools)
- Payment operations (4 tools)
- DEX trading operations (4 tools)
- Token/currency operations (4 tools)
- Escrow operations (4 tools)
- NFT operations (5 tools)
- Network & ledger operations (7 tools)
- AMM query operations (1 tool)
- Comprehensive test suite for all tools
- MCP Inspector support
- Environment variable configuration
- TypeScript implementation with full type safety

### Security
- Testnet-only configuration for safe development
- No mainnet access to prevent accidental real transactions
- Wallet seed management best practices documented