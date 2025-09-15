import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { Wallet } from 'xrpl';
import logger from '../../logger.js';
import { ToolResponse } from '../../types.js';

/**
 * Generate a new XRP address (without creating wallet)
 * Maps to MBSS standard xrp_generate_address
 */
export async function handleGenerateAddress(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_generate_address', args);

  try {
    const { 
      algorithm = 'secp256k1',
      includeSecret = false 
    } = args;
    
    // Validate algorithm
    if (algorithm !== 'secp256k1' && algorithm !== 'ed25519') {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Algorithm must be either secp256k1 or ed25519'
      );
    }
    
    // Generate new wallet
    const wallet = Wallet.generate(algorithm);
    
    const response: any = {
      address: wallet.address,
      publicKey: wallet.publicKey,
      algorithm,
      activated: false,
      note: 'This address is not yet activated on the ledger. Send at least 10 XRP to activate it.'
    };
    
    // Include secret only if explicitly requested
    if (includeSecret) {
      response.warning = 'KEEP THIS SECRET SECURE! Anyone with this seed can control the account.';
      response.seed = wallet.seed;
      response.privateKey = wallet.privateKey;
    }

    logger.toolSuccess('xrp_generate_address', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_generate_address', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to generate address: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Also export as create_wallet for compatibility
