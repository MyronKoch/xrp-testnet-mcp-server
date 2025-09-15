import { Client, Wallet } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  privateKey: z.string().describe('Minter private key (seed)'),
  uri: z.string().describe('NFT metadata URI'),
  flags: z.number().optional().default(8).describe('NFT flags (burnable, transferable, etc)'),
  transferFee: z.number().optional().default(0).describe('Creator fee (0-50000 = 0-50%)'),
  taxon: z.number().optional().default(0).describe('NFT collection/series identifier')
});

export async function handleMintNft(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    const wallet = Wallet.fromSeed(parsed.privateKey);
    
    const mint = {
      TransactionType: 'NFTokenMint' as const,
      Account: wallet.address,
      URI: Buffer.from(parsed.uri).toString('hex').toUpperCase(),
      Flags: parsed.flags,
      TransferFee: parsed.transferFee,
      NFTokenTaxon: parsed.taxon
    };
    
    const prepared = await client.autofill(mint);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    const affectedNodes = (result.result as any).meta?.AffectedNodes || [];
    const nftNode = affectedNodes.find(
      (node: any) => node.CreatedNode?.LedgerEntryType === 'NFTokenPage'
    );
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: (result.result as any).meta?.TransactionResult === 'tesSUCCESS',
          txHash: result.result.hash,
          uri: parsed.uri,
          nftokenID: nftNode?.CreatedNode?.NewFields?.NFTokens?.[0]?.NFToken?.NFTokenID
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
}
