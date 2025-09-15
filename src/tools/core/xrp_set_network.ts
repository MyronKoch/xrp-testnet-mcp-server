import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse, NetworkType } from '../../types.js';
import { NETWORKS } from '../../constants.js';
import { z } from 'zod';

export async function handleSetNetwork(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_set_network', args);

  try {
    // Validate input
    const schema = z.object({
      network: z.enum(['mainnet', 'testnet', 'devnet'])
    });
    const { network } = schema.parse(args);

    const xrpClient = getXRPClient();
    const previousNetwork = xrpClient.getNetwork();
    
    // Switch network
    await xrpClient.switchNetwork(network as NetworkType);
    
    // Verify connection to new network
    const isHealthy = await xrpClient.isHealthy();
    
    const response = {
      success: true,
      previousNetwork,
      currentNetwork: network,
      networkConfig: NETWORKS[network as keyof typeof NETWORKS],
      connected: xrpClient.isConnected(),
      healthy: isHealthy,
      message: `Successfully switched from ${previousNetwork} to ${network}`
    };

    logger.toolSuccess('xrp_set_network', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_set_network', error);
    
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map((e: any) => e.message).join(', ')}`
      );
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to switch network: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
