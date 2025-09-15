import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('Account address'),
  type: z.string().optional().describe('Filter by object type')
});

export async function handleGetAccountObjects(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const params: any = {
      command: 'account_objects',
      account: parsed.address
    };
    
    if (parsed.type) {
      params.type = parsed.type;
    }
    
    const response = await client.request(params);
    const result = response.result;
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: parsed.address,
          objects: result && typeof result === 'object' && 'account_objects' in result ? 
            result.account_objects : [],
          ledgerIndex: result && typeof result === 'object' && 'ledger_index' in result ? 
            result.ledger_index : undefined
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get account objects: ${error.message}`);
  }
}
