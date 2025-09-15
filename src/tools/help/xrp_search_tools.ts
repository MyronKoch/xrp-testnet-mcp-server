import { z } from 'zod';
import { searchTools } from './tool-registry.js';

const schema = z.object({
  query: z.string().describe('Search query for tools'),
  limit: z.number().min(1).max(50).optional().default(10)
});

export async function handleSearchTools(
  args: any,
  client?: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const results = searchTools(parsed.query).slice(0, parsed.limit);
    
    if (results.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            query: parsed.query,
            message: 'No tools found matching your search',
            suggestions: [
              'Try broader keywords like "nft", "dex", "wallet"',
              'Use xrp_list_tools_by_category to browse all tools',
              'Search by category: core, wallet, dex, nft, tokens, escrow'
            ]
          }, null, 2)
        }]
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          query: parsed.query,
          count: results.length,
          tools: results.map(tool => ({
            name: tool.name,
            category: tool.category,
            description: tool.description
          }))
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Search failed: ${error.message}`);
  }
}
