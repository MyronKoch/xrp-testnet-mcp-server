#!/usr/bin/env node
/**
 * XRP Testnet MCP Server - Comprehensive Tool Testing Script
 * Tests all 11 MBPS v2.0 core tools
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

class XRPToolTester {
  constructor() {
    this.server = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log(`${colors.cyan}Starting XRP Testnet MCP Server...${colors.reset}`);
      
      this.server = spawn('node', ['dist/index.js'], {
        cwd: __dirname,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.server.stderr.once('data', (data) => {
        const message = data.toString();
        if (message.includes('running')) {
          console.log(`${colors.green}✓ Server started successfully${colors.reset}\n`);
          resolve();
        }
      });

      this.server.on('error', reject);
      
      setTimeout(() => reject(new Error('Server startup timeout')), 10000);
    });
  }

  async testTool(toolName, params = {}) {
    return new Promise((resolve) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      console.log(`${colors.cyan}Testing ${toolName}...${colors.reset}`);
      
      this.server.stdin.write(JSON.stringify(request) + '\n');

      const timeout = setTimeout(() => {
        console.log(`${colors.red}✗ Timeout for ${toolName}${colors.reset}`);
        this.results.failed++;
        this.results.errors.push(`${toolName}: Timeout`);
        resolve(false);
      }, 5000);

      const handler = (data) => {
        const response = data.toString();
        try {
          const parsed = JSON.parse(response);
          
          if (parsed.id === request.id) {
            clearTimeout(timeout);
            this.server.stdout.removeListener('data', handler);
            
            if (parsed.result) {
              console.log(`${colors.green}✓ ${toolName} passed${colors.reset}`);
              this.results.passed++;
              resolve(true);
            } else if (parsed.error) {
              console.log(`${colors.red}✗ ${toolName} failed: ${parsed.error.message}${colors.reset}`);
              this.results.failed++;
              this.results.errors.push(`${toolName}: ${parsed.error.message}`);
              resolve(false);
            }
          }
        } catch (e) {
          // Not JSON, continue listening
        }
      };

      this.server.stdout.on('data', handler);
    });
  }

  async runTests() {
    console.log(`${colors.bright}${colors.magenta}=== XRP Testnet MCP Server Tool Testing ===${colors.reset}\n`);

    try {
      await this.startServer();

      // Test core MBPS tools
      console.log(`${colors.bright}Testing Core MBPS v2.0 Tools (11 required):${colors.reset}\n`);

      // 1. Chain Info
      await this.testTool('xrp_get_chain_info');

      // 2. Balance (with test address)
      await this.testTool('xrp_get_balance', {
        address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
      });

      // 3. Transaction (will fail with invalid hash - expected)
      await this.testTool('xrp_get_transaction', {
        hash: '4D5D90890F8D49519E4151938601EF3D0B30B16CD6A519D9C99102C9FA77F7E0'
      });

      // 4. Block
      await this.testTool('xrp_get_block', {
        blockNumber: 'validated'
      });

      // 5. Validate Address
      await this.testTool('xrp_validate_address', {
        address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
      });

      // 6. Transaction History
      await this.testTool('xrp_get_transaction_history', {
        address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        limit: 5
      });

      // 7. Create Wallet
      await this.testTool('xrp_create_wallet');

      // 8. Help
      await this.testTool('xrp_help');

      // 9. Search Tools
      await this.testTool('xrp_search_tools', {
        query: 'wallet'
      });

      // 10. List Tools by Category
      await this.testTool('xrp_list_tools_by_category');

      // 11. Send Transaction (will fail without private key - expected)
      await this.testTool('xrp_send_transaction', {
        to: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        amount: '1'
      });

      // Print results
      console.log(`\n${colors.bright}=== Test Results ===${colors.reset}`);
      console.log(`${colors.green}Passed: ${this.results.passed}${colors.reset}`);
      console.log(`${colors.red}Failed: ${this.results.failed}${colors.reset}`);
      
      if (this.results.errors.length > 0) {
        console.log(`\n${colors.yellow}Errors:${colors.reset}`);
        this.results.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      }

      const totalTools = 11;
      const successRate = (this.results.passed / totalTools * 100).toFixed(1);
      
      console.log(`\n${colors.bright}Success Rate: ${successRate}% (${this.results.passed}/${totalTools} tools)${colors.reset}`);
      
      if (this.results.passed >= 9) {
        console.log(`${colors.green}${colors.bright}✓ MBPS v2.0 Compliance: PASSED${colors.reset}`);
      } else {
        console.log(`${colors.red}${colors.bright}✗ MBPS v2.0 Compliance: FAILED${colors.reset}`);
      }

    } catch (error) {
      console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
    } finally {
      if (this.server) {
        this.server.kill();
        console.log(`\n${colors.cyan}Server stopped${colors.reset}`);
      }
    }
  }
}

// Run tests
const tester = new XRPToolTester();
tester.runTests().catch(console.error);