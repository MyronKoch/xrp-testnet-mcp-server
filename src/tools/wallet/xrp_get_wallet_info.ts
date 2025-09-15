import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { Wallet } from 'xrpl';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse, dropsToXRP } from '../../types.js';

export async function handleGetWalletInfo(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_get_wallet_info', args);

  try {
    const { seed, address } = args;
    
    if (!seed && !address) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Either seed or address must be provided'
      );
    }

    const client = getXRPClient();
    await client.ensureConnection();
    
    let wallet: Wallet | null = null;
    let targetAddress: string;
    
    if (seed) {
      // Create wallet from seed to get full info
      wallet = Wallet.fromSeed(seed);
      targetAddress = wallet.address;
    } else {
      targetAddress = address;
    }
    
    // Get account info from ledger
    let accountInfo;
    let balances;
    let accountObjects;
    
    try {
      const [accountResponse, accountObjectsResponse] = await Promise.all([
        client.getClient().request({
          command: 'account_info',
          account: targetAddress,
          ledger_index: 'validated'
        }),
        client.getClient().request({
          command: 'account_objects',
          account: targetAddress,
          ledger_index: 'validated'
        })
      ]);
      
      accountInfo = accountResponse.result.account_data;
      accountObjects = accountObjectsResponse.result.account_objects;
      
      // Get trustline balances
      const trustlines = accountObjects.filter((obj: any) => obj.LedgerEntryType === 'RippleState');
      balances = {
        xrp: {
          drops: accountInfo.Balance,
          xrp: dropsToXRP(accountInfo.Balance)
        },
        tokens: trustlines.map((line: any) => ({
          currency: line.Balance.currency,
          value: line.Balance.value,
          issuer: line.Balance.issuer || line.LowLimit?.issuer || line.HighLimit?.issuer
        }))
      };
    } catch (error: any) {
      if (error?.data?.error === 'actNotFound') {
        // Account not activated
        accountInfo = null;
        balances = {
          xrp: { drops: '0', xrp: '0' },
          tokens: []
        };
      } else {
        throw error;
      }
    }
    
    const response = {
      wallet: wallet ? {
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        algorithm: 'secp256k1'
      } : {
        address: targetAddress
      },
      account: accountInfo ? {
        activated: true,
        sequence: accountInfo.Sequence,
        ownerCount: accountInfo.OwnerCount,
        previousTxnID: accountInfo.PreviousTxnID,
        previousTxnLgrSeq: accountInfo.PreviousTxnLgrSeq,
        flags: accountInfo.Flags,
        transferRate: accountInfo.TransferRate,
        domain: accountInfo.Domain ? 
          Buffer.from(accountInfo.Domain, 'hex').toString('utf8') : undefined,
        emailHash: accountInfo.EmailHash,
        messageKey: accountInfo.MessageKey
      } : {
        activated: false,
        note: 'Account not yet activated. Send at least 10 XRP to activate.'
      },
      balances,
      reserves: accountInfo ? {
        base: {
          drops: '10000000',
          xrp: '10'
        },
        owner: {
          drops: (2000000 * (accountInfo.OwnerCount || 0)).toString(),
          xrp: (2 * (accountInfo.OwnerCount || 0)).toString()
        },
        total: {
          drops: (10000000 + (2000000 * (accountInfo.OwnerCount || 0))).toString(),
          xrp: (10 + (2 * (accountInfo.OwnerCount || 0))).toString()
        }
      } : null,
      objects: accountInfo ? {
        trustlines: accountObjects?.filter((obj: any) => 
          obj.LedgerEntryType === 'RippleState').length || 0,
        offers: accountObjects?.filter((obj: any) => 
          obj.LedgerEntryType === 'Offer').length || 0,
        escrows: accountObjects?.filter((obj: any) => 
          obj.LedgerEntryType === 'Escrow').length || 0,
        nfts: accountObjects?.filter((obj: any) => 
          obj.LedgerEntryType === 'NFTokenPage').length || 0,
        checks: accountObjects?.filter((obj: any) => 
          obj.LedgerEntryType === 'Check').length || 0
      } : null
    };

    logger.toolSuccess('xrp_get_wallet_info', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_get_wallet_info', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get wallet info: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
