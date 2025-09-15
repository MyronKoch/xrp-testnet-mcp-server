import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse } from '../../types.js';

export async function handleGetNetworkInfo(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_get_network_info', args);

  try {
    const client = getXRPClient();
    await client.ensureConnection();
    
    const networkInfo = await client.getNetworkInfo();
    
    const response = {
      network: networkInfo.network,
      url: networkInfo.url,
      connected: networkInfo.connected,
      server: {
        version: networkInfo.serverInfo.build_version,
        state: networkInfo.serverInfo.server_state,
        peers: networkInfo.serverInfo.peers,
        loadFactor: networkInfo.serverInfo.load_factor,
        hostId: networkInfo.serverInfo.hostid
      },
      ledger: {
        current: networkInfo.serverInfo.validated_ledger?.seq,
        hash: networkInfo.serverInfo.validated_ledger?.hash,
        closeTime: networkInfo.serverInfo.validated_ledger?.close_time,
        baseFee: networkInfo.serverInfo.validated_ledger?.base_fee,
        reserveBase: networkInfo.serverInfo.validated_ledger?.reserve_base,
        reserveIncrement: networkInfo.serverInfo.validated_ledger?.reserve_inc
      },
      fees: {
        base: networkInfo.fees.drops.base_fee,
        median: networkInfo.fees.drops.median_fee,
        minimum: networkInfo.fees.minimum_fee,
        openLedger: networkInfo.fees.drops.open_ledger_fee
      },
      state: networkInfo.serverState
    };

    logger.toolSuccess('xrp_get_network_info', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_get_network_info', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get network info: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
