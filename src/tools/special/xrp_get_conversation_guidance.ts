import { Client } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  operation: z.enum(['nft_creation', 'payment', 'trading', 'escrow', 'general'])
    .describe('Type of operation'),
  user_request: z.string().optional().describe('Original user request for context')
});

const NFT_CREATION_GUIDE = `
NFT Creation Best Practices:
- Confirm NFT details before minting
- Explain URI and metadata requirements
- Discuss transfer fees and flags
- Guide through the minting process step-by-step
`;

const PAYMENT_GUIDE = `
Payment Transaction Guidelines:
- Verify recipient address
- Confirm amount and currency
- Explain transaction fees
- Warn about irreversible nature
- Always use testnet for testing
`;

const TRADING_GUIDE = `
DEX Trading Guidelines:
- Explain order book mechanics
- Discuss price and amount
- Warn about partial fills
- Guide through order placement
- Explain offer cancellation
`;

const ESCROW_GUIDE = `
Escrow Transaction Guidelines:
- Explain time-based vs condition-based
- Clarify release conditions
- Discuss expiration settings
- Warn about locked funds
- Guide through creation and completion
`;

const GENERAL_GUIDE = `
General XRP Ledger Guidelines:
- Always explain operations clearly
- Request confirmation before transactions
- Clarify testnet vs mainnet
- Provide transaction hashes
- Explain results and next steps
`;

export async function handleGetConversationGuidance(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    let guidance = '';
    let examples = '';
    
    switch (parsed.operation) {
      case 'nft_creation':
        guidance = NFT_CREATION_GUIDE;
        examples = `
Example NFT creation conversation:
1. User: "I want to create an NFT"
2. Ask: "What kind of NFT? Image, music, video?"
3. Ask: "Do you have an image URL or should I find a stock photo?"
4. Ask: "How many NFTs? Single or collection?"
5. Ask: "What traits/attributes should it have?"
6. Confirm all details before minting
        `;
        break;
        
      case 'payment':
        guidance = PAYMENT_GUIDE;
        examples = `
Example payment conversation:
1. User: "Send 5 XRP to rAddress123"
2. Confirm: "Sending 5 XRP to rAddress123 - is this correct?"
3. Warn: "This is testnet XRP (not real money)"
4. Show: "Fee will be ~0.000012 XRP"
5. Ask: "Ready to send? (Yes/No)"
        `;
        break;
        
      case 'trading':
        guidance = TRADING_GUIDE;
        examples = `
Example trading conversation:
1. User: "I want to trade XRP for USD"
2. Explain: "This uses the DEX (decentralized exchange)"
3. Ask: "What's your price and amount?"
4. Warn: "Orders may not fill immediately"
5. Guide through order placement step-by-step
        `;
        break;
        
      case 'escrow':
        guidance = ESCROW_GUIDE;
        examples = `
Example escrow conversation:
1. User: "Create an escrow"
2. Ask: "Time-based or condition-based?"
3. Ask: "Amount and recipient?"
4. Ask: "When should it release/expire?"
5. Explain risks and requirements
        `;
        break;
        
      default:
        guidance = GENERAL_GUIDE;
        examples = `
General blockchain conversation guidelines:
- Always explain what operations do
- Ask for confirmation before transactions  
- Clarify testnet vs mainnet
- Provide transaction hashes for verification
        `;
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          operation: parsed.operation,
          guidance,
          examples,
          userRequest: parsed.user_request,
          context: `This guidance helps AI assistants have better conversations about ${parsed.operation} operations.`
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get conversation guidance: ${error.message}`);
  }
}
