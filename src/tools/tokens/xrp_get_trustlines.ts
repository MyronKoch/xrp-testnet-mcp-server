import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('Account address')
});

export async function handleGetTrustlines(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const response = await client.request({
      command: 'account_lines',
      account: parsed.address
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: parsed.address,
          trustlines: response.result.lines?.map((line: any) => ({
            currency: line.currency,
            issuer: line.account,
            balance: line.balance,
            limit: line.limit,
            limit_peer: line.limit_peer
          })) || []
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get trustlines: ${error.message}`);
  }
}
