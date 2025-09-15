import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse, dropsToXRP } from '../../types.js';
import { TRANSACTION_TYPES, FEES } from '../../constants.js';

export async function handleEstimateFees(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_estimate_fees', args);

  try {
    const { 
      transactionType = 'Payment',
      amount,
      numberOfSigners = 1,
      includeReserve = false
    } = args;

    const xrpClient = getXRPClient();
    await xrpClient.ensureConnection();
    
    // Get current fee information
    const feeResponse = await xrpClient.getClient().request({
      command: 'fee'
    });
    
    const fees = feeResponse.result;
    
    // Calculate base fee
    let baseFee = parseInt(fees.drops.base_fee);
    let recommendedFee = parseInt(fees.drops.median_fee);
    let priorityFee = parseInt(fees.drops.open_ledger_fee);
    
    // Adjust for multi-sig if applicable
    if (numberOfSigners > 1) {
      const signerFeeIncrement = baseFee * (numberOfSigners - 1);
      baseFee += signerFeeIncrement;
      recommendedFee += signerFeeIncrement;
      priorityFee += signerFeeIncrement;
    }
    
    // Special fees for specific transaction types
    const specialFees: Record<string, number> = {
      [TRANSACTION_TYPES.ACCOUNT_SET]: baseFee,
      [TRANSACTION_TYPES.TRUST_SET]: baseFee * 2,
      [TRANSACTION_TYPES.OFFER_CREATE]: baseFee * 2,
      [TRANSACTION_TYPES.NFT_MINT]: baseFee * 10,
      [TRANSACTION_TYPES.AMM_CREATE]: baseFee * 100,
      [TRANSACTION_TYPES.ESCROW_CREATE]: baseFee * 5,
      [TRANSACTION_TYPES.PAYMENT_CHANNEL_CREATE]: baseFee * 5
    };
    
    // Apply special fee if applicable
    if (specialFees[transactionType]) {
      baseFee = specialFees[transactionType];
      recommendedFee = Math.max(recommendedFee, baseFee * 2);
      priorityFee = Math.max(priorityFee, baseFee * 3);
    }
    
    const response = {
      transactionType,
      fees: {
        minimum: {
          drops: baseFee.toString(),
          xrp: dropsToXRP(baseFee.toString())
        },
        recommended: {
          drops: recommendedFee.toString(),
          xrp: dropsToXRP(recommendedFee.toString())
        },
        priority: {
          drops: priorityFee.toString(),
          xrp: dropsToXRP(priorityFee.toString())
        }
      },
      currentLoad: {
        queueSize: fees.current_queue_size || 0,
        level: Number(fees.current_queue_size || 0) > 0 ? 'high' : 'normal'
      },
      additionalInfo: {
        numberOfSigners,
        multiSigFee: numberOfSigners > 1 ? {
          drops: (baseFee * (numberOfSigners - 1)).toString(),
          xrp: dropsToXRP((baseFee * (numberOfSigners - 1)).toString())
        } : null
      }
    };
    
    // Add reserve information if requested
    if (includeReserve) {
      // Get reserve info from server_info
      const serverInfoResponse = await xrpClient.getClient().request({
        command: 'server_info'
      });
      const ledgerInfo = serverInfoResponse.result.info.validated_ledger;
      
      if (ledgerInfo) {
        (response as any).reserves = {
          account: {
            drops: Math.round(ledgerInfo.reserve_base_xrp * 1000000).toString(),
            xrp: ledgerInfo.reserve_base_xrp.toString()
          },
          perItem: {
            drops: Math.round(ledgerInfo.reserve_inc_xrp * 1000000).toString(),
            xrp: ledgerInfo.reserve_inc_xrp.toString()
          },
          note: 'Reserves are locked XRP, not fees'
        };
      }
    }

    logger.toolSuccess('xrp_estimate_fees', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_estimate_fees', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to estimate fees: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
