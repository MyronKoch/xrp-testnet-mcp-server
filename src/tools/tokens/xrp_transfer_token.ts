import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import logger from '../../logger.js';
import { ToolResponse } from '../../types.js';

/**
 * Transfer token (alias for xrp_send_token)
 * Maps to MBSS standard xrp_transfer_token
 */
export async function handleTransferToken(args: any, client?: any): Promise<ToolResponse> {
  logger.toolStart('xrp_transfer_token', args);
  
  try {
    // Import the existing send_token handler
    const { handleSendToken } = await import('./xrp_send_token.js');
    
    // Use the existing implementation
    return await handleSendToken(args, client);
  } catch (error) {
    logger.toolError('xrp_transfer_token', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to transfer token: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
