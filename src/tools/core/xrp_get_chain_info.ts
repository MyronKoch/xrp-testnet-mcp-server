import { Client } from 'xrpl';

export async function handleGetChainInfo(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const serverInfo = await client.request({ command: 'server_info' });
    const ledger = await client.request({ command: 'ledger', ledger_index: 'validated' });
    const fees = await client.request({ command: 'fee' });
    
    // Network ID 0 = mainnet, 1 = testnet, 2 = devnet
    const networkId = (serverInfo.result as any).info.network_id;
    const networkName = networkId === 0 ? 'mainnet' : 
                       networkId === 1 ? 'testnet' : 
                       networkId === 2 ? 'devnet' : 
                       'unknown';
    
    const welcomeMessage = `Welcome to the XRP Ledger MCP server! This server provides comprehensive tools for interacting with XRP Ledger, a decentralized blockchain optimized for fast, low-cost payments and tokenization.

## Key Features:
- **Fast Finality**: 3-5 second settlement with immediate confirmation
- **Low Fees**: Minimal transaction costs (fractions of a penny)
- **Payment Focus**: Optimized for cross-border payments and remittances
- **DEX Built-In**: Native decentralized exchange for asset trading
- **Advanced Features**: Escrow, payment channels, trustlines, and NFT support

This server offers tools for wallet management, XRP transfers, token operations, NFT creation with IPFS, DEX trading, escrow, and payment channels.`;

    const chainInfo = {
      chain: 'XRP Ledger',
      network: networkName,
      current_ledger: {
        index: (ledger.result as any).ledger_index,
        hash: (ledger.result as any).ledger.ledger_hash,
        close_time: (ledger.result as any).ledger.close_time_human,
        close_time_unix: (ledger.result as any).ledger.close_time,
        transactions: (ledger.result as any).ledger?.transactions?.length || 0
      },
      server_state: (serverInfo.result as any).info.server_state,
      validated_ledger: (serverInfo.result as any).info.validated_ledger?.seq,
      reserves: {
        base: (serverInfo.result as any).info.validated_ledger?.reserve_base_xrp || '10',
        owner: (serverInfo.result as any).info.validated_ledger?.reserve_inc_xrp || '2'
      },
      fees: {
        base: (fees.result as any).drops.base_fee,
        median: (fees.result as any).drops.median_fee,
        minimum: (fees.result as any).drops.minimum_fee,
        open_ledger: (fees.result as any).drops.open_ledger_fee
      },
      build_version: (serverInfo.result as any).info.build_version,
      complete_ledgers: (serverInfo.result as any).info.complete_ledgers,
      network_id: (serverInfo.result as any).info.network_id,
      time: (serverInfo.result as any).info.time
    };

    return {
      content: [{
        type: 'text',
        text: welcomeMessage + '\n\n' + JSON.stringify(chainInfo, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get chain info: ${error.message}`);
  }
}
