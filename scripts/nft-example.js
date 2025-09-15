#!/usr/bin/env node

/**
 * XRP NFT MINTING EXAMPLE
 * Shows how NFT metadata is handled on XRP Ledger
 */

import * as xrpl from 'xrpl';
import fs from 'fs';
import path from 'path';

const walletPath = path.join(process.cwd(), 'xrp-testnet-wallet.json');
const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));

console.log(`
╔════════════════════════════════════════════════════════════╗
║           XRP LEDGER NFT METADATA HANDLING                ║
╚════════════════════════════════════════════════════════════╝
`);

console.log('🎨 How NFTs Work on XRP Ledger:\n');

console.log('1. URI FIELD (Main Metadata):');
console.log('   - Can be a URL pointing to metadata (IPFS, HTTP, etc.)');
console.log('   - Or can contain the metadata directly (up to 512 bytes)');
console.log('   - Stored as hex-encoded string on-chain\n');

console.log('2. NFT STRUCTURE EXAMPLES:\n');

// Example 1: IPFS Metadata (Most Common)
const ipfsExample = {
  name: "Cool NFT #1",
  description: "An awesome NFT on XRP Ledger",
  image: "ipfs://QmXxx....",  // IPFS hash
  attributes: [
    { trait_type: "Color", value: "Blue" },
    { trait_type: "Rarity", value: "Rare" }
  ]
};

console.log('📁 IPFS Metadata Example:');
console.log('   URI: ipfs://QmYourHashHere/metadata.json');
console.log('   Points to JSON:', JSON.stringify(ipfsExample, null, 2));

// Example 2: HTTP URL Metadata
console.log('\n🌐 HTTP Metadata Example:');
console.log('   URI: https://example.com/nft/1234.json');
console.log('   Points to same JSON structure');

// Example 3: On-chain Metadata (Small Data)
const onChainExample = {
  name: "On-chain NFT",
  color: "red",
  id: 42
};

console.log('\n⛓️  On-chain Metadata Example:');
console.log('   Direct JSON (must be <512 bytes):');
console.log('   ', JSON.stringify(onChainExample));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 ACTUAL NFT MINTING PARAMETERS:\n');

// Show the actual minting function
async function demonstrateNFTMinting() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  
  try {
    // Example 1: Minting with IPFS metadata
    console.log('1️⃣  IPFS-based NFT:');
    const ipfsURI = "ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU";
    console.log(`   const mintTx = {
      TransactionType: 'NFTokenMint',
      Account: '${walletData.address}',
      URI: '${Buffer.from(ipfsURI).toString('hex')}',
      Flags: 8,              // 8 = Transferable
      TransferFee: 1000,     // 1% royalty (basis points)
      NFTokenTaxon: 0        // Collection ID
   }`);
    
    // Example 2: Minting with on-chain metadata
    console.log('\n2️⃣  On-chain metadata NFT:');
    const metadata = JSON.stringify({ name: "XRP Art", rarity: "unique" });
    console.log(`   const mintTx = {
      TransactionType: 'NFTokenMint',
      Account: '${walletData.address}',
      URI: '${Buffer.from(metadata).toString('hex')}',
      Flags: 9,              // 8 (Transferable) + 1 (Burnable)
      TransferFee: 500,      // 0.5% royalty
      NFTokenTaxon: 1        // Different collection
   }`);
    
    // Example 3: External HTTP metadata
    console.log('\n3️⃣  HTTP-hosted metadata NFT:');
    const httpURI = "https://mynft.example.com/metadata/001.json";
    console.log(`   const mintTx = {
      TransactionType: 'NFTokenMint',
      Account: '${walletData.address}',
      URI: '${Buffer.from(httpURI).toString('hex')}',
      Flags: 8,
      TransferFee: 2500,     // 2.5% royalty
      NFTokenTaxon: 99       // Collection 99
   }`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 KEY PARAMETERS EXPLAINED:\n');
    
    console.log('URI (Required):');
    console.log('  • The metadata payload - URL or direct data');
    console.log('  • Max 512 bytes when hex-encoded');
    console.log('  • Converted to hex for on-chain storage\n');
    
    console.log('Flags (Optional):');
    console.log('  • 1 = Burnable (owner can destroy)');
    console.log('  • 8 = Transferable (can be traded)');
    console.log('  • 16 = Only XRP accepted for this NFT');
    console.log('  • Combine with bitwise OR (e.g., 9 = Burnable + Transferable)\n');
    
    console.log('TransferFee (Optional):');
    console.log('  • Royalty in basis points (0-50000)');
    console.log('  • 1000 = 1%, 10000 = 10%, 50000 = 50% max');
    console.log('  • Creator receives this on every sale\n');
    
    console.log('NFTokenTaxon (Optional):');
    console.log('  • Collection or series identifier');
    console.log('  • Use same taxon for NFTs in same collection');
    console.log('  • Helps organize and filter NFTs\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 USING THE MCP TOOL:\n');
    
    console.log('Via MCP Server (xrp_mint_nft):');
    console.log(`{
  "seed": "${walletData.seed}",
  "uri": "ipfs://YourIPFSHash/metadata.json",
  "flags": 8,           // Make it transferable
  "transfer_fee": 1000, // 1% royalty
  "taxon": 0            // Collection ID
}`);
    
    console.log('\n🔗 METADATA HOSTING OPTIONS:\n');
    console.log('1. IPFS (Recommended):');
    console.log('   - Upload to Pinata, Infura, or run own node');
    console.log('   - Decentralized and permanent');
    console.log('   - Example: ipfs://Qm...\n');
    
    console.log('2. Arweave:');
    console.log('   - Permanent storage with one-time fee');
    console.log('   - Example: ar://transaction-id\n');
    
    console.log('3. Traditional HTTP:');
    console.log('   - Your own server or CDN');
    console.log('   - Must maintain availability');
    console.log('   - Example: https://api.mynft.com/1.json\n');
    
    console.log('4. On-chain (Small data only):');
    console.log('   - Direct JSON in URI field');
    console.log('   - Limited to ~200 chars of JSON');
    console.log('   - Most expensive but fully decentralized');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

// Show standard metadata format
console.log('\n📋 STANDARD NFT METADATA FORMAT (OpenSea Compatible):\n');
console.log(`{
  "name": "NFT Name",
  "description": "Description of the NFT",
  "image": "ipfs://QmImageHash",
  "external_url": "https://yoursite.com/nft/1",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "display_type": "number",
      "trait_type": "Generation",
      "value": 1
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "ipfs://QmImageHash",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}`);

demonstrateNFTMinting().catch(console.error);