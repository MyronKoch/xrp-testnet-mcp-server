import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('XRP account address')
});

export async function handleGetAccountInfo(
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
    
    const info = response.result as any;
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: info.account_data.Account,
          balance: `${parseInt(info.account_data.Balance) / 1000000} XRP`,
          sequence: info.account_data.Sequence,
          flags: info.account_data.Flags,
          ownerCount: info.account_data.OwnerCount,
          previousTxnID: info.account_data.PreviousTxnID,
          previousTxnLedger: info.account_data.PreviousTxnLgrSeq,
          reserve: {
            base: `${info.account_data.Reserve || 10} XRP`,
            owner: `${info.account_data.OwnerCount * 2} XRP`
          }
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get account info: ${error.message}`);
  }
}
