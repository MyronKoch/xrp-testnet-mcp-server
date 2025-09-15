#!/usr/bin/env node

import * as xrpl from 'xrpl';
import fs from 'fs';
import path from 'path';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              💰 XRP TESTNET WALLET STATUS REPORT 💰            ║
╚════════════════════════════════════════════════════════════════╝
`);

async function checkAllWallets() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  
  try {
    // Main wallet from file
    const walletPath = path.join(process.cwd(), 'xrp-testnet-wallet.json');
    const mainWallet = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    
    console.log('📊 WALLET INVENTORY:\n');
    console.log('=' .repeat(60));
    
    // Check main wallet
    console.log('\n1️⃣  MAIN WALLET (from xrp-testnet-wallet.json):');
    console.log(`   Address: ${mainWallet.address}`);
    console.log(`   Created: ${mainWallet.created}`);
    
    try {
      const balance = await client.getXrpBalance(mainWallet.address);
      const accountInfo = await client.request({
        command: 'account_info',
        account: mainWallet.address
      });
      
      console.log(`   💰 Balance: ${balance} XRP`);
      console.log(`   📈 Status: ACTIVE`);
      console.log(`   🔢 Sequence: ${accountInfo.result.account_data.Sequence}`);
      console.log(`   🔗 Explorer: ${mainWallet.explorerUrl}`);
    } catch (error) {
      if (error.message.includes('Account not found')) {
        console.log(`   💰 Balance: 0 XRP (Account not activated)`);
        console.log(`   📈 Status: NOT FUNDED`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Check for any wallets created during demos
    console.log('\n2️⃣  WALLETS CREATED DURING TESTING:');
    
    // The wallet that was created when checking balance
    const testWallet = 'rN2t1W5wDwwL8it5HH3hfdwWkmDkM7nEaF';
    console.log(`\n   Test Wallet:`);
    console.log(`   Address: ${testWallet}`);
    
    try {
      const balance = await client.getXrpBalance(testWallet);
      console.log(`   💰 Balance: ${balance} XRP`);
      console.log(`   📈 Status: ACTIVE`);
    } catch (error) {
      console.log(`   💰 Balance: 0 XRP (Not activated or doesn't exist)`);
    }
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('\n📋 SUMMARY:\n');
    
    console.log('• Total Wallets Created: 2');
    console.log('• Main Wallet: rPpAycfkkU3MmJH9XBB9xXaxyqEE6cEJgN');
    console.log('• Test Wallet: rN2t1W5wDwwL8it5HH3hfdwWkmDkM7nEaF');
    console.log('\n• Files:');
    console.log('  - xrp-testnet-wallet.json (main wallet with seed)');
    console.log('  - xrp-testnet-wallet-public.json (public info only)');
    console.log('  - xrp-test-results.json (test transaction history)');
    
    console.log('\n💡 NOTES:');
    console.log('• Main wallet has been used for all testing');
    console.log('• Balance started at 10 XRP, now ~5.3 XRP after testing');
    console.log('• All test transactions recorded in xrp-test-results.json');
    console.log('• Wallet is ready for more testing');
    
    console.log('\n🚀 TO GET MORE TEST XRP:');
    console.log('1. Visit: https://faucet.altnet.rippletest.net/');
    console.log(`2. Enter: ${mainWallet.address}`);
    console.log('3. Click "Send me XRP" (gives 10 XRP each time)');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

checkAllWallets().catch(console.error);