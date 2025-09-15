import { handleGetChainInfo } from '../../../src/tools/core/xrp-get_chain_info.js';
import { Client } from 'xrpl';

describe('xrp_get_chain_info', () => {
  let mockClient: jest.Mocked<Client>;

  beforeEach(() => {
    mockClient = {
      request: jest.fn(),
      connection: { url: 'wss://s.altnet.rippletest.net:51233' }
    } as any;
  });

  it('should return comprehensive chain information', async () => {
    mockClient.request
      .mockResolvedValueOnce({
        result: {
          info: {
            server_state: 'full',
            validated_ledger: { seq: 45000000, reserve_base_xrp: '10', reserve_inc_xrp: '2' },
            build_version: '1.9.0',
            complete_ledgers: '32570-45000000',
            network_id: 1,
            time: '2024-01-01T12:00:00.000Z'
          }
        }
      })
      .mockResolvedValueOnce({
        result: {
          ledger_index: 45000000,
          ledger: {
            ledger_hash: 'ABC123',
            close_time_human: '2024-01-01T12:00:00Z',
            close_time: 762361200,
            transactions: []
          }
        }
      })
      .mockResolvedValueOnce({
        result: {
          drops: {
            base_fee: '10',
            median_fee: '5000',
            minimum_fee: '10',
            open_ledger_fee: '10'
          }
        }
      });

    const result = await handleGetChainInfo({}, mockClient);

    expect(result.content).toHaveLength(1);
    const data = JSON.parse(result.content[0].text);
    
    expect(data).toHaveProperty('chain', 'XRP Ledger');
    expect(data).toHaveProperty('network', 'testnet');
    expect(data).toHaveProperty('current_ledger');
    expect(data).toHaveProperty('fees');
    expect(data.current_ledger.index).toBe(45000000);
  });

  it('should handle errors gracefully', async () => {
    mockClient.request.mockRejectedValueOnce(new Error('Connection failed'));

    await expect(handleGetChainInfo({}, mockClient)).rejects.toThrow(
      'Failed to get chain info: Connection failed'
    );
  });
});