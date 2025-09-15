describe('XRP Testnet MCP Server', () => {
  it('should load without errors', () => {
    expect(() => {
      require('../src/index');
    }).not.toThrow();
  });

  it('should export expected MCP server structure', async () => {
    const serverModule = await import('../src/index');
    expect(serverModule).toBeDefined();
  });

  it('should have all required core tool imports', async () => {
    // Test that core tools can be imported
    const coreTools = [
      '../src/tools/core/xrp-get_balance.js',
      '../src/tools/core/xrp-get_transaction.js',
      '../src/tools/core/xrp-validate_address.js',
      '../src/tools/core/xrp-get_chain_info.js',
      '../src/tools/core/xrp-get_block.js'
    ];

    for (const tool of coreTools) {
      await expect(import(tool)).resolves.toBeDefined();
    }
  });

  it('should have XRPL client available', () => {
    const { Client } = require('xrpl');
    expect(Client).toBeDefined();
    
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    expect(client).toHaveProperty('connect');
    expect(client).toHaveProperty('disconnect');
  });
});