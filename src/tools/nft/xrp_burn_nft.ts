import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Owner private key (seed)'),
  nft_id: z.string().describe('NFT Token ID to burn')
});

export async function handleBurnNFT(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const burn = {
      TransactionType: 'NFTokenBurn' as const,
      Account: wallet.address,
      NFTokenID: parsed.nft_id,
      Fee: '12'
    };
    
    const prepared = await client.autofill(burn);
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
          burned: parsed.nft_id
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to burn NFT: ${error.message}`);
  }
}
