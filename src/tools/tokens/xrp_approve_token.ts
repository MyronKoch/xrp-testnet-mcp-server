import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import logger from '../../logger.js';
import { ToolResponse } from '../../types.js';

/**
 * Approve token (creates trustline in XRP)
 * Maps to MBSS standard xrp_approve_token
 * In XRP Ledger, "approval" is done via trustlines
 */
export async function handleApproveToken(args: any, client?: any): Promise<ToolResponse> {
  logger.toolStart('xrp_approve_token', args);
  
  try {
    // Import the existing create_trustline handler
    const { handleCreateTrustline } = await import('./xrp_create_trustline.js');
    
    // Map approve parameters to trustline parameters
    const trustlineArgs = {
      account: args.account,
      currency: args.currency || args.token,
      issuer: args.issuer || args.spender, // In XRP, issuer is like the spender
      limit: args.amount || args.limit || '1000000000', // Default high limit
      secret: args.secret
    };
    
    // Use the existing trustline implementation
    const result = await handleCreateTrustline(trustlineArgs, client);
    
    // Modify the response to indicate it's an approval
    if (result.content && result.content[0]) {
      const data = JSON.parse(result.content[0].text);
      data.note = 'In XRP Ledger, token approval is handled via trustlines. Trustline has been created/updated.';
      data.approved = true;
      result.content[0].text = JSON.stringify(data, null, 2);
    }
    
    return result;
  } catch (error) {
    logger.toolError('xrp_approve_token', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to approve token: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
