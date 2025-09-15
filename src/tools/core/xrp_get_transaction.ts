import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  hash: z.string().describe('Transaction hash')
});

export async function handleGetTransaction(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const response = await client.request({
      command: 'tx',
      transaction: parsed.hash
    });
    
    const tx = response.result as any;
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          hash: tx.hash,
          status: tx.meta?.TransactionResult === 'tesSUCCESS' ? 'success' : 'failed',
          blockNumber: tx.ledger_index,
          from: tx.Account,
          to: tx.Destination,
          value: tx.Amount ? (typeof tx.Amount === 'string' ? 
            `${parseInt(tx.Amount) / 1000000} XRP` : 
            `${tx.Amount.value} ${tx.Amount.currency}`) : 'N/A',
          fee: `${parseInt(tx.Fee || '0') / 1000000} XRP`,
          type: tx.TransactionType,
          timestamp: new Date((tx.date || 0) * 1000 + 946684800000).toISOString()
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get transaction: ${error.message}`);
  }
}
