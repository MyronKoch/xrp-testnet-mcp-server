#!/usr/bin/env node
import { spawn } from 'child_process';

async function testServer() {
  console.log('Testing XRP Testnet MCP Server...\n');
  
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Send list tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 1,
    params: {}
  };

  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  let output = '';
  server.stdout.on('data', (data) => {
    output += data.toString();
    try {
      const lines = output.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.includes('jsonrpc')) {
          const response = JSON.parse(line);
          if (response.result && response.result.tools) {
            console.log(`✅ Server responded with ${response.result.tools.length} tools\n`);
            
            // Group tools by category
            const categories = {};
            response.result.tools.forEach(tool => {
              const category = tool.name.split('_')[1] || 'other';
              if (!categories[category]) categories[category] = [];
              categories[category].push(tool.name);
            });
            
            console.log('Tools by category:');
            Object.keys(categories).sort().forEach(cat => {
              console.log(`\n${cat.toUpperCase()} (${categories[cat].length} tools):`);
              categories[cat].sort().forEach(tool => {
                console.log(`  - ${tool}`);
              });
            });
            
            server.kill();
            process.exit(0);
          }
        }
      }
    } catch (e) {
      // Continue accumulating output
    }
  });

  server.stderr.on('data', (data) => {
    const msg = data.toString();
    if (!msg.includes('Connected to XRP Ledger') && !msg.includes('XRP Testnet MCP Server running')) {
      console.error('Server error:', msg);
    }
  });

  setTimeout(() => {
    console.error('Timeout waiting for server response');
    server.kill();
    process.exit(1);
  }, 5000);
}

testServer().catch(console.error);