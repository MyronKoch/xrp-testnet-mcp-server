import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getXRPClient } from '../../client.js';
import logger from '../../logger.js';
import { ToolResponse, AddressSchema, CurrencySchema } from '../../types.js';

export async function handleGetTokenInfo(args: any, client?: any): Promise<ToolResponse> {
  const startTime = Date.now();
  logger.toolStart('xrp_get_token_info', args);

  try {
    const { currency, issuer } = args;
    
    if (!currency || !issuer) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Both currency and issuer are required'
      );
    }
    
    // Validate inputs
    CurrencySchema.parse(currency);
    AddressSchema.parse(issuer);
    
    const client = getXRPClient();
    await client.ensureConnection();
    
    // Get issuer account info
    const issuerInfo = await client.getClient().request({
      command: 'account_info',
      account: issuer,
      ledger_index: 'validated'
    }).catch(() => null);
    
    // Get all accounts that trust this token
    const gatewayBalances = await client.getClient().request({
      command: 'gateway_balances',
      account: issuer,
      ledger_index: 'validated'
    }).catch(() => null);
    
    // Get order book for this token vs XRP
    const orderBook = await client.getClient().request({
      command: 'book_offers',
      taker_gets: {
        currency: 'XRP'
      },
      taker_pays: {
        currency,
        issuer
      },
      limit: 10
    }).catch(() => null);
    
    // Calculate token statistics
    let totalSupply = '0';
    let holders = 0;
    let obligations: Record<string, any> = {};
    
    if (gatewayBalances?.result?.obligations) {
      obligations = gatewayBalances.result.obligations;
      if (obligations[currency]) {
        totalSupply = obligations[currency];
      }
    }
    
    if (gatewayBalances?.result?.balances) {
      const tokenBalances: Record<string, any> = gatewayBalances.result.balances;
      holders = Object.keys(tokenBalances).length;
    }
    
    // Get domain from issuer if available
    let domain = null;
    if (issuerInfo?.result?.account_data?.Domain) {
      domain = Buffer.from(issuerInfo.result.account_data.Domain, 'hex').toString('utf8');
    }
    
    const response = {
      token: {
        currency,
        currencyCode: currency.length === 3 ? currency : `Hex: ${currency}`,
        issuer,
        issuerDomain: domain
      },
      statistics: {
        totalSupply,
        holders,
        obligations
      },
      issuerAccount: issuerInfo ? {
        activated: true,
        balance: issuerInfo.result.account_data.Balance,
        flags: issuerInfo.result.account_data.Flags,
        transferRate: issuerInfo.result.account_data.TransferRate,
        regularKey: issuerInfo.result.account_data.RegularKey
      } : {
        activated: false,
        note: 'Issuer account not found or not activated'
      },
      market: orderBook ? {
        hasMarket: orderBook.result.offers.length > 0,
        bestAsk: orderBook.result.offers[0] ? {
          price: orderBook.result.offers[0].quality,
          amount: orderBook.result.offers[0].TakerPays
        } : null,
        offersCount: orderBook.result.offers.length
      } : {
        hasMarket: false,
        note: 'No active market for this token'
      },
      trustlines: {
        required: true,
        note: 'Users must establish a trustline to hold this token'
      },
      metadata: {
        isNative: false,
        decimals: 'Variable (up to 16)',
        standard: 'XRPL Issued Currency'
      }
    };

    logger.toolSuccess('xrp_get_token_info', Date.now() - startTime);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.toolError('xrp_get_token_info', error);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get token info: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
