import { Client } from 'xrpl';
import { z } from 'zod';
import axios from 'axios';

const schema = z.object({
  address: z.string().describe('Address to fund')
});

export async function handleFundTestnetAccount(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    // Check if account already exists and has balance
    let existingBalance = 0;
    try {
      const accountInfo = await client.request({
        command: 'account_info',
        account: parsed.address,
        ledger_index: 'validated'
      });
      existingBalance = parseInt(accountInfo.result.account_data.Balance) / 1000000;
    } catch (e) {
      // Account doesn't exist yet, which is fine
    }
    
    try {
      const response = await axios.post('https://faucet.altnet.rippletest.net/accounts', {
        destination: parsed.address
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            address: parsed.address,
            amount: '10000 XRP (testnet)',
            balance: response.data.balance,
            txHash: response.data.transactionHash,
            previousBalance: existingBalance > 0 ? `${existingBalance} XRP` : 'New account',
            message: 'Testnet XRP funded successfully'
          }, null, 2)
        }]
      };
    } catch (faucetError: any) {
      // Faucet may reject if already funded
      if (faucetError.response?.status === 409 || 
          faucetError.response?.data?.message?.includes('already funded') ||
          existingBalance > 0) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              address: parsed.address,
              currentBalance: `${existingBalance} XRP`,
              message: 'Account already funded. Testnet faucet typically allows one funding per address.',
              alternatives: [
                'Create a new wallet with xrp_create_wallet for additional test funds',
                'Use the existing balance for testing',
                'Try again later (some faucets have time-based limits)'
              ]
            }, null, 2)
          }]
        };
      }
      throw faucetError;
    }
  } catch (error: any) {
    throw new Error(`Failed to fund account: ${error.message}`);
  }
}
