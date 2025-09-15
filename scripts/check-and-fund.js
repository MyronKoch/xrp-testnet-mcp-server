#!/usr/bin/env node

import * as xrpl from 'xrpl';
import fs from 'fs';
import path from 'path';

const walletPath = path.join(process.cwd(), 'xrp-testnet-wallet.json');
const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));

async function checkAndFund() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  
  try {
    // Check current balance
    const balance = await client.getXrpBalance(walletData.address);
    console.log(`\n💰 Current Balance: ${balance} XRP`);
    console.log(`📍 Address: ${walletData.address}`);
    
    if (parseFloat(balance) < 100) {
      console.log('\n🚰 Balance is low. Requesting more test XRP from faucet...\n');
      
      // Use the fundWallet function which handles testnet funding
      const fundResult = await client.fundWallet();
      console.log(`✅ New wallet funded with ${xrpl.dropsToXrp(fundResult.balance)} XRP`);
      console.log(`   Address: ${fundResult.wallet.address}`);
      console.log(`\n💡 You can also get test XRP for your existing wallet at:`);
      console.log(`   https://faucet.altnet.rippletest.net/`);
      console.log(`   Just enter your address: ${walletData.address}`);
    } else {
      console.log('\n✅ You have sufficient test XRP for all demos!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

checkAndFund().catch(console.error);