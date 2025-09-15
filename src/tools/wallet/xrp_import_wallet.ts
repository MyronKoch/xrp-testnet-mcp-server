import { Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  seed: z.string().describe('Wallet seed (starts with s)')
});

export async function handleImportWallet(
  args: any,
  client?: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.seed);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: wallet.address,
          publicKey: wallet.publicKey,
          seed: wallet.seed,
          classicAddress: wallet.classicAddress
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Invalid seed: ${error.message}`);
  }
}
