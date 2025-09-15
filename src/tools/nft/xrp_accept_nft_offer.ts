import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  offer_id: z.string().describe('NFT Offer ID to accept')
});

export async function handleAcceptNFTOffer(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const accept = {
      TransactionType: 'NFTokenAcceptOffer' as const,
      Account: wallet.address,
      NFTokenSellOffer: parsed.offer_id,
      Fee: '12'
    };
    
    const prepared = await client.autofill(accept);
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
          acceptedOffer: parsed.offer_id
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to accept NFT offer: ${error.message}`);
  }
}
