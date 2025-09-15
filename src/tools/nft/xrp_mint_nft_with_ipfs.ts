import { Client } from 'xrpl';
import { z } from 'zod';
import { mintNFTWithIPFS } from '../../utils/ipfs-nft-tool.js';

const schema = z.object({
  privateKey: z.string().describe('Wallet private key for signing'),
  name: z.string().describe('NFT name'),
  description: z.string().describe('NFT description'),
  imageUrl: z.string().optional().describe('URL of image to upload to IPFS'),
  imagePath: z.string().optional().describe('Local path to image file'),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.union([z.string(), z.number()])
  })).optional().describe('NFT attributes/traits'),
  flags: z.number().optional().default(8).describe('NFT flags (8=transferable, 1=burnable)'),
  transferFee: z.number().optional().default(0).describe('Royalty in basis points (0-50000)'),
  taxon: z.number().optional().default(0).describe('Collection ID'),
  ipfsApiKey: z.string().optional().describe('API key for IPFS service (uses env if not provided)')
});

export async function handleMintNftWithIpfs(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    if (!parsed.imageUrl && !parsed.imagePath) {
      throw new Error('Either imageUrl or imagePath must be provided');
    }
    
    // Call the utility function with the correct signature
    const result = await mintNFTWithIPFS({
      seed: parsed.privateKey,
      name: parsed.name,
      description: parsed.description,
      imageUrl: parsed.imageUrl,
      imagePath: parsed.imagePath,
      attributes: parsed.attributes,
      transferFee: parsed.transferFee,
      flags: parsed.flags,
      taxon: parsed.taxon,
      ipfsApiKey: parsed.ipfsApiKey
    }, client);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: result.success,
          txHash: result.txHash,
          nftokenID: result.nftId,
          ipfs: {
            uri: result.uri,
            gatewayUrl: result.ipfsUrl,
            imageUri: result.uri.startsWith('ipfs://') ? result.uri : undefined
          },
          nft: {
            name: parsed.name,
            description: parsed.description,
            attributes: parsed.attributes
          },
          message: result.message
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to mint NFT with IPFS: ${error.message}`);
  }
}
