import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function listPinataFiles() {
  const apiKey = process.env.PINATA_API_KEY;

  if (!apiKey) {
    console.error('PINATA_API_KEY not found in environment');
    process.exit(1);
  }

  try {
    console.log('Checking Pinata files...\n');

    const response = await axios.get('https://api.pinata.cloud/v3/files', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const files = response.data.data.files;
    console.log(`Total pinned files: ${files.length}\n`);

    if (files.length === 0) {
      console.log('No files found in Pinata');
      return;
    }

    console.log('Recent files:');
    const recentFiles = files.slice(0, 10);

    for (let i = 0; i < recentFiles.length; i++) {
      const file = recentFiles[i];
      const name = file.name || 'unnamed';
      const date = new Date(file.created_at).toLocaleString();
      const size = (file.size / 1024).toFixed(2);

      console.log(`\n${i + 1}. CID: ${file.cid}`);
      console.log(`   Name: ${name}`);
      console.log(`   Date: ${date}`);
      console.log(`   Size: ${size} KB`);
      console.log(`   Gateway: https://gateway.pinata.cloud/ipfs/${file.cid}`);
    }

    const targetCID = 'bafkreife2hfxrq74k6odmwjtrnysoij5zjoz5ozzj6st75czl6en73cp6u';
    const found = files.find(file => file.cid === targetCID);

    console.log('\n---');
    if (found) {
      console.log('Found our NFT upload!');
      console.log(`CID: ${targetCID}`);
      console.log(`Gateway: https://gateway.pinata.cloud/ipfs/${targetCID}`);
    } else {
      console.log(`Target CID not found: ${targetCID}`);
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

listPinataFiles();
