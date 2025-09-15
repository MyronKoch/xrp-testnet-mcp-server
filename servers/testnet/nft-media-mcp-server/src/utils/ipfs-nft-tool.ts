/**
 * IPFS NFT Upload Tool for XRP Ledger
 * Handles image upload to IPFS and NFT minting
 */

import * as xrpl from 'xrpl';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// Free IPFS services configuration
const IPFS_SERVICES = {
  // NFT.Storage - Best for NFTs, completely free
  nftStorage: {
    url: 'https://api.nft.storage/upload',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`
    })
  },
  
  // Web3.Storage - Also free
  web3Storage: {
    url: 'https://api.web3.storage/upload',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`
    })
  },
  
  // Pinata - 1GB free (using legacy API - public by default)
  pinata: {
    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    headers: (apiKey: string, secret: string) => ({
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secret
    })
  }
};

/**
 * Upload image to IPFS using free services
 */
export async function uploadToIPFS(
  imagePathOrUrl: string,
  metadata: any,
  service: 'nftStorage' | 'web3Storage' | 'pinata' = 'nftStorage',
  apiKey?: string
): Promise<{ imageHash: string, metadataHash: string }> {
  
  // Use API key from environment if not provided
  const effectiveApiKey = apiKey || 
    (service === 'nftStorage' ? process.env.NFT_STORAGE_API_KEY :
     service === 'web3Storage' ? process.env.WEB3_STORAGE_API_KEY :
     process.env.PINATA_API_KEY);
  
  // Require API key - no mocking
  if (!effectiveApiKey) {
    throw new Error(`IPFS API key required for ${service}. Set ${service === 'pinata' ? 'PINATA_API_KEY' : service === 'web3Storage' ? 'WEB3_STORAGE_API_KEY' : 'NFT_STORAGE_API_KEY'} in environment variables.`);
  }

  try {
    // Step 1: Upload image
    const imageForm = new FormData();

    if (imagePathOrUrl.startsWith('http')) {
      // Download image first as buffer
      try {
        const response = await axios.get(imagePathOrUrl, {
          responseType: 'arraybuffer',
          timeout: 10000
        });
        const buffer = Buffer.from(response.data);
        // Use short filename to avoid "filename too long" errors with Pinata
        const filename = `nft-image-${Date.now()}.jpg`;
        imageForm.append('file', buffer, filename);
      } catch (err) {
        throw new Error(`Failed to download image from URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      // Local file - check if exists
      if (!fs.existsSync(imagePathOrUrl)) {
        throw new Error(`Local file not found: ${imagePathOrUrl}`);
      }
      imageForm.append('file', fs.createReadStream(imagePathOrUrl));
    }
    
    const serviceConfig = IPFS_SERVICES[service];

    // Handle Pinata which needs both key and secret
    let secret = '';
    if (service === 'pinata') {
      secret = process.env.PINATA_SECRET_KEY || '';
      if (!secret) {
        throw new Error('PINATA_SECRET_KEY is required for Pinata uploads. Set it in your .env file.');
      }
    }

    const headers = service === 'pinata'
      ? { ...serviceConfig.headers(effectiveApiKey, secret), ...imageForm.getHeaders() }
      : { ...serviceConfig.headers(effectiveApiKey, ''), ...imageForm.getHeaders() };

    const imageResponse = await axios.post(
      serviceConfig.url,
      imageForm,
      { headers }
    );

    // Extract CID from response (all services use IpfsHash or cid field)
    const imageHash = imageResponse.data.IpfsHash || imageResponse.data.cid;
    
    // Step 2: Create and upload metadata
    const fullMetadata = {
      ...metadata,
      image: `ipfs://${imageHash}`
    };
    
    const metadataForm = new FormData();
    metadataForm.append('file', Buffer.from(JSON.stringify(fullMetadata, null, 2)), 'metadata.json');

    // Use same headers for metadata upload
    const metadataHeaders = service === 'pinata'
      ? { ...serviceConfig.headers(effectiveApiKey, secret), ...metadataForm.getHeaders() }
      : { ...serviceConfig.headers(effectiveApiKey, ''), ...metadataForm.getHeaders() };

    const metadataResponse = await axios.post(
      serviceConfig.url,
      metadataForm,
      { headers: metadataHeaders }
    );

    // Extract CID from response (all services use IpfsHash or cid field)
    const metadataHash = metadataResponse.data.IpfsHash || metadataResponse.data.cid;
    
    return {
      imageHash,
      metadataHash
    };
  } catch (error) {
    // Provide detailed error information
    const errorDetails = error && typeof error === 'object' && 'response' in error ? {
      status: (error as any).response?.status,
      statusText: (error as any).response?.statusText,
      data: JSON.stringify((error as any).response?.data)
    } : {};

    throw new Error(`IPFS upload failed (${service}): ${error instanceof Error ? error.message : String(error)}${Object.keys(errorDetails).length ? ` - ${JSON.stringify(errorDetails)}` : ''}`);
  }
}

/**
 * Complete NFT minting tool with IPFS integration
 */
export async function mintNFTWithIPFS(args: {
  seed: string;
  imageUrl?: string;
  imagePath?: string;
  name: string;
  description: string;
  attributes?: Array<{ trait_type: string; value: any }>;
  transferFee?: number;
  flags?: number;
  taxon?: number;
  ipfsApiKey?: string;
}, client: xrpl.Client) {
  
  const wallet = xrpl.Wallet.fromSeed(args.seed);
  
  // Build metadata
  const metadata = {
    name: args.name,
    description: args.description,
    attributes: args.attributes || [],
    created_by: 'XRP MCP Server',
    created_at: new Date().toISOString()
  };
  
  let uri: string;
  let imageHash: string | undefined;
  let metadataHash: string | undefined;

  if (args.imageUrl || args.imagePath) {
    // Upload to IPFS using configured service
    const service = (process.env.IPFS_SERVICE || 'pinata') as 'nftStorage' | 'web3Storage' | 'pinata';
    const uploadResult = await uploadToIPFS(
      args.imageUrl || args.imagePath!,
      metadata,
      service,
      args.ipfsApiKey
    );

    imageHash = uploadResult.imageHash;
    metadataHash = uploadResult.metadataHash;
    uri = `ipfs://${metadataHash}`;

    console.log('Image uploaded to IPFS:', `ipfs://${imageHash}`);
    console.log('Metadata uploaded to IPFS:', uri);
  } else {
    // No image, just use metadata directly (on-chain)
    uri = JSON.stringify(metadata);

    if (uri.length > 200) {
      throw new Error('On-chain metadata too large. Please provide an image to use IPFS.');
    }
  }

  // Mint the NFT
  const mintTx = {
    TransactionType: 'NFTokenMint' as const,
    Account: wallet.address,
    URI: Buffer.from(uri).toString('hex').toUpperCase(),
    Flags: args.flags || 8, // Default: transferable
    TransferFee: args.transferFee || 0,
    NFTokenTaxon: args.taxon || 0,
    Fee: '12'
  };

  const prepared = await client.autofill(mintTx);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  // Extract NFT ID
  const nftNode = (result.result.meta as any)?.AffectedNodes?.find(
    (node: any) => node.CreatedNode?.LedgerEntryType === 'NFTokenPage'
  );

  const nftId = nftNode?.CreatedNode?.NewFields?.NFTokens?.[0]?.NFToken?.NFTokenID;

  return {
    success: (result.result.meta as any)?.TransactionResult === 'tesSUCCESS',
    txHash: result.result.hash,
    nftId,
    uri,
    imageHash,
    metadataHash,
    ipfsUrl: uri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : null,
    imageUrl: imageHash ? `https://ipfs.io/ipfs/${imageHash}` : null,
    message: 'NFT minted successfully!'
  };
}

/**
 * Tool definition for the enhanced NFT minting
 */
export const enhancedNFTTool = {
  name: 'xrp_mint_nft_enhanced',
  description: 'Mint NFT with automatic IPFS upload for images',
  inputSchema: {
    type: 'object',
    properties: {
      seed: { type: 'string', description: 'Wallet seed' },
      imageUrl: { type: 'string', description: 'URL of image to upload to IPFS' },
      imagePath: { type: 'string', description: 'Local path to image file' },
      name: { type: 'string', description: 'NFT name' },
      description: { type: 'string', description: 'NFT description' },
      attributes: { 
        type: 'array',
        items: {
          type: 'object',
          properties: {
            trait_type: { type: 'string' },
            value: { type: ['string', 'number'] }
          }
        },
        description: 'NFT attributes/traits'
      },
      transferFee: { type: 'number', description: 'Royalty in basis points (0-50000)' },
      flags: { type: 'number', description: 'NFT flags (8=transferable, 1=burnable)' },
      taxon: { type: 'number', description: 'Collection ID' },
      ipfsApiKey: { type: 'string', description: 'API key for IPFS service (optional for demo)' }
    },
    required: ['seed', 'name', 'description']
  }
};

/**
 * Example usage scenarios
 */
export const usageExamples = {
  // Example 1: With image URL
  withImageUrl: {
    seed: 'sXXX...',
    imageUrl: 'https://example.com/myart.png',
    name: 'Cool NFT #1',
    description: 'My first NFT on XRP Ledger',
    attributes: [
      { trait_type: 'Color', value: 'Blue' },
      { trait_type: 'Rarity', value: 'Rare' }
    ],
    transferFee: 1000 // 1% royalty
  },
  
  // Example 2: With local image
  withLocalImage: {
    seed: 'sXXX...',
    imagePath: '/Users/me/Desktop/art.jpg',
    name: 'Local Art NFT',
    description: 'Uploaded from my computer',
    transferFee: 2500 // 2.5% royalty
  },
  
  // Example 3: Text-only NFT (on-chain)
  textOnly: {
    seed: 'sXXX...',
    name: 'Text NFT',
    description: 'Pure metadata NFT',
    attributes: [
      { trait_type: 'Type', value: 'Poem' },
      { trait_type: 'Words', value: 100 }
    ]
  }
};

/**
 * Get free IPFS API keys:
 * 
 * 1. NFT.Storage (Best for NFTs):
 *    - Visit: https://nft.storage
 *    - Sign up free
 *    - Get API key from dashboard
 *    - 100% free forever for NFTs
 * 
 * 2. Web3.Storage:
 *    - Visit: https://web3.storage
 *    - Sign up with GitHub
 *    - Free forever
 * 
 * 3. Pinata:
 *    - Visit: https://pinata.cloud
 *    - 1GB free tier
 *    - Good for testing
 * 
 * For production: Use NFT.Storage - it's specifically designed for NFTs
 * and completely free!
 */