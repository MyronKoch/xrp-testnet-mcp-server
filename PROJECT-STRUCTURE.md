# XRP Testnet MCP Server - Project Structure

## 📁 Directory Organization

```
xrp-testnet-mcp-server-refactor/
│
├── 📂 src/                     # Source code
│   ├── index.ts               # Main server entry point
│   ├── tool-definitions.ts    # Tool registry (40 tools)
│   └── tools/                 # Tool implementations
│       ├── account/           # Account management tools
│       ├── advanced/          # Advanced operations
│       ├── amm/              # AMM pool tools
│       ├── core/             # Core MBPS tools
│       ├── dex/              # DEX trading tools
│       ├── escrow/           # Escrow management
│       ├── help/             # Help system tools
│       ├── nft/              # NFT operations
│       ├── special/          # Special features (AI, IPFS)
│       └── tokens/           # Token operations
│
├── 📂 dist/                    # Compiled JavaScript output
│   └── [compiled .js files]
│
├── 📂 tests/                   # Test suites
│   ├── smoke.test.ts          # Basic functionality tests
│   ├── integration/           # Integration tests
│   │   ├── core-tools.test.ts
│   │   └── tool-registration.test.ts
│   └── unit/                  # Unit tests
│       └── core/              # Core tool unit tests
│
├── 📂 scripts/                 # Utility scripts
│   ├── test-*.js             # Testing scripts
│   ├── create-*.js           # Wallet creation scripts
│   └── [other utilities]
│
├── 📂 reports/                 # Test results & reports
│   ├── test-results.txt
│   ├── complete-test-report-*.json
│   └── inspector_output.log
│
├── 📂 docs/                    # Documentation
│   ├── examples/              # Usage examples
│   ├── WALLET-SECURITY.md
│   ├── CLAUDE-DESKTOP-SETUP.md
│   └── COMPACTION-*.md
│
├── 📂 config/                  # Configuration files
│   └── xrp-testnet-wallet*.json
│
├── 📂 archive/                 # Archived/old files
│   ├── old-files/
│   └── test-files/
│
├── 📂 coverage/                # Jest coverage reports
│   └── [coverage data]
│
├── 📂 node_modules/            # Dependencies
│
├── 📄 package.json            # Package configuration
├── 📄 tsconfig.json           # TypeScript config
├── 📄 jest.config.cjs         # Jest testing config
├── 📄 README.md               # Project documentation
├── 📄 CHANGELOG.md            # Version history
└── 📄 .gitignore              # Git ignore rules
```

## 🎯 Key Statistics

- **Total Tools**: 40 XRP-specific tools
- **Test Coverage**: 100% pass rate (26/26 tests)
- **MBPS Compliance**: 64% (16/25 core tools)
- **Code Coverage**: 32% overall, 57% core tools

## 🧹 Organization Notes

### Source Code (`src/`)
- Modular architecture with tools organized by category
- Each tool is a separate TypeScript file
- Follows `xrp_{action}_{resource}` naming convention

### Testing (`tests/`)
- **Smoke Tests**: Basic server startup validation
- **Integration Tests**: Tool registration and compliance
- **Unit Tests**: Individual tool functionality

### Scripts (`scripts/`)
- Testing utilities for manual tool validation
- Wallet management and funding scripts
- Analysis and debugging tools

### Reports (`reports/`)
- Automated test results from Jest
- MCP Inspector output logs
- Historical test run data

### Documentation (`docs/`)
- Setup guides for Claude Desktop
- Security documentation
- Usage examples

## 🚀 Quick Commands

```bash
# Build the server
npm run build

# Run tests
npm test

# Start the server
npm run start

# Development mode
npm run dev

# Test with MCP Inspector
npm run inspect

# Coverage report
npm run test:coverage
```

## ✅ Cleanup Completed

This folder has been reorganized from a cluttered state to a professional structure:
- ✅ Test files moved to organized `tests/` directory
- ✅ Scripts consolidated in `scripts/` folder
- ✅ Reports centralized in `reports/`
- ✅ Documentation organized in `docs/`
- ✅ Old/duplicate files archived
- ✅ Configuration files secured in `config/`
- ✅ Root directory cleaned to essential files only