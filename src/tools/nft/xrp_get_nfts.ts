import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('Account address')
});

export async function handleGetNFTs(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const response = await client.request({
      command: 'account_nfts',
      account: parsed.address
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: parsed.address,
          count: response.result.account_nfts?.length || 0,
          nfts: response.result.account_nfts?.map((nft: any) => ({
            id: nft.NFTokenID,
            uri: Buffer.from(nft.URI || '', 'hex').toString(),
            issuer: nft.Issuer,
            taxon: nft.NFTokenTaxon,
            serial: nft.nft_serial
          })) || []
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get NFTs: ${error.message}`);
  }
}
