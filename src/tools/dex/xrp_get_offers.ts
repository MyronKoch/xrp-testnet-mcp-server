import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('Account address')
});

export async function handleGetOffers(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const response = await client.request({
      command: 'account_offers',
      account: parsed.address
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: parsed.address,
          offers: response.result.offers?.map((offer: any) => ({
            seq: offer.seq,
            flags: offer.flags,
            taker_gets: offer.taker_gets,
            taker_pays: offer.taker_pays,
            quality: offer.quality,
            expiration: offer.expiration
          })) || []
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get offers: ${error.message}`);
  }
}
