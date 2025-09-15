import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  taker_gets: z.object({
    currency: z.string(),
    issuer: z.string().optional(),
    value: z.string()
  }).describe('Currency being sold'),
  taker_pays: z.object({
    currency: z.string(),
    issuer: z.string().optional(),
    value: z.string()
  }).describe('Currency being bought')
});

export async function handlePlaceOrder(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const offer = {
      TransactionType: 'OfferCreate' as const,
      Account: wallet.address,
      TakerGets: parsed.taker_gets.currency === 'XRP' 
        ? parsed.taker_gets.value
        : {
            currency: parsed.taker_gets.currency,
            value: parsed.taker_gets.value,
            issuer: parsed.taker_gets.issuer || ''
          },
      TakerPays: parsed.taker_pays.currency === 'XRP'
        ? parsed.taker_pays.value  
        : {
            currency: parsed.taker_pays.currency,
            value: parsed.taker_pays.value,
            issuer: parsed.taker_pays.issuer || ''
          },
      Fee: '12'
    };
    
    const prepared = await client.autofill(offer);
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
          offerSequence: (prepared as any).Sequence,
          takerGets: parsed.taker_gets,
          takerPays: parsed.taker_pays
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to place order: ${error.message}`);
  }
}
