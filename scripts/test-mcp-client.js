#!/usr/bin/env node

/**
 * MCP Client Test for XRP Testnet Server
 * Simulates how a language model would interact with the MCP server
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');

async function testMCPTools() {
  console.log('🚀 Starting MCP Client Test\n');
  
  // Start the MCP server
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', 'src/index.ts'],
    env: {
      ...process.env,
      XRP_NETWORK: 'testnet'
    }
  });
  
  const client = new Client({
    name: 'test-mcp-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });
  
  await client.connect(transport);
  console.log('✅ Connected to MCP server\n');
  
  // List available tools
  console.log('📋 Available Tools:');
  const tools = await client.listTools();
  console.log(`Found ${tools.tools.length} tools\n`);
  
  // Find our IPFS NFT tool
  const ipfsTool = tools.tools.find(t => t.name === 'xrp_mint_nft_with_ipfs');
  if (ipfsTool) {
    console.log('✅ Found xrp_mint_nft_with_ipfs tool (#37)');
    console.log('Schema:', JSON.stringify(ipfsTool.inputSchema, null, 2));
  }
  
  // Test Tool #1: Get Balance
  console.log('\n📊 Test 1: Get Balance');
  try {
    const balanceResult = await client.callTool({
      name: 'xrp_get_balance',
      arguments: {
        address: 'rJWhqoYdNv84sbECTHKJDDFxPDhXLhVvKB'
      }
    });
    console.log('Balance:', balanceResult.content[0].text);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test Tool #37: IPFS NFT (prepare only)
  console.log('\n🎨 Test 2: Prepare NFT with IPFS');
  try {
    const nftResult = await client.callTool({
      name: 'xrp_mint_nft_with_ipfs',
      arguments: {
        address: 'rJWhqoYdNv84sbECTHKJDDFxPDhXLhVvKB',
        metadata: {
          name: 'Test NFT from MCP Client',
          description: 'Testing MCP integration',
          image: 'https://via.placeholder.com/400',
          attributes: [
            { trait_type: 'Source', value: 'MCP Client' },
            { trait_type: 'Tool', value: '#37' }
          ]
        },
        service: 'nftStorage',
        uploadImage: false  // Don't actually upload
      }
    });
    console.log('NFT Result:', JSON.stringify(nftResult.content[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test Tool #3: Get Server Info
  console.log('\n🌐 Test 3: Get Server Info');
  try {
    const serverResult = await client.callTool({
      name: 'xrp_get_server_info',
      arguments: {}
    });
    console.log('Server:', JSON.parse(serverResult.content[0].text).info.complete_ledgers);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await client.close();
  console.log('\n✅ MCP Client test complete!');
}

// Run the test
testMCPTools().catch(console.error);