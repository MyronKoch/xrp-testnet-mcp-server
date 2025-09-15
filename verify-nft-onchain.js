import xrpl from 'xrpl';

async function verifyNFT() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  
  try {
    await client.connect();
    console.log('Connected to XRP Testnet\n');

    const txHash = 'C74001AA2F2111E9882259BECF84A76C9FE73DC01EBA9C8C527C37115A75F02A';
    
    const tx = await client.request({
      command: 'tx',
      transaction: txHash
    });

    console.log('Full response:', JSON.stringify(tx.result, null, 2));
    const txData = tx.result;

    console.log('Transaction Details:');
    console.log('Type:', txData.TransactionType);
    console.log('Account:', txData.Account);
    console.log('Result:', txData.meta.TransactionResult);

    if (txData.URI) {
      const uri = Buffer.from(txData.URI, 'hex').toString('utf8');
      console.log('\nNFT URI:', uri);
      console.log('Gateway:', uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'));
    }

    const nftNode = txData.meta.AffectedNodes.find(
      node => node.CreatedNode && node.CreatedNode.LedgerEntryType === 'NFTokenPage'
    );

    if (nftNode) {
      const nftId = nftNode.CreatedNode.NewFields.NFTokens[0].NFToken.NFTokenID;
      console.log('\nNFT ID:', nftId);
      console.log('\nVerification: NFT successfully minted with IPFS metadata!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.disconnect();
  }
}

verifyNFT();
