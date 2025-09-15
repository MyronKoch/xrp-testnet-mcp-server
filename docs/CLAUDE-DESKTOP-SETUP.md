# Setting Up XRP MCP Server with Claude Desktop

## Configuration Location

Add to: `~/Library/Application Support/Claude/claude_desktop_config.json`

## Configuration

```json
{
  "mcpServers": {
    "xrp-testnet": {
      "command": "npx",
      "args": [
        "tsx",
        "/Users/m3/Documents/GitHub/MCP/01-BLOCKCHAIN-MCP-ECOSYSTEM/servers/testnet/xrp-testnet-mcp-server/src/index.ts"
      ],
      "env": {
        "XRP_NETWORK": "testnet",
        "NFT_STORAGE_API_KEY": "your-key-here",
        "TRANSACTION_MODE": "prepare_only"
      }
    }
  }
}
```

## After Adding Configuration

1. Restart Claude Desktop
2. You should see "xrp-testnet" in the MCP servers list
3. Tools will be available directly in chat

## Testing in Chat

Once configured, you can use commands like:

```
"Get the balance of address rJWhqoYdNv84sbECTHKJDDFxPDhXLhVvKB on XRP testnet"

"Mint an NFT with this metadata: {name: 'Test NFT', description: 'Testing from Claude'}"

"Get information about the latest block on XRP testnet"
```

## Important Notes

- Tools will work WITHOUT needing to use the MCP Inspector
- Claude will automatically call the appropriate XRP tools
- Transactions will be returned unsigned (safe mode)
- You'll need to sign transactions externally