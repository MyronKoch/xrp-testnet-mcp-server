import { isValidClassicAddress } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('Address to validate')
});

export async function handleValidateAddress(
  args: any,
  client?: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const isValid = isValidClassicAddress(parsed.address);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: parsed.address,
          valid: isValid,
          format: isValid ? 'classic' : 'invalid',
          network: isValid ? 'XRP Ledger' : undefined,
          error: !isValid ? 'Invalid XRP address format' : undefined
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to validate address: ${error.message}`);
  }
}
