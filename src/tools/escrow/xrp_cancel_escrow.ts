import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  owner: z.string().describe('Escrow creator address'),
  escrow_sequence: z.number().describe('Escrow sequence number')
});

export async function handleCancelEscrow(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const cancel = {
      TransactionType: 'EscrowCancel' as const,
      Account: wallet.address,
      Owner: parsed.owner,
      OfferSequence: parsed.escrow_sequence,
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
          cancelledEscrow: { 
            owner: parsed.owner, 
            sequence: parsed.escrow_sequence 
          }
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to cancel escrow: ${error.message}`);
  }
}
