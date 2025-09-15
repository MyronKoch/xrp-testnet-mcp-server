import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  streams: z.array(z.string()).describe('Streams to subscribe: ledger, transactions, etc'),
  accounts: z.array(z.string()).optional().describe('Accounts to monitor')
});

export async function handleSubscribe(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const params: any = {
      command: 'subscribe',
      streams: parsed.streams
    };
    
    if (parsed.accounts) {
      params.accounts = parsed.accounts;
    }
    
    const response = await client.request(params);
    
    parsed.streams.forEach((stream: string) => {
      client.on(stream as any, (data: any) => {
        console.log(`Stream ${stream}:`, data);
      });
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          subscribed: true,
          streams: parsed.streams,
          accounts: parsed.accounts,
          result: response.result
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to subscribe: ${error.message}`);
  }
}
