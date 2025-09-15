/**
 * Test Simple NFT Minting (without IPFS)
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const TEST_WALLET = {
  address: 'r9Rnn3xN7XYnN9Cpy2zRmXLSEN5dPdAWwb',
  seed: 'sEd7XzpAwMPRHfKYpSrfjWo5umg8Akt'
};

async function testSimpleNFT() {
  console.log('🚀 Testing Simple NFT Mint...\n');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js']
  });

  const client = new Client({
    name: 'xrp-simple-nft-test',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to XRP MCP Server\n');

    // Mint NFT with URI (no IPFS)
    console.log('🎨 Minting NFT with direct URI...');
    const mintResult = await client.callTool({
      name: 'xrp_mint_nft',
      arguments: {
        privateKey: TEST_WALLET.seed,
        uri: 'ipfs://QmTestHash123/metadata.json',
        flags: 8,
        transferFee: 500
      }
    });

    console.log('✅ NFT Minted Successfully!');
    console.log(JSON.stringify(mintResult, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testSimpleNFT();
