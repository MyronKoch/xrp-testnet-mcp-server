# XRP NFT Image Generation System

## Overview
The XRP testnet MCP server includes a sophisticated NFT image generation system that integrates multiple AI image generation services with automatic fallback to free stock photos.

## Features
- **Multiple AI Services**: Supports DALL-E, Stable Diffusion, and Replicate
- **Free Fallback**: Automatically uses Unsplash stock photos if no API key is provided
- **IPFS Integration**: Generated images can be uploaded to IPFS for permanent storage
- **Complete NFT Workflow**: Generate image → Upload to IPFS → Mint NFT on XRP Ledger

## Available Services

### 1. OpenAI DALL-E 3 (Premium)
- **Quality**: Highest quality, most accurate to prompts
- **Cost**: ~$0.04-0.08 per image
- **API Key**: `OPENAI_API_KEY`
- **Sign up**: https://platform.openai.com/api-keys

### 2. Stable Diffusion (Open Source)
- **Quality**: Very good, customizable
- **Cost**: Varies by provider (~$0.002-0.02 per image)
- **API Key**: `STABLE_DIFFUSION_API_KEY`
- **Providers**:
  - https://stablediffusionapi.com/
  - https://stability.ai/
  - https://replicate.com/stability-ai/stable-diffusion

### 3. Replicate (Multiple Models)
- **Quality**: Varies by model
- **Cost**: Pay-per-use (~$0.0002-0.05 per image)
- **API Key**: `REPLICATE_API_KEY`
- **Sign up**: https://replicate.com/account/api-tokens
- **Models**: SDXL, Kandinsky, Playground, etc.

### 4. Unsplash Stock Photos (FREE)
- **Quality**: Real photography
- **Cost**: FREE
- **API Key**: Not required
- **Fallback**: Automatically used when no API keys are configured

## Configuration

### Environment Variables
Add to your `.env` file:
```env
# Image Generation API Keys
OPENAI_API_KEY=sk-...
STABLE_DIFFUSION_API_KEY=...
REPLICATE_API_KEY=r8_...

# IPFS Configuration (for NFT storage)
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
IPFS_SERVICE=pinata
```

### MCP Configuration
In your MCP config (`.mcp.json` or Cursor's `mcp.json`):
```json
{
  "xrp-testnet": {
    "env": {
      "XRP_NETWORK": "testnet",
      "OPENAI_API_KEY": "your_key_here",
      "STABLE_DIFFUSION_API_KEY": "your_key_here",
      "REPLICATE_API_KEY": "your_key_here",
      "ENABLE_IMAGE_GENERATION": "true"
    }
  }
}
```

## Usage

### 1. Generate an NFT Image
```javascript
// Using AI generation (if API key configured)
xrp_generate_nft_image({
  prompt: "A majestic dragon breathing fire over a mountain",
  style: "fantasy",
  aspectRatio: "16:9",
  quality: "high",
  service: "dall-e"  // or "stable-diffusion", "replicate", "stock"
})

// Using free stock photos (no API key needed)
xrp_generate_nft_image({
  prompt: "sunset beach ocean waves",
  style: "realistic",
  aspectRatio: "1:1"
})
```

### 2. Complete NFT Creation Workflow
```javascript
// Step 1: Generate image
const imageResult = await xrp_generate_nft_image({
  prompt: "Cyberpunk city at night with neon lights",
  style: "cyberpunk",
  aspectRatio: "16:9",
  quality: "ultra"
});

// Step 2: Mint NFT with generated image
const nftResult = await xrp_mint_nft_with_ipfs({
  privateKey: "your_wallet_seed",
  name: "Cyberpunk Dreams #001",
  description: "A futuristic cityscape with neon aesthetics",
  imageUrl: imageResult.imageUrl,
  attributes: {
    artist: "AI Generated",
    style: "cyberpunk",
    rarity: "unique"
  }
});
```

## Available Styles
- `realistic` - Photorealistic, highly detailed
- `artistic` - Painterly, creative interpretation
- `cartoon` - Animated, colorful, whimsical
- `fantasy` - Magical, ethereal, dreamlike
- `cyberpunk` - Neon, futuristic, high-tech
- `minimalist` - Simple, clean lines, modern

## Aspect Ratios
- `1:1` - Square (1024x1024) - Instagram, profile pictures
- `16:9` - Landscape (1920x1080) - Desktop wallpapers
- `9:16` - Portrait (1080x1920) - Mobile wallpapers
- `4:3` - Classic (1024x768) - Traditional photos
- `3:4` - Portrait Classic (768x1024) - Portrait photos

## Quality Settings
- `standard` - Faster generation, lower quality
- `high` - Balanced quality and speed (default)
- `ultra` - Maximum quality, slower generation

## Cost Optimization Tips

1. **Development**: Use stock photos (free) during development
2. **Testing**: Use Replicate (cheapest AI option) for testing
3. **Production**: Use DALL-E or Stable Diffusion for final NFTs
4. **Batch Generation**: Some services offer bulk discounts

## Troubleshooting

### No Image Generated
- Check if API keys are properly configured
- Verify the service name is correct
- Falls back to stock photos automatically

### IPFS Upload Fails
- Ensure PINATA_API_KEY and PINATA_SECRET_KEY are configured
- Check internet connection
- Verify Pinata account has available storage

### NFT Minting Fails
- Ensure XRP testnet wallet has sufficient XRP
- Verify wallet seed is correct
- Check network connection to XRP testnet

## Related Tools
- `xrp_generate_nft_image` - Generate AI or stock images
- `xrp_mint_nft_with_ipfs` - Mint NFT with IPFS storage
- `xrp_upload_to_ipfs` - Upload any file to IPFS
- `xrp_mint_nft` - Basic NFT minting without IPFS

## Security Notes
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage to prevent unexpected charges

## Future Enhancements
- [ ] Add Midjourney support
- [ ] Implement image editing capabilities
- [ ] Add batch generation for collections
- [ ] Support for animated NFTs (GIFs/Videos)
- [ ] AI prompt enhancement/optimization
- [ ] Image similarity detection for uniqueness

---
Last Updated: January 2025