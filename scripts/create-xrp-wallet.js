#!/usr/bin/env node

import * as xrpl from 'xrpl';
import fs from 'fs';
import path from 'path';

console.log('🔑 Creating XRP Testnet Wallet and Requesting Tokens\n');
console.log('=' .repeat(50));

async function main() {
  try {
    // Generate wallet
    console.log('📍 Generating XRP wallet...');
    const wallet = xrpl.Wallet.generate();
    
    console.log('\n✅ Wallet Created:');
    console.log('   Address:', wallet.address);
    console.log('   Public Key:', wallet.publicKey);
    console.log('   Seed:', wallet.seed);
    
    // Connect to testnet
    console.log('\n🌐 Connecting to XRP Testnet...');
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    console.log('✅ Connected!');
    
    // Fund wallet using faucet
    console.log('\n💰 Requesting funds from faucet...');
    console.log('   This may take a few seconds...');
    const fundResult = await client.fundWallet(wallet);
    
    console.log('\n✅ SUCCESS! Wallet Funded!');
    console.log('   Balance:', fundResult.balance, 'XRP');
    console.log('   Transaction Hash:', fundResult.transactionHash);
    console.log('   Explorer URL:', `https://testnet.xrpl.org/transactions/${fundResult.transactionHash}`);
    
    // Get updated account info
    const accountInfo = await client.request({
      command: 'account_info',
      account: wallet.address,
      ledger_index: 'validated'
    });
    
    console.log('\n📊 Account Details:');
    console.log('   Sequence:', accountInfo.result.account_data.Sequence);
    console.log('   Owner Count:', accountInfo.result.account_data.OwnerCount);
    console.log('   Reserve:', xrpl.xrpToDrops(10), 'drops (10 XRP)');
    
    // Save wallet info
    const walletInfo = {
      created: new Date().toISOString(),
      network: 'XRP Testnet',
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      seed: wallet.seed,
      balance: fundResult.balance,
      fundingTxHash: fundResult.transactionHash,
      explorerUrl: `https://testnet.xrpl.org/accounts/${wallet.address}`
    };
    
    const outputPath = path.join(process.cwd(), 'xrp-testnet-wallet.json');
    fs.writeFileSync(outputPath, JSON.stringify(walletInfo, null, 2));
    console.log('\n💾 Wallet saved to:', outputPath);
    
    // Create safe version without secrets
    const safeWallet = { ...walletInfo };
    delete safeWallet.privateKey;
    delete safeWallet.seed;
    
    const safePath = path.join(process.cwd(), 'xrp-testnet-wallet-public.json');
    fs.writeFileSync(safePath, JSON.stringify(safeWallet, null, 2));
    console.log('📋 Public info saved to:', safePath);
    
    await client.disconnect();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 XRP TESTNET WALLET READY TO USE!');
    console.log('\n⚠️  IMPORTANT:');
    console.log('- This is a TESTNET wallet - do not use for real XRP!');
    console.log('- Keep the private key and seed secure');
    console.log('- You can now use this wallet to test XRP transactions');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.data) {
      console.error('Details:', error.data);
    }
  }
}

main();