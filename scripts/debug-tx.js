#!/usr/bin/env node

import * as xrpl from 'xrpl';
import fs from 'fs';
import path from 'path';

// Load wallet
const walletPath = path.join(process.cwd(), 'xrp-testnet-wallet.json');
const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));

async function debug() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  
  console.log('Fetching transactions for:', walletData.address);
  
  const txHistory = await client.request({
    command: 'account_tx',
    account: walletData.address,
    limit: 3
  });
  
  console.log('\nRaw response structure:');
  console.log('Number of transactions:', txHistory.result.transactions.length);
  
  txHistory.result.transactions.forEach((txWrapper, i) => {
    console.log(`\n--- Transaction ${i + 1} ---`);
    console.log('Keys in wrapper:', Object.keys(txWrapper));
    
    if (txWrapper.tx) {
      console.log('TX Keys:', Object.keys(txWrapper.tx));
      console.log('Type:', txWrapper.tx.TransactionType);
      console.log('Hash:', txWrapper.tx.hash);
      console.log('Amount:', txWrapper.tx.Amount);
    } else {
      console.log('No tx property found!');
      console.log('Full structure:', JSON.stringify(txWrapper, null, 2).substring(0, 500));
    }
  });
  
  await client.disconnect();
}

debug().catch(console.error);