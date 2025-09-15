import { Client, Wallet, xrpToDrops } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Sender private key (seed)'),
  destination: z.string().describe('Recipient address'),
  amount: z.string().describe('Amount in XRP'),
  condition: z.string().optional().describe('Crypto condition (optional)'),
  finish_after: z.number().optional().describe('Unix timestamp when escrow can be finished'),
  cancel_after: z.number().optional().describe('Unix timestamp when escrow can be cancelled')
});

export async function handleCreateEscrow(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const escrow: any = {
      TransactionType: 'EscrowCreate',
      Account: wallet.address,
      Destination: parsed.destination,
      Amount: xrpToDrops(parsed.amount),
      Fee: '12'
    };
    
    if (parsed.condition) escrow.Condition = parsed.condition;
    if (parsed.finish_after) escrow.FinishAfter = parsed.finish_after;
    if (parsed.cancel_after) escrow.CancelAfter = parsed.cancel_after;
    
    const prepared = await client.autofill(escrow);
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
          escrowSequence: prepared.Sequence,
          amount: parsed.amount,
          destination: parsed.destination
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to create escrow: ${error.message}`);
  }
}
