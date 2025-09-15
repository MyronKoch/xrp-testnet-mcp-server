#!/usr/bin/env node

/**
 * Test IPFS NFT Minting Tool #37
 * This script tests the enhanced NFT minting with IPFS metadata storage
 */

const xrpl = require('xrpl');
const fs = require('fs');

// Test wallet (same as in test-complete-36-tools.js)
const walletData = {
  seed: 'sEdTMFdKvPPvqQ1dzNtL4hhp2wW8Z2p',
  address: 'rJWhqoYdNv84sbECTHKJDDFxPDhXLhVvKB'
};

async function testIPFSNFT() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  
  try {
    console.log('🔗 Connecting to XRP Testnet...');
    await client.connect();
    
    const wallet = xrpl.Wallet.fromSeed(walletData.seed);
    console.log(`📱 Wallet: ${wallet.address}`);
    
    const balance = await client.getXrpBalance(wallet.address);
    console.log(`💰 Balance: ${balance} XRP\n`);
    
    // Test 1: Basic NFT with inline metadata
    console.log('Test 1: Basic NFT with inline metadata');
    console.log('========================================');
    
    const basicMetadata = {
      name: "XRP Test NFT #1",
      description: "Basic NFT without IPFS",
      image: "https://via.placeholder.com/400",
      attributes: [
        { trait_type: "Type", value: "Basic" },
        { trait_type: "Test", value: "1" }
      ]
    };
    
    const basicMint = {
      TransactionType: 'NFTokenMint',
      Account: wallet.address,
      URI: Buffer.from(JSON.stringify(basicMetadata)).toString('hex').toUpperCase(),
      Flags: 8, // Transferable
      NFTokenTaxon: 1,
      Fee: '12'
    };
    
    const prepared1 = await client.autofill(basicMint);
    const signed1 = wallet.sign(prepared1);
    const result1 = await client.submitAndWait(signed1.tx_blob);
    
    console.log(`✅ Minted basic NFT: ${result1.result.hash.substring(0, 10)}...`);
    
    // Test 2: Enhanced NFT with IPFS (simulated)
    console.log('\nTest 2: Enhanced NFT with IPFS metadata');
    console.log('========================================');
    
    // Load example metadata
    const exampleMetadata = JSON.parse(
      fs.readFileSync('./example-nft-metadata.json', 'utf8')
    );
    
    console.log('📦 Metadata to upload:');
    console.log(`  Name: ${exampleMetadata.name}`);
    console.log(`  Description: ${exampleMetadata.description.substring(0, 50)}...`);
    console.log(`  Attributes: ${exampleMetadata.attributes.length} traits`);
    
    // Simulate IPFS upload (in production, this would use real IPFS)
    const ipfsHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
    console.log(`\n📤 Simulated IPFS upload: ipfs://${ipfsHash}`);
    
    // Create NFT with IPFS URI
    const ipfsMint = {
      TransactionType: 'NFTokenMint',
      Account: wallet.address,
      URI: Buffer.from(`ipfs://${ipfsHash}`).toString('hex').toUpperCase(),
      Flags: 8, // Transferable
      NFTokenTaxon: 37, // Tool #37
      Fee: '12'
    };
    
    const prepared2 = await client.autofill(ipfsMint);
    const signed2 = wallet.sign(prepared2);
    const result2 = await client.submitAndWait(signed2.tx_blob);
    
    console.log(`✅ Minted IPFS NFT: ${result2.result.hash.substring(0, 10)}...`);
    
    // Get all NFTs
    console.log('\n📋 Fetching all NFTs...');
    const nfts = await client.request({
      command: 'account_nfts',
      account: wallet.address
    });
    
    console.log(`\nTotal NFTs owned: ${nfts.result.account_nfts.length}`);
    
    // Display NFT details
    for (const nft of nfts.result.account_nfts.slice(-2)) {
      const uri = Buffer.from(nft.URI, 'hex').toString();
      console.log(`\n🎨 NFT: ${nft.NFTokenID.substring(0, 16)}...`);
      console.log(`   Taxon: ${nft.NFTokenTaxon}`);
      console.log(`   URI: ${uri.substring(0, 50)}${uri.length > 50 ? '...' : ''}`);
    }
    
    // Test 3: With .env API keys (if available)
    console.log('\n\nTest 3: Check for IPFS Service Configuration');
    console.log('============================================');
    
    if (process.env.NFT_STORAGE_API_KEY) {
      console.log('✅ NFT.Storage API key configured');
    } else {
      console.log('⚠️  NFT.Storage API key not configured');
    }
    
    if (process.env.WEB3_STORAGE_API_KEY) {
      console.log('✅ Web3.Storage API key configured');
    } else {
      console.log('⚠️  Web3.Storage API key not configured');
    }
    
    if (process.env.PINATA_API_KEY) {
      console.log('✅ Pinata API key configured');
    } else {
      console.log('⚠️  Pinata API key not configured');
    }
    
    console.log(`\nDefault IPFS Service: ${process.env.IPFS_SERVICE || 'nftStorage'}`);
    console.log(`IPFS Gateway: ${process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'}`);
    
    console.log('\n✨ IPFS NFT testing complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

// Run the test
testIPFSNFT().catch(console.error);