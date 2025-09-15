# XRP MCP Server - Wallet Security Guide

## ⚠️ CRITICAL SECURITY NOTICE

**NEVER expose wallet seeds/private keys in production environments!**

## Test Wallets (TESTNET ONLY - Created Sep 15, 2025)

### Active Test Wallet #1
- **Address**: `rGbbug1RM9yRGprUq9v35GG8bXWq38rXtT`
- **Seed**: `sEd7YiGpVVgFmXBwR2vppK9eUUMRXZS`
- **Initial Balance**: 10 XRP (from testnet faucet)
- **Purpose**: Testing MCP tools, especially IPFS NFT minting
- **Created**: Via XRPL testnet faucet for Claude MCP integration testing
- **Status**: Active

⚠️ **WARNING**: These are TESTNET credentials only. Never use real mainnet credentials!

## Current Implementation Status

The MCP server currently requires wallet seeds for transaction signing during development/testing. This is **NOT suitable for production use**.

## Recommended Production Approaches

### 1. Transaction Preparation Mode (Recommended)

The MCP server should prepare transactions WITHOUT signing them:

```javascript
// Server prepares transaction
const preparedTx = {
  TransactionType: 'NFTokenMint',
  Account: userAddress,  // Public address only
  URI: ipfsMetadata,
  Flags: 8,
  Fee: '12'
};

// Return to client for signing
return {
  unsigned_transaction: preparedTx,
  signing_instructions: "Sign with your preferred wallet"
};
```

### 2. XUMM Wallet Integration

XUMM is the most popular XRP wallet with excellent API support:

```javascript
import { Xumm } from 'xumm';

const xumm = new Xumm('api-key', 'api-secret');

// Create sign request
const request = await xumm.payload.create({
  txjson: preparedTx
});

// User signs on mobile
// Get signed result
const result = await xumm.payload.get(request.uuid);
```

### 3. Hardware Wallet Support

Ledger integration for maximum security:

```javascript
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Xrp from '@ledgerhq/hw-app-xrp';

const transport = await TransportWebUSB.create();
const xrp = new Xrp(transport);

// Sign transaction with Ledger
const signature = await xrp.signTransaction(
  "44'/144'/0'/0/0",
  preparedTx
);
```

### 4. Encrypted Keystore (Development)

For development environments only:

```javascript
import { encrypt, decrypt } from 'crypto-js';

// Encrypt wallet seed
const encrypted = encrypt(walletSeed, password);
// Store encrypted version

// Decrypt only when needed
const decrypted = decrypt(encrypted, password);
const wallet = Wallet.fromSeed(decrypted);
```

## Environment Variables (Development Only)

For testing, you can use `.env` files:

```bash
# .env.local (NEVER commit this file)
XRP_DEV_WALLET_SEED=sEdTMFdKvPPvqQ1dzNtL4hhp2wW8Z2p
TRANSACTION_MODE=prepare_only  # or sign_and_submit for dev
```

## Security Checklist

- [ ] Never commit wallet seeds to version control
- [ ] Use `.gitignore` to exclude `.env` files
- [ ] Implement transaction preparation mode for production
- [ ] Add wallet connection UI for end users
- [ ] Use hardware wallets for high-value operations
- [ ] Implement rate limiting on transaction endpoints
- [ ] Add transaction approval workflows
- [ ] Log all transaction attempts for auditing

## Migration Path

1. **Phase 1** (Current): Development mode with seeds in `.env`
2. **Phase 2**: Add unsigned transaction mode
3. **Phase 3**: Integrate XUMM for mobile signing
4. **Phase 4**: Add hardware wallet support
5. **Phase 5**: Remove all seed-based signing

## Example: Safe NFT Minting

```typescript
// Tool returns unsigned transaction
async function mintNFTSafe(params: {
  address: string,
  metadata: object
}) {
  const tx = {
    TransactionType: 'NFTokenMint',
    Account: params.address,
    URI: encodeMetadata(params.metadata),
    Flags: 8,
    Fee: '12'
  };
  
  // Autofill but don't sign
  const prepared = await client.autofill(tx);
  
  return {
    success: true,
    unsigned_tx: prepared,
    instructions: 'Please sign this transaction with your wallet',
    qr_code: generateXummQR(prepared)  // Optional: QR for XUMM
  };
}
```

## Testing with Inspector

For MCP Inspector testing, you can:

1. Use testnet faucet wallets (disposable)
2. Set `TRANSACTION_MODE=sign_and_submit` in `.env`
3. Display clear warnings about development mode

## Resources

- [XUMM SDK](https://www.npmjs.com/package/xumm)
- [XRP Ledger Signing](https://xrpl.org/transaction-signing.html)
- [Ledger Hardware Wallet](https://github.com/LedgerHQ/ledger-live)
- [GemWallet Browser Extension](https://gemwallet.app)