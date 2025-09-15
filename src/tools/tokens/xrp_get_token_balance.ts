import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse, AddressSchema } from '../../types.js';

export async function handleGetTokenBalance(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_get_token_balance', args);

  try {
    const { address, currency, issuer } = args;
    
    // Validate address
    AddressSchema.parse(address);
    
    const client = getXRPClient();
    await client.ensureConnection();
    
    // Get trustlines (token balances)
    const response = await client.getClient().request({
      command: 'account_lines',
      account: address,
      ledger_index: 'validated'
    });
    
    const trustlines = response.result.lines;
    
    // If specific currency/issuer requested, filter
    let filteredLines = trustlines;
    if (currency) {
      filteredLines = filteredLines.filter((line: any) => 
        line.currency === currency
      );
    }
    if (issuer) {
      filteredLines = filteredLines.filter((line: any) => 
        line.account === issuer
      );
    }
    
    // Format response
    const tokenBalances = filteredLines.map((line: any) => ({
      currency: line.currency,
      issuer: line.account,
      balance: line.balance,
      limit: line.limit,
      limitPeer: line.limit_peer,
      qualityIn: line.quality_in,
      qualityOut: line.quality_out,
      noRipple: line.no_ripple || false,
      noRipplePeer: line.no_ripple_peer || false,
      frozen: line.freeze || false,
      frozenPeer: line.freeze_peer || false
    }));
    
    const result = {
      address,
      tokenCount: tokenBalances.length,
      tokens: tokenBalances,
      summary: tokenBalances.reduce((acc: any, token: any) => {
        const key = `${token.currency}:${token.issuer.substring(0, 8)}...`;
        acc[key] = token.balance;
        return acc;
      }, {})
    };
    
    // If single token requested, simplify response
    if (currency && issuer && tokenBalances.length === 1) {
      (result as any).requestedToken = {
        currency,
        issuer,
        balance: tokenBalances[0]?.balance || '0',
        exists: tokenBalances.length > 0
      };
    }

    logger.toolSuccess('xrp_get_token_balance', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_get_token_balance', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
