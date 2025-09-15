import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  taker_gets: z.object({
    currency: z.string(),
    issuer: z.string().optional()
  }).describe('Currency being sold'),
  taker_pays: z.object({
    currency: z.string(),
    issuer: z.string().optional()
  }).describe('Currency being bought'),
  limit: z.number().optional().default(20).describe('Number of orders to return')
});

export async function handleGetOrderBook(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const response = await client.request({
      command: 'book_offers',
      taker_gets: parsed.taker_gets.currency === 'XRP' 
        ? { currency: 'XRP' } 
        : parsed.taker_gets,
      taker_pays: parsed.taker_pays.currency === 'XRP'
        ? { currency: 'XRP' }
        : parsed.taker_pays,
      limit: parsed.limit
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          pair: `${parsed.taker_gets.currency}/${parsed.taker_pays.currency}`,
          offers: response.result.offers?.map((offer: any) => ({
            account: offer.Account,
            takerGets: offer.TakerGets,
            takerPays: offer.TakerPays,
            quality: offer.quality,
            sequence: offer.Sequence
          })) || []
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get order book: ${error.message}`);
  }
}
