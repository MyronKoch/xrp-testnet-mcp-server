#!/usr/bin/env node

import * as xrpl from 'xrpl';
import { TronWeb } from 'tronweb';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { utils } from 'near-api-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Store wallet info
const wallets = {
  xrp: {},
  tron: {},
  sui: {},
  near: {},
  generated: new Date().toISOString()
};

console.log('🔑 Creating Test Wallets and Requesting Tokens\n');
console.log('=' .repeat(50));

// 1. XRP Testnet Wallet
async function createXRPWallet() {
  console.log('\n📍 XRP Testnet:');
  try {
    // Generate wallet
    const wallet = xrpl.Wallet.generate();
    wallets.xrp = {
      address: wallet.address,
      seed: wallet.seed,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey
    };
    console.log('✅ Wallet created:', wallet.address);
    
    // Connect to testnet
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    
    // Fund wallet using faucet
    console.log('💰 Requesting funds from faucet...');
    const fundResult = await client.fundWallet(wallet);
    console.log('✅ Funded! Balance:', fundResult.balance, 'XRP');
    console.log('   Transaction:', fundResult.transactionHash);
    
    wallets.xrp.funded = true;
    wallets.xrp.balance = fundResult.balance;
    wallets.xrp.txHash = fundResult.transactionHash;
    
    await client.disconnect();
  } catch (error) {
    console.log('❌ Error:', error.message);
    wallets.xrp.error = error.message;
  }
}

// 2. TRON Shasta Wallet
async function createTRONWallet() {
  console.log('\n📍 TRON Shasta Testnet:');
  try {
    // Create TronWeb instance
    const tronWeb = new TronWeb({
      fullHost: 'https://api.shasta.trongrid.io',
      headers: { "TRON-PRO-API-KEY": '' }
    });
    
    // Generate wallet
    const account = await tronWeb.createAccount();
    wallets.tron = {
      address: account.address.base58,
      hexAddress: account.address.hex,
      privateKey: account.privateKey,
      publicKey: account.publicKey
    };
    console.log('✅ Wallet created:', account.address.base58);
    
    // Request from faucet (using API)
    console.log('💰 Requesting funds from faucet...');
    const faucetUrl = 'https://api.shasta.trongrid.io/wallet/requestaccountresource';
    const response = await fetch(faucetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: account.address.hex,
        visible: true
      })
    });
    
    if (response.ok) {
      console.log('✅ Faucet request submitted! Check balance in a few seconds.');
      wallets.tron.faucetRequested = true;
    } else {
      console.log('⚠️  Faucet request failed:', await response.text());
      wallets.tron.faucetRequested = false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    wallets.tron.error = error.message;
  }
}

// 3. Sui Testnet Wallet
async function createSuiWallet() {
  console.log('\n📍 Sui Testnet:');
  try {
    // Generate wallet
    const keypair = new Ed25519Keypair();
    const address = keypair.getPublicKey().toSuiAddress();
    
    wallets.sui = {
      address: address,
      publicKey: keypair.getPublicKey().toString(),
      privateKey: keypair.export().privateKey
    };
    console.log('✅ Wallet created:', address);
    
    // Request from faucet
    console.log('💰 Requesting funds from faucet...');
    const response = await fetch('https://faucet.testnet.sui.io/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Funded! Transaction:', result.transferredGasObjects?.[0]?.id || 'Success');
      wallets.sui.funded = true;
    } else {
      console.log('⚠️  Faucet request failed:', response.statusText);
      wallets.sui.funded = false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    wallets.sui.error = error.message;
  }
}

// 4. NEAR Testnet Wallet
async function createNEARWallet() {
  console.log('\n📍 NEAR Testnet:');
  try {
    // Generate keypair
    const keyPair = utils.KeyPair.fromRandom('ed25519');
    const publicKey = keyPair.getPublicKey().toString();
    const privateKey = keyPair.toString();
    
    // Generate random account name
    const accountId = `test-${Date.now()}.testnet`;
    
    wallets.near = {
      accountId: accountId,
      publicKey: publicKey,
      privateKey: privateKey
    };
    console.log('✅ Wallet generated:', accountId);
    console.log('   Public Key:', publicKey);
    
    // Note: Creating funded account requires existing account or helper service
    console.log('⚠️  Note: To fund this account, use:');
    console.log(`   near create-account ${accountId} --useFaucet`);
    console.log('   Or request from https://near-faucet.io/');
    
    wallets.near.funded = false;
    wallets.near.note = 'Manual funding required - see instructions';
  } catch (error) {
    console.log('❌ Error:', error.message);
    wallets.near.error = error.message;
  }
}

// 5. Solana Devnet Wallet (attempt without mainnet requirement)
async function createSolanaWallet() {
  console.log('\n📍 Solana Devnet:');
  try {
    const { Keypair } = await import('@solana/web3.js');
    
    // Generate wallet
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toString();
    const secretKey = Buffer.from(keypair.secretKey).toString('hex');
    
    wallets.solana = {
      address: publicKey,
      privateKey: secretKey
    };
    console.log('✅ Wallet created:', publicKey);
    
    // CLI command for funding
    console.log('💰 To request funds, run:');
    console.log(`   solana airdrop 1 ${publicKey} --url devnet`);
    
    wallets.solana.funded = false;
    wallets.solana.note = 'Use CLI command to request airdrop';
  } catch (error) {
    console.log('❌ Error:', error.message);
    wallets.solana = { error: 'Solana SDK not installed' };
  }
}

// Save wallets to file
function saveWallets() {
  const outputPath = path.join(process.cwd(), 'test-wallets.json');
  fs.writeFileSync(outputPath, JSON.stringify(wallets, null, 2));
  console.log('\n💾 Wallets saved to:', outputPath);
  
  // Create a safe version without private keys
  const safeWallets = JSON.parse(JSON.stringify(wallets));
  for (const chain in safeWallets) {
    if (safeWallets[chain].privateKey) {
      safeWallets[chain].privateKey = '***HIDDEN***';
    }
    if (safeWallets[chain].seed) {
      safeWallets[chain].seed = '***HIDDEN***';
    }
  }
  
  const safePath = path.join(process.cwd(), 'test-wallets-public.json');
  fs.writeFileSync(safePath, JSON.stringify(safeWallets, null, 2));
  console.log('📋 Public info saved to:', safePath);
}

// Run all wallet creations
async function main() {
  console.log('Creating wallets for chains with no mainnet requirements...\n');
  
  await createXRPWallet();
  await createTRONWallet();
  await createSuiWallet();
  await createNEARWallet();
  await createSolanaWallet();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY\n');
  
  const funded = [];
  const manual = [];
  const failed = [];
  
  for (const [chain, wallet] of Object.entries(wallets)) {
    if (chain === 'generated') continue;
    if (wallet.funded) {
      funded.push(chain.toUpperCase());
    } else if (wallet.error) {
      failed.push(chain.toUpperCase());
    } else {
      manual.push(chain.toUpperCase());
    }
  }
  
  console.log('✅ Auto-funded:', funded.join(', ') || 'None');
  console.log('⚠️  Manual required:', manual.join(', ') || 'None');
  console.log('❌ Failed:', failed.join(', ') || 'None');
  
  saveWallets();
  
  console.log('\n⚠️  SECURITY REMINDER:');
  console.log('These are TESTNET wallets only - never use for mainnet!');
  console.log('Keep test-wallets.json secure and do not commit to git.');
}

main().catch(console.error);