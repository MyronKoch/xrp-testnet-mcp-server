import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse, dropsToXRP } from '../../types.js';

/**
 * Get current fee (gas price equivalent) for XRP Ledger
 * Maps to MBSS standard xrp_get_gas_price
 */
export async function handleGetGasPrice(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_get_gas_price', args);

  try {
    const xrpClient = getXRPClient();
    await xrpClient.ensureConnection();
    
    // Get fee and server information  
    const [feeResponse, serverInfoResponse] = await Promise.all([
      xrpClient.getClient().request({ command: 'fee' }),
      xrpClient.getClient().request({ command: 'server_info' })
    ]);
    
    const fees = feeResponse.result;
    const ledgerInfo = serverInfoResponse.result.info.validated_ledger;
    
    const response = {
      // Current fee levels (in drops)
      current: {
        base: fees.drops.base_fee,
        baseXRP: dropsToXRP(fees.drops.base_fee),
        median: fees.drops.median_fee,
        medianXRP: dropsToXRP(fees.drops.median_fee),
        minimum: fees.drops.minimum_fee,
        minimumXRP: dropsToXRP(fees.drops.minimum_fee)
      },
      // Queue fees (if congested)
      queue: {
        openLedger: fees.drops.open_ledger_fee,
        openLedgerXRP: dropsToXRP(fees.drops.open_ledger_fee),
        currentSize: fees.current_queue_size,
        maxSize: fees.max_queue_size
      },
      // Reserve amounts (from server_info)
      reserve: ledgerInfo ? {
        base: Math.round(ledgerInfo.reserve_base_xrp * 1000000).toString(),
        baseXRP: ledgerInfo.reserve_base_xrp.toString(),
        increment: Math.round(ledgerInfo.reserve_inc_xrp * 1000000).toString(),
        incrementXRP: ledgerInfo.reserve_inc_xrp.toString()
      } : {
        base: '10000000',
        baseXRP: '10',
        increment: '200000',
        incrementXRP: '0.2'
      },
      // Recommendations
      recommended: {
        standard: fees.drops.base_fee,
        standardXRP: dropsToXRP(fees.drops.base_fee),
        fast: fees.drops.median_fee,
        fastXRP: dropsToXRP(fees.drops.median_fee),
        priority: fees.drops.open_ledger_fee,
        priorityXRP: dropsToXRP(fees.drops.open_ledger_fee)
      },
      // Additional context
      drops: fees.drops,
      ledgerInfo: {
        currentIndex: fees.ledger_current_index,
        queueSize: fees.current_queue_size,
        expectedSize: fees.expected_ledger_size
      },
      note: 'XRP uses fees instead of gas. All values shown in drops (1 XRP = 1,000,000 drops)'
    };

    logger.toolSuccess('xrp_get_gas_price', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_get_gas_price', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get fee information: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
