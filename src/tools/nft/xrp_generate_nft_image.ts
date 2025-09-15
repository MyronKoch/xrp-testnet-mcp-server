import { z } from 'zod';
import { imageGenerator, ImageGenerationRequest } from '../../utils/ai-image-generation.js';

const schema = z.object({
  prompt: z.string().describe('Text description of the image to generate'),
  style: z.enum(['realistic', 'artistic', 'cartoon', 'fantasy', 'cyberpunk', 'minimalist']).optional().describe('Art style for the image'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional().default('1:1').describe('Image aspect ratio'),
  quality: z.enum(['standard', 'high', 'ultra']).optional().default('high').describe('Generation quality')
});

export async function handleGenerateNftImage(
  args: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const request: ImageGenerationRequest = {
      prompt: parsed.prompt,
      style: parsed.style,
      aspectRatio: parsed.aspectRatio,
      quality: parsed.quality
    };
    
    const result = await imageGenerator.generateImage(request);
    
    if (!result.success || !result.imageUrl) {
      throw new Error(result.error || 'Image generation failed');
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          imageUrl: result.imageUrl,
          prompt: result.prompt,
          model: result.model,
          style: parsed.style,
          aspectRatio: parsed.aspectRatio,
          message: 'Image generated successfully. Use this URL for IPFS upload or direct NFT minting.',
          nextSteps: [
            '1. Use xrp_mint_nft_with_ipfs to upload to IPFS and mint',
            '2. Or use xrp_mint_nft with this imageUrl as the URI'
          ]
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to generate NFT image: ${error.message}`);
  }
}
