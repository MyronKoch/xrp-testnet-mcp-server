import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  asset1: z.object({
    currency: z.string(),
    issuer: z.string().optional()
  }),
  asset2: z.object({
    currency: z.string(),
    issuer: z.string().optional()
  })
});

export async function handleGetAMMInfo(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const formattedAsset1 = parsed.asset1.currency === 'XRP' 
      ? { currency: 'XRP' } as const
      : { currency: parsed.asset1.currency, issuer: parsed.asset1.issuer || '' };
    
    const formattedAsset2 = parsed.asset2.currency === 'XRP'
      ? { currency: 'XRP' } as const
      : { currency: parsed.asset2.currency, issuer: parsed.asset2.issuer || '' };
    
    try {
      const response = await client.request({
        command: 'amm_info',
        asset: formattedAsset1,
        asset2: formattedAsset2
      });
      
      if (response.result && typeof response.result === 'object' && 
          'amm' in response.result && response.result.amm && 
          typeof response.result.amm === 'object') {
        const amm = response.result.amm as any;
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              ammAddress: amm.Account,
              lpToken: amm.LPTokenBalance,
              asset1Pool: amm.Asset,
              asset2Pool: amm.Asset2,
              tradingFee: amm.TradingFee,
              auctionSlot: amm.AuctionSlot
            }, null, 2)
          }]
        };
      } else {
        // No AMM exists for this pair - return informative response
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'no_amm',
              message: 'No AMM pool exists for this asset pair on testnet',
              asset1: formattedAsset1,
              asset2: formattedAsset2,
              note: 'AMM pools are limited on testnet. Try XRP paired with common test tokens.'
            }, null, 2)
          }]
        };
      }
    } catch (error: any) {
      // Handle specific XRP Ledger errors
      if (error.message?.includes('Account not found') || 
          error.data?.error === 'actNotFound' ||
          error.message?.includes('actNotFound')) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'no_amm',
              message: 'No AMM pool exists for this asset pair',
              asset1: formattedAsset1,
              asset2: formattedAsset2,
              note: 'This is normal on testnet where AMM pools are limited'
            }, null, 2)
          }]
        };
      }
      throw error;
    }
  } catch (error: any) {
    throw new Error(`Failed to get AMM info: ${error.message}`);
  }
}
