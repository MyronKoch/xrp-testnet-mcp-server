import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  nft_id: z.string().describe('NFT Token ID'),
  amount: z.string().describe('Offer amount in drops'),
  flags: z.number().optional().default(1).describe('1 for sell offer, 0 for buy'),
  destination: z.string().optional().describe('Specific buyer/seller (optional)')
});

export async function handleCreateNFTOffer(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const offer: any = {
      TransactionType: 'NFTokenCreateOffer',
      Account: wallet.address,
      NFTokenID: parsed.nft_id,
      Amount: parsed.amount,
      Flags: parsed.flags,
      Fee: '12'
    };
    
    if (parsed.destination) {
      offer.Destination = parsed.destination;
    }
    
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
          offerType: parsed.flags === 1 ? 'sell' : 'buy',
          amount: parsed.amount
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to create NFT offer: ${error.message}`);
  }
}
