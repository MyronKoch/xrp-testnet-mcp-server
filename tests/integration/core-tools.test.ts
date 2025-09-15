import { Client } from 'xrpl';
import { handleGetAccountInfo } from '../../src/tools/account/xrp-get_account_info.js';
import { handleGetBalance } from '../../src/tools/core/xrp-get_balance.js';
import { handleGetTransaction } from '../../src/tools/core/xrp-get_transaction.js';
import { handleValidateAddress } from '../../src/tools/core/xrp-validate_address.js';

describe('XRP Core Tools - MBPS v2.1 Compliance', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client('wss://s.altnet.rippletest.net:51233');
  });

  afterEach(async () => {
    if (client.isConnected()) {
      await client.disconnect();
    }
  });

  describe('xrp_get_account_info', () => {
    it('should return account information for valid address', async () => {
      const testAddress = 'rB7ASwFaJ2ryXUDUN8ViiVWba1ikXcqFxB'; // Valid XRP address
      
      try {
        const result = await handleGetAccountInfo(
          { address: testAddress },
          client
        );
        
        expect(result).toHaveProperty('content');
        expect(result.content).toBeInstanceOf(Array);
        expect(result.content[0]).toHaveProperty('type', 'text');
        
        const accountInfo = JSON.parse(result.content[0].text);
        expect(accountInfo).toHaveProperty('address');
        expect(accountInfo).toHaveProperty('status');
      } catch (error: any) {
        // Account may not exist on testnet - expect tool-specific error format
        expect(error.message).toMatch(/Failed to get account info|Account not found/i);
      }
    });

    it('should reject invalid address', async () => {
      await expect(
        handleGetAccountInfo({ address: 'invalid' }, client)
      ).rejects.toThrow();
    });
  });

  describe('xrp_get_balance', () => {
    it('should return balance for valid address', async () => {
      const testAddress = 'rB7ASwFaJ2ryXUDUN8ViiVWba1ikXcqFxB'; // Valid XRP address
      
      try {
        const result = await handleGetBalance(
          { address: testAddress },
          client
        );
        
        expect(result).toHaveProperty('content');
        expect(result.content).toBeInstanceOf(Array);
        
        const balance = JSON.parse(result.content[0].text);
        expect(balance).toHaveProperty('address', testAddress);
        expect(balance).toHaveProperty('balance');
      } catch (error: any) {
        // Account may not exist on testnet - expect tool-specific error format
        expect(error.message).toMatch(/Failed to get balance|Account not found/i);
      }
    });
  });

  describe('xrp_validate_address', () => {
    it('should validate correct XRP address', async () => {
      const validAddress = 'rB7ASwFaJ2ryXUDUN8ViiVWba1ikXcqFxB'; // Use the same valid address
      const result = await handleValidateAddress({ address: validAddress });
      
      expect(result).toHaveProperty('content');
      const validation = JSON.parse(result.content[0].text);
      expect(validation).toHaveProperty('valid', true);
      expect(validation).toHaveProperty('address', validAddress);
    });

    it('should reject invalid XRP address', async () => {
      const invalidAddress = 'invalid_address';
      const result = await handleValidateAddress({ address: invalidAddress });
      
      const validation = JSON.parse(result.content[0].text);
      expect(validation).toHaveProperty('valid', false);
      expect(validation).toHaveProperty('error');
    });
  });

  describe('xrp_get_transaction', () => {
    it('should handle transaction lookup', async () => {
      const testTxHash = '0' + '0'.repeat(63); // 64 char hex
      
      try {
        const result = await handleGetTransaction(
          { hash: testTxHash },
          client
        );
        expect(result).toHaveProperty('content');
      } catch (error: any) {
        // Expected for non-existent transaction
        expect(error.message).toMatch(/transaction|not found/i);
      }
    });
  });
});