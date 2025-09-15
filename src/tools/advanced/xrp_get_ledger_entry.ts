import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  ledger_hash: z.string().optional().describe('Ledger hash'),
  ledger_index: z.string().optional().describe('Ledger index or shortcut'),
  accounts: z.boolean().optional().describe('Include account info'),
  index: z.string().optional().describe('Ledger entry ID'),
  account_root: z.string().optional().describe('Account address for account root')
});

export async function handleGetLedgerEntry(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    // ledger_entry requires either index or account_root
    if (!parsed.index && !parsed.account_root) {
      // Default to getting validated ledger info
      const ledgerResponse = await client.request({
        command: 'ledger',
        ledger_index: (parsed.ledger_index || 'validated') as any,
        accounts: parsed.accounts || false,
        full: false
      } as any);
      
      const ledgerResult = ledgerResponse.result as any;
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ledgerHash: ledgerResult.ledger?.ledger_hash,
            ledgerIndex: ledgerResult.ledger_index,
            closeTime: ledgerResult.ledger?.close_time,
            parentHash: ledgerResult.ledger?.parent_hash,
            totalCoins: ledgerResult.ledger?.total_coins,
            transactionCount: ledgerResult.ledger?.transactions?.length || 0,
            note: 'No specific entry requested - showing ledger summary'
          }, null, 2)
        }]
      };
    }
    
    const params: any = { command: 'ledger_entry' };
    if (parsed.ledger_hash) params.ledger_hash = parsed.ledger_hash;
    if (parsed.ledger_index) params.ledger_index = parsed.ledger_index;
    if (parsed.index) params.index = parsed.index;
    if (parsed.account_root) params.account_root = parsed.account_root;
    
    const response = await client.request(params);
    const result = response.result;
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          ledgerEntry: result && typeof result === 'object' && 'node' in result ? 
            result.node : undefined,
          index: result && typeof result === 'object' && 'index' in result ? 
            result.index : undefined,
          ledgerIndex: result && typeof result === 'object' && 'ledger_index' in result ? 
            result.ledger_index : undefined
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get ledger entry: ${error.message}`);
  }
}
