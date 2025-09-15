import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  offer_sequence: z.number().describe('Sequence number of offer to cancel')
});

export async function handleCancelOrder(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const cancel = {
      TransactionType: 'OfferCancel' as const,
      Account: wallet.address,
      OfferSequence: parsed.offer_sequence,
      Fee: '12'
    };
    
    const prepared = await client.autofill(cancel);
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
          cancelledOffer: parsed.offer_sequence
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to cancel order: ${error.message}`);
  }
}
