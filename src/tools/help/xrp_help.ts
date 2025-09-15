import { z } from 'zod';
import { toolRegistry } from './tool-registry.js';

const schema = z.object({
  topic: z.string().optional().describe('Help topic or tool name')
});

export async function handleHelp(
  args: any,
  client?: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    if (parsed.topic) {
      // Search for specific tool or topic
      const tool = toolRegistry.find(t => 
        t.name === parsed.topic || 
        t.name.includes(parsed.topic?.toLowerCase() || '')
      );
      
      if (tool) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              tool: tool.name,
              category: tool.category,
              description: tool.description,
              parameters: tool.parameters || 'See tool documentation',
              examples: tool.examples || ['No examples available']
            }, null, 2)
          }]
        };
      }
    }
    
    // General help
    const totalTools = toolRegistry.length;
    const categories = [...new Set(toolRegistry.map(t => t.category))];
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'XRP Testnet MCP Server - Help System',
          version: '1.0.0',
          totalTools,
          categories,
          coreTools: [
            'xrp_get_chain_info - Get blockchain information',
            'xrp_get_balance - Check XRP balance',
            'xrp_get_transaction - Get transaction details',
            'xrp_get_block - Get ledger/block info',
            'xrp_validate_address - Validate address format',
            'xrp_get_transaction_history - Get recent transactions',
            'xrp_create_wallet - Generate new wallet',
            'xrp_send_transaction - Send XRP',
            'xrp_help - This help system',
            'xrp_search_tools - Search available tools',
            'xrp_list_tools_by_category - Browse tools by category'
          ],
          usage: {
            search: 'Use xrp_search_tools with keyword to find specific tools',
            browse: 'Use xrp_list_tools_by_category to see all tools organized',
            specific: 'Use xrp_help with tool name for detailed information'
          }
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Help system error: ${error.message}`);
  }
}
