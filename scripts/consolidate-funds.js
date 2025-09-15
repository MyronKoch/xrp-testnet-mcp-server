#!/usr/bin/env node

import * as xrpl from 'xrpl';
import fs from 'fs';
import path from 'path';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║           💰 CONSOLIDATING ALL XRP TO MAIN WALLET 💰           ║
╚════════════════════════════════════════════════════════════════╝
`);

async function consolidateFunds() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  
  try {
    // Load main wallet
    const walletPath = path.join(process.cwd(), 'xrp-testnet-wallet.json');
    const mainWalletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    
    console.log('📊 CURRENT STATUS:\n');
    
    // Check main wallet balance
    const mainBalance = await client.getXrpBalance(mainWalletData.address);
    console.log(`Main Wallet (${mainWalletData.address.slice(0, 8)}...):`);
    console.log(`💰 Balance: ${mainBalance} XRP\n`);
    
    // The test wallet we created but don't have the seed for
    const orphanWallet = 'rN2t1W5wDwwL8it5HH3hfdwWkmDkM7nEaF';
    
    try {
      const orphanBalance = await client.getXrpBalance(orphanWallet);
      console.log(`Orphan Test Wallet (${orphanWallet.slice(0, 8)}...):`);
      console.log(`💰 Balance: ${orphanBalance} XRP`);
      console.log(`❌ No seed available - can't transfer these funds\n`);
    } catch (e) {
      console.log(`Orphan wallet not found or empty\n`);
    }
    
    console.log('═'.repeat(60));
    console.log('\n🔧 SOLUTION: Get fresh funds from faucet!\n');
    
    console.log('Since we can\'t access the orphan wallet, let\'s get new funds:');
    console.log('\n1️⃣  OPTION 1: Use the faucet manually');
    console.log(`   → Visit: https://faucet.altnet.rippletest.net/`);
    console.log(`   → Enter: ${mainWalletData.address}`);
    console.log(`   → Get 10 XRP instantly\n`);
    
    console.log('2️⃣  OPTION 2: Use fundWallet() to create & fund new wallet');
    console.log('   → Then transfer to main wallet\n');
    
    const answer = 'y'; // Auto-proceed for demo
    
    if (answer === 'y') {
      console.log('Creating new funded wallet...\n');
      
      // Create and fund a new wallet
      const { wallet: newWallet, balance } = await client.fundWallet();
      
      console.log(`✅ New wallet created and funded!`);
      console.log(`   Address: ${newWallet.address}`);
      console.log(`   Balance: ${xrpl.dropsToXrp(balance)} XRP`);
      console.log(`   Seed: ${newWallet.seed}\n`);
      
      // Save the new wallet for records
      const newWalletData = {
        created: new Date().toISOString(),
        purpose: 'Temporary wallet for fund consolidation',
        address: newWallet.address,
        publicKey: newWallet.publicKey,
        privateKey: newWallet.privateKey,
        seed: newWallet.seed,
        balance: xrpl.dropsToXrp(balance)
      };
      
      fs.writeFileSync(
        'temp-consolidation-wallet.json',
        JSON.stringify(newWalletData, null, 2)
      );
      
      console.log('💾 Saved to temp-consolidation-wallet.json\n');
      
      // Now transfer to main wallet
      console.log('📤 Transferring funds to main wallet...\n');
      
      // Reserve requirement is 10 XRP, so we can only send the excess
      const availableToSend = parseFloat(xrpl.dropsToXrp(balance)) - 10.1; // Keep 10.1 for reserve
      
      if (availableToSend > 0) {
        const payment = {
          TransactionType: 'Payment',
          Account: newWallet.address,
          Destination: mainWalletData.address,
          Amount: xrpl.xrpToDrops(availableToSend.toString()),
          Fee: '12'
        };
        
        const prepared = await client.autofill(payment);
        const signed = newWallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);
        
        if (result.result.meta.TransactionResult === 'tesSUCCESS') {
          console.log(`✅ Transfer successful!`);
          console.log(`   Sent: ${availableToSend} XRP`);
          console.log(`   Transaction: ${result.result.hash}\n`);
        } else {
          console.log(`❌ Transfer failed: ${result.result.meta.TransactionResult}\n`);
        }
      } else {
        console.log('⚠️  New wallet only has reserve amount, nothing to transfer\n');
      }
      
      // Check final balance
      const finalBalance = await client.getXrpBalance(mainWalletData.address);
      console.log('═'.repeat(60));
      console.log('\n📊 FINAL STATUS:\n');
      console.log(`Main Wallet Balance: ${finalBalance} XRP`);
      console.log(`Increase: +${(parseFloat(finalBalance) - parseFloat(mainBalance)).toFixed(6)} XRP`);
      
    }
    
    console.log('\n💡 TIP: You can use the faucet multiple times!');
    console.log('   Each request gives 10 XRP to your main wallet.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

consolidateFunds().catch(console.error);