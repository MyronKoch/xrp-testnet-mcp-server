import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  owner: z.string().describe('Escrow creator address'),
  escrow_sequence: z.number().describe('Escrow sequence number'),
  fulfillment: z.string().optional().describe('Fulfillment for condition (if required)')
});

export async function handleFinishEscrow(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const finish: any = {
      TransactionType: 'EscrowFinish',
      Account: wallet.address,
      Owner: parsed.owner,
      OfferSequence: parsed.escrow_sequence,
      Fee: '12'
    };
    
    if (parsed.fulfillment) {
      finish.Fulfillment = parsed.fulfillment;
    }
    
    const prepared = await client.autofill(finish);
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
          finishedEscrow: { 
            owner: parsed.owner, 
            sequence: parsed.escrow_sequence 
          }
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to finish escrow: ${error.message}`);
  }
}
