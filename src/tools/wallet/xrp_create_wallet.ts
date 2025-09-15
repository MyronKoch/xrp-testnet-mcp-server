import { Wallet } from 'xrpl';

export async function handleCreateWallet(
  args: any,
  client?: any
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const wallet = Wallet.generate();
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: wallet.classicAddress,
          seed: wallet.seed,
          publicKey: wallet.publicKey,
          privateKey: wallet.privateKey,
          warning: '⚠️ TESTNET WALLET ONLY - Never use this seed/private key on mainnet!',
          fundingInstructions: 'Use xrp_fund_testnet_account to get test XRP'
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
}
