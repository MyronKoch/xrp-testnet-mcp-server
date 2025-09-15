import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('XRP address')
});

export async function handleGetBalance(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const response = await client.request({
      command: 'account_info',
      account: parsed.address,
      ledger_index: 'validated'
    });
    
    // Get server info for reserve amounts
    const serverInfo = await client.request({ command: 'server_info' });
    const reserveBaseXRP = parseFloat((serverInfo.result as any).info.validated_ledger?.reserve_base_xrp || '1');
    const reserveIncXRP = parseFloat((serverInfo.result as any).info.validated_ledger?.reserve_inc_xrp || '0.2');
    
    const accountData = response.result.account_data;
    const balanceDrops = accountData.Balance;
    const balanceXRP = parseInt(balanceDrops) / 1000000;
    
    // Calculate actual reserves
    const ownerCount = accountData.OwnerCount || 0;
    const totalReserve = reserveBaseXRP + (ownerCount * reserveIncXRP);
    const availableXRP = Math.max(0, balanceXRP - totalReserve);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: parsed.address,
          balance: `${balanceXRP} XRP`,
          balanceRaw: balanceDrops,
          symbol: 'XRP',
          reserve: {
            base: `${reserveBaseXRP} XRP`,
            owner: `${reserveIncXRP} XRP per object`,
            ownerCount: ownerCount,
            total: `${totalReserve} XRP`
          },
          available: `${availableXRP} XRP`,
          sequence: accountData.Sequence
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}
