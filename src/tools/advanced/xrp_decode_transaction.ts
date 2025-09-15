import { decode, dropsToXrp } from 'xrpl';
import { z } from 'zod';
import { Client } from 'xrpl';

const schema = z.object({
  tx_blob: z.string().describe('Signed transaction blob')
});

export async function handleDecodeTransaction(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const decoded = decode(parsed.tx_blob);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          decoded,
          txType: decoded.TransactionType,
          account: decoded.Account,
          fee: decoded.Fee ? dropsToXrp(String(decoded.Fee)) : undefined
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to decode transaction: ${error.message}`);
  }
}
