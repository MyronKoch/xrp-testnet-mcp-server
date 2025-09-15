import { z } from 'zod';
import { getToolsByCategory } from './tool-registry.js';

const schema = z.object({
  category: z.string().optional().describe('Specific category to list'),
  includeDescriptions: z.boolean().optional().default(true)
});

export async function handleListToolsByCategory(
  args: any,
  client?: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const toolsByCategory = getToolsByCategory();
    
    if (parsed.category) {
      // List tools for specific category
      const tools = toolsByCategory[parsed.category];
      if (!tools) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: `Category '${parsed.category}' not found`,
              availableCategories: Object.keys(toolsByCategory)
            }, null, 2)
          }]
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            category: parsed.category,
            count: tools.length,
            tools: parsed.includeDescriptions ? 
              tools.map(t => ({ name: t.name, description: t.description })) :
              tools.map(t => t.name)
          }, null, 2)
        }]
      };
    }
    
    // List all categories with tools
    const categorySummary: Record<string, any> = {};
    
    for (const [category, tools] of Object.entries(toolsByCategory)) {
      categorySummary[category] = {
        count: tools.length,
        tools: parsed.includeDescriptions ?
          tools.map(t => `${t.name}: ${t.description}`) :
          tools.map(t => t.name)
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          totalTools: Object.values(toolsByCategory).flat().length,
          categories: categorySummary
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to list tools: ${error.message}`);
  }
}
