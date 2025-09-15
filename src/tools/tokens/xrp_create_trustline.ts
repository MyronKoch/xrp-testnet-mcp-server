import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  currency: z.string().describe('Currency code (3 chars)'),
  issuer: z.string().describe('Token issuer address'),
  limit: z.string().describe('Maximum amount to hold')
});

export async function handleCreateTrustline(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const trustline = {
      TransactionType: 'TrustSet' as const,
      Account: wallet.address,
      LimitAmount: {
        currency: parsed.currency,
        issuer: parsed.issuer,
        value: parsed.limit
      }
    };
    
    const prepared = await client.autofill(trustline);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: (result.result as any).meta?.TransactionResult === 'tesSUCCESS',
          txHash: result.result.hash,
          trustline: {
            currency: parsed.currency,
            issuer: parsed.issuer,
            limit: parsed.limit
          }
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to create trustline: ${error.message}`);
  }
}
