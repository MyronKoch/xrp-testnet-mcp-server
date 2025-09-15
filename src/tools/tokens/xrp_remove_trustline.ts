import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  currency: z.string().describe('Currency code'),
  issuer: z.string().describe('Token issuer address')
});

export async function handleRemoveTrustline(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const remove = {
      TransactionType: 'TrustSet' as const,
      Account: wallet.address,
      LimitAmount: {
        currency: parsed.currency,
        issuer: parsed.issuer,
        value: '0'
      },
      Fee: '12'
    };
    
    const prepared = await client.autofill(remove);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: result.result.meta && typeof result.result.meta === 'object' && 
            'TransactionResult' in result.result.meta ? 
            result.result.meta.TransactionResult === 'tesSUCCESS' : false,
          txHash: result.result.hash,
          removed: { 
            currency: parsed.currency, 
            issuer: parsed.issuer 
          }
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to remove trustline: ${error.message}`);
  }
}
