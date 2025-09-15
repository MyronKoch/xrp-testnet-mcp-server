import { Client, dropsToXrp } from 'xrpl';
import { z } from 'zod';

const schema = z.object({
  address: z.string().describe('Account address')
});

export async function handleGetEscrows(
  args: any,
  client: Client
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const parsed = schema.parse(args);
    
    const response = await client.request({
      command: 'account_objects',
      account: parsed.address,
      type: 'escrow'
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          address: parsed.address,
          escrows: response.result.account_objects?.map((escrow: any) => ({
            amount: dropsToXrp(escrow.Amount),
            destination: escrow.Destination,
            condition: escrow.Condition,
            cancelAfter: escrow.CancelAfter,
            finishAfter: escrow.FinishAfter,
            sequence: escrow.PreviousTxnLgrSeq
          })) || []
        }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get escrows: ${error.message}`);
  }
}
