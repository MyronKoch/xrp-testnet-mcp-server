import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse, AddressSchema } from '../../types.js';

/**
 * Get token allowance (trustline limit in XRP)
 * Maps to MBSS standard xrp_get_token_allowance
 * In XRP Ledger, "allowance" is the trustline limit
 */
export async function handleGetTokenAllowance(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_get_token_allowance', args);

  try {
    const { owner, spender, currency, issuer } = args;
    
    // In XRP, we check the trustline limit
    // owner = account holding the trustline
    // spender/issuer = the token issuer
    const account = owner;
    const tokenIssuer = issuer || spender;
    
    if (!account || !tokenIssuer || !currency) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Account (owner), issuer (spender), and currency are required'
      );
    }
    
    // Validate addresses
    AddressSchema.parse(account);
    AddressSchema.parse(tokenIssuer);
    
    const client = getXRPClient();
    await client.ensureConnection();
    
    // Get account trustlines
    const response = await client.getClient().request({
      command: 'account_lines',
      account,
      peer: tokenIssuer,
      ledger_index: 'validated'
    });
    
    const trustlines = response.result.lines;
    const trustline = trustlines.find((line: any) => 
      line.currency === currency && line.account === tokenIssuer
    );
    
    const result = {
      owner: account,
      spender: tokenIssuer,
      currency,
      allowance: trustline ? {
        limit: trustline.limit,
        currentBalance: trustline.balance,
        limitPeer: trustline.limit_peer,
        available: (parseFloat(trustline.limit) - Math.abs(parseFloat(trustline.balance))).toString(),
        noRipple: trustline.no_ripple || false,
        frozen: trustline.freeze || false,
        authorized: true
      } : {
        limit: '0',
        currentBalance: '0',
        available: '0',
        authorized: false,
        note: 'No trustline established. Use xrp_approve_token to create one.'
      },
      explanation: 'In XRP Ledger, allowance is managed through trustline limits. The limit represents the maximum amount of tokens the account is willing to hold from the issuer.'
    };

    logger.toolSuccess('xrp_get_token_allowance', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_get_token_allowance', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get token allowance: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
