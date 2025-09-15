#!/usr/bin/env node

/**
 * Test Conversation Guidance Tool
 * Tests the new xrp_get_conversation_guidance tool
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function testConversationGuidance() {
  console.log('🧪 Testing Conversation Guidance Tool\n');
  
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
    name: 'test-conversation-guidance',
    version: '1.0.0'
  }, {
    capabilities: {}
  });
  
  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP server\n');
    
    // List all tools to see if our new tool is there
    console.log('📋 Checking available tools...');
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} total tools`);
    
    // Find the conversation guidance tool
    const guidanceTool = tools.tools.find(t => t.name === 'xrp_get_conversation_guidance');
    const ipfsNftTool = tools.tools.find(t => t.name === 'xrp_mint_nft_with_ipfs');
    
    if (guidanceTool) {
      console.log('✅ Found xrp_get_conversation_guidance tool');
      console.log('   Description:', guidanceTool.description);
    } else {
      console.log('❌ xrp_get_conversation_guidance tool NOT found');
    }
    
    if (ipfsNftTool) {
      console.log('✅ Found xrp_mint_nft_with_ipfs tool');
    } else {
      console.log('❌ xrp_mint_nft_with_ipfs tool NOT found');
    }
    
    console.log('\n📝 Testing conversation guidance for NFT creation...');
    
    if (guidanceTool) {
      try {
        const result = await client.callTool({
          name: 'xrp_get_conversation_guidance',
          arguments: {
            operation: 'nft_creation',
            user_request: 'I want to create an NFT of a dragon'
          }
        });
        
        console.log('✅ Conversation guidance successful!');
        console.log('Response:', JSON.stringify(result.content[0], null, 2));
      } catch (error) {
        console.error('❌ Conversation guidance failed:', error.message);
      }
    }
    
    // Test other operations
    const operations = ['payment', 'trading', 'escrow', 'general'];
    
    for (const operation of operations) {
      console.log(`\n📝 Testing guidance for: ${operation}`);
      
      if (guidanceTool) {
        try {
          const result = await client.callTool({
            name: 'xrp_get_conversation_guidance',
            arguments: {
              operation: operation
            }
          });
          
          console.log(`✅ ${operation} guidance successful`);
          const guidance = JSON.parse(result.content[0].text);
          console.log(`   Context: ${guidance.context}`);
        } catch (error) {
          console.error(`❌ ${operation} guidance failed:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    await client.close();
    console.log('\n🏁 Test complete!');
  }
}

// Run the test
testConversationGuidance().catch(console.error);