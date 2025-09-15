import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Sender private key (seed)'),
  destination: z.string().describe('Recipient address'),
  currency: z.string().describe('Currency code'),
  issuer: z.string().describe('Token issuer'),
  amount: z.string().describe('Amount to send')
});

export async function handleSendToken(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const payment = {
      TransactionType: 'Payment' as const,
      Account: wallet.address,
      Destination: parsed.destination,
      Amount: {
        currency: parsed.currency,
        issuer: parsed.issuer,
        value: parsed.amount
      },
      Fee: '12'
    };
    
    const prepared = await client.autofill(payment);
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
          sent: { 
            currency: parsed.currency, 
            amount: parsed.amount, 
            to: parsed.destination 
          }
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to send token: ${error.message}`);
  }
}
