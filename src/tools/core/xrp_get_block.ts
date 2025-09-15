import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  blockNumber: z.union([z.number(), z.string()]).optional().describe('Ledger index or "validated"')
});

export async function handleGetBlock(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const ledgerIndex = parsed.blockNumber || 'validated';
    
    const response = await client.request({
      command: 'ledger',
      ledger_index: ledgerIndex as any,
      transactions: true,
      expand: false
    } as any);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          number: (response.result as any).ledger.ledger_index,
          hash: (response.result as any).ledger.ledger_hash,
          timestamp: (response.result as any).ledger.close_time + 946684800, // XRP epoch offset
          transactions: (response.result as any).ledger.transactions?.length || 0,
          parentHash: (response.result as any).ledger.parent_hash,
          closeTime: (response.result as any).ledger.close_time_human
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get block: ${error.message}`);
  }
}
