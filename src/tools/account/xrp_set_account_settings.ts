import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Account private key (seed)'),
  domain: z.string().optional().describe('Domain associated with account'),
  email_hash: z.string().optional().describe('MD5 hash of email'),
  message_key: z.string().optional().describe('Public key for messages'),
  transfer_fee: z.number().optional().describe('Transfer fee (0-100000)'),
  require_auth: z.boolean().optional().describe('Require authorization'),
  require_dest_tag: z.boolean().optional().describe('Require destination tag')
});

export async function handleSetAccountSettings(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const settings: any = {
      TransactionType: 'AccountSet',
      Account: wallet.address,
      Fee: '12'
    };
    
    if (parsed.domain) {
      settings.Domain = Buffer.from(parsed.domain).toString('hex').toUpperCase();
    }
    if (parsed.email_hash) {
      settings.EmailHash = parsed.email_hash;
    }
    if (parsed.message_key) {
      settings.MessageKey = parsed.message_key;
    }
    if (parsed.transfer_fee !== undefined) {
      settings.TransferFee = parsed.transfer_fee;
    }
    
    let flags = 0;
    if (parsed.require_auth) flags |= 2; // asfRequireAuth
    if (parsed.require_dest_tag) flags |= 1; // asfRequireDest
    if (flags > 0) settings.SetFlag = flags;
    
    const prepared = await client.autofill(settings);
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
          settings: settings
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to set account settings: ${error.message}`);
  }
}
