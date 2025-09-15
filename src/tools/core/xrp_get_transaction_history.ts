import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('XRP address'),
  limit: z.number().min(1).max(100).optional().default(10).describe('Number of transactions to return')
});

export async function handleGetTransactionHistory(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const response = await client.request({
      command: 'account_tx',
      account: parsed.address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: parsed.limit,
      forward: false
    });
    
    const transactions = (response.result as any).transactions?.map((tx: any) => ({
      hash: tx.tx?.hash || 'unknown',
      type: tx.tx?.TransactionType || 'unknown',
      from: tx.tx?.Account || 'unknown',
      to: tx.tx?.Destination || 'N/A',
      amount: tx.tx?.Amount ? (typeof tx.tx.Amount === 'string' ? 
        `${parseInt(tx.tx.Amount) / 1000000} XRP` : 
        `${tx.tx.Amount.value} ${tx.tx.Amount.currency}`) : 'N/A',
      fee: tx.tx?.Fee ? `${parseInt(tx.tx.Fee) / 1000000} XRP` : '0 XRP',
      ledger: tx.tx?.ledger_index || 0,
      timestamp: tx.tx?.date ? new Date(tx.tx.date * 1000 + 946684800000).toISOString() : 'N/A',
      result: tx.meta?.TransactionResult || 'unknown'
    })) || [];
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: parsed.address,
          count: transactions.length,
          transactions
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get transaction history: ${error.message}`);
  }
}
