import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse } from '../../types.js';

/**
 * Get transaction queue (mempool equivalent) information for XRP Ledger
 * Maps to MBSS standard xrp_get_mempool_info
 */
export async function handleGetMempoolInfo(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_get_mempool_info', args);

  try {
    const xrpClient = getXRPClient();
    await xrpClient.ensureConnection();
    
    // Get fee and server information for queue stats
    const [feeData, serverInfo] = await Promise.all([
      xrpClient.getClient().request({
        command: 'fee'
      }),
      xrpClient.getClient().request({
        command: 'server_info'
      })
    ]);
    
    const fees = feeData.result;
    const server = serverInfo.result.info;
    
    const response = {
      // Queue statistics
      queue: {
        currentSize: fees.current_queue_size || 0,
        maxSize: fees.max_queue_size || 0,
        expectedLedgerSize: fees.expected_ledger_size || 0,
        status: Number(fees.current_queue_size || 0) > 0 ? 'congested' : 'normal'
      },
      // Server load information
      load: {
        serverState: server.server_state,
        validatedLedger: server.validated_ledger?.seq || 0,
        currentLedger: fees.ledger_current_index || 0,
        peers: server.peers || 0
      },
      // Current state
      state: {
        serverState: server.server_state,
        validatedLedger: server.validated_ledger?.seq,
        currentLedger: fees.ledger_current_index,
        peers: server.peers
      },
      // Fee information
      fees: {
        baseFee: fees.drops.base_fee,
        medianFee: fees.drops.median_fee,
        openLedgerFee: fees.drops.open_ledger_fee,
        minimumFee: fees.drops.minimum_fee,
        levels: fees.levels || {}
      },
      note: 'XRP Ledger uses a transaction queue instead of a traditional mempool'
    };

    logger.toolSuccess('xrp_get_mempool_info', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_get_mempool_info', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get queue information: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Also export with XRP-specific name
