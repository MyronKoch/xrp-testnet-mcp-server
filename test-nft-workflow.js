/**
 * Test XRP NFT Image Generation & IPFS Minting Workflow
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const TEST_WALLET = {
  address: 'r9Rnn3xN7XYnN9Cpy2zRmXLSEN5dPdAWwb',
  seed: 'sEd7XzpAwMPRHfKYpSrfjWo5umg8Akt'
};

async function testNFTWorkflow() {
  console.log('🚀 Starting XRP NFT Workflow Test...\n');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js']
  });

  const client = new Client({
    name: 'xrp-nft-test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to XRP MCP Server\n');

    // Step 1: Generate NFT Image
    console.log('📸 Step 1: Generating NFT Image...');
    const imageGenResult = await client.callTool({
      name: 'xrp_generate_nft_image',
      arguments: {
        prompt: 'A majestic golden dragon flying over a crystal mountain peak at sunset, digital art, highly detailed, fantasy style',
        style: 'fantasy',
        aspectRatio: '1:1',
        quality: 'high'
      }
    });

    console.log('Image Generation Result:', JSON.stringify(imageGenResult, null, 2));

    if (!imageGenResult.content || imageGenResult.content.length === 0) {
      throw new Error('No image generated');
    }

    const imageData = JSON.parse(imageGenResult.content[0].text);
    const imageUrl = imageData.imageUrls?.[0] || imageData.imageUrl;

    console.log(`✅ Image generated: ${imageUrl}\n`);

    // Step 2: Mint NFT with IPFS
    console.log('🎨 Step 2: Minting NFT with IPFS upload...');
    const mintResult = await client.callTool({
      name: 'xrp_mint_nft_with_ipfs',
      arguments: {
        privateKey: TEST_WALLET.seed,
        imageUrl: imageUrl,
        name: 'Dragon of Crystal Peak #1',
        description: 'A legendary dragon NFT minted on XRP Ledger with AI-generated artwork',
        attributes: [
          { trait_type: 'Element', value: 'Fire' },
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Power Level', value: 9500 }
        ],
        transferFee: 500, // 5% royalty
        flags: 8 // Transferable
      }
    });

    console.log('NFT Mint Result:', JSON.stringify(mintResult, null, 2));
    console.log('\n✅ NFT Workflow Complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.close();
    process.exit(0);
  }
}

testNFTWorkflow();
