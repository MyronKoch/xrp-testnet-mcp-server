import { Client, Wallet, xrpToDrops } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  to: z.string().describe('Recipient XRP address'),
  amount: z.string().describe('Amount in XRP'),
  privateKey: z.string().optional().describe('Sender private key (seed)')
});

export async function handleSendTransaction(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    if (!parsed.privateKey) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Private key required for sending transactions',
            note: 'Use xrp_create_wallet to generate a test wallet, then fund it with xrp_fund_testnet_account'
          }, null, 2)
        }]
      };
    }
    
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const prepared = await client.autofill({
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Amount: xrpToDrops(parsed.amount),
      Destination: parsed.to
    });
    
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: (result.result as any).meta?.TransactionResult === 'tesSUCCESS',
          hash: result.result.hash,
          from: wallet.classicAddress,
          to: parsed.to,
          amount: `${parsed.amount} XRP`,
          fee: `${parseInt((result.result as any).Fee || '0') / 1000000} XRP`,
          ledger: (result.result as any).ledger_index,
          explorerUrl: `https://testnet.xrpl.org/transactions/${result.result.hash}`
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to send transaction: ${error.message}`);
  }
}
