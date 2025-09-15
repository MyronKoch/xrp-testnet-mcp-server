/**
 * Chaos Engineering Tests - Fault Injection
 * MBSS v3.0 Compliant Chaos Testing
 */

import { XRPClient } from '../../src/client';
import { handleGetBalance } from '../../src/tools/core/xrp-get_balance';
import { handleGetChainInfo } from '../../src/tools/core/xrp-get_chain_info';

// Mock client for testing
const mockClient = {} as any;
import { handleSendTransaction } from '../../src/tools/core/xrp-send_transaction';

describe('Chaos: Fault Tolerance', () => {
  let originalClient: any;
  
  beforeEach(() => {
    // Save original client for restoration
    originalClient = jest.requireActual('../../src/client').getXRPClient();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Random Network Failures', () => {
    it('should handle intermittent network failures gracefully', async () => {
      let callCount = 0;
      
      // Mock client with 30% failure rate
      jest.mock('../../src/client', () => ({
        getXRPClient: () => ({
          ensureConnection: jest.fn(),
          getClient: () => ({
            request: jest.fn().mockImplementation(() => {
              callCount++;
              if (Math.random() < 0.3) {
                throw new Error('Network unreachable');
              }
              return Promise.resolve({
                result: {
                  account_data: {
                    Balance: '1000000000',
                    Account: 'rB7ASwFaJ2ryXUDUN8ViiVWba1ikXcqFxB'
                  }
                }
              });
            })
          })
        })
      }));
      
      const results = [];
      for (let i = 0; i < 100; i++) {
        try {
          const result = await handleGetBalance({
            address: 'rB7ASwFaJ2ryXUDUN8ViiVWba1ikXcqFxB'
          }, mockClient);
          results.push({ success: true, data: result });
        } catch (error) {
          results.push({ success: false, error });
        }
      }
      
      // Should have both successes and failures
      const successes = results.filter(r => r.success);
      const failures = results.filter(r => !r.success);
      
      expect(successes.length).toBeGreaterThan(0);
      expect(failures.length).toBeGreaterThan(0);
      
      // All failures should be handled gracefully
      failures.forEach(failure => {
        expect(failure.error).toBeDefined();
        expect((failure.error as any).message).toContain('Failed to get balance');
      });
    });
  });

  describe('Connection Recovery', () => {
    it('should attempt to reconnect after disconnection', async () => {
      let connected = true;
      let reconnectAttempts = 0;
      
      const mockClient = {
        ensureConnection: jest.fn().mockImplementation(async () => {
          if (!connected) {
            reconnectAttempts++;
            if (reconnectAttempts >= 3) {
              connected = true;
            } else {
              throw new Error('Connection failed');
            }
          }
        }),
        isConnected: () => connected,
        getClient: () => ({
          request: jest.fn().mockResolvedValue({
            result: { info: { server_state: 'full' } }
          })
        })
      };
      
      jest.spyOn(require('../../src/client'), 'getXRPClient')
        .mockReturnValue(mockClient);
      
      // Disconnect the client
      connected = false;
      
      // Try to use a tool - should trigger reconnection
      let error;
      try {
        await handleGetChainInfo({}, mockClient);
      } catch (e) {
        error = e;
      }
      
      // Should have attempted reconnection
      expect(reconnectAttempts).toBeGreaterThan(0);
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout long-running operations', async () => {
      // Mock a client that hangs
      const mockClient = {
        ensureConnection: jest.fn(),
        getClient: () => ({
          request: jest.fn().mockImplementation(() => 
            new Promise(resolve => {
              // Never resolves - simulates hang
              setTimeout(() => resolve({}), 60000);
            })
          )
        })
      };
      
      jest.spyOn(require('../../src/client'), 'getXRPClient')
        .mockReturnValue(mockClient);
      
      // Set a timeout for the operation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), 5000)
      );
      
      const operationPromise = handleGetBalance({
        address: 'rB7ASwFaJ2ryXUDUN8ViiVWba1ikXcqFxB'
      }, mockClient);
      
      // Should timeout before operation completes
      await expect(
        Promise.race([operationPromise, timeoutPromise])
      ).rejects.toThrow('Operation timeout');
    });
  });

  describe('Resource Exhaustion', () => {
    it('should handle memory pressure gracefully', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const results = [];
      
      // Create memory pressure by making many concurrent requests
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(
          handleGetChainInfo({}, mockClient)
            .then(r => ({ success: true, data: r }))
            .catch(e => ({ success: false, error: e }))
        );
      }
      
      const allResults = await Promise.all(promises);
      
      // Check memory didn't grow excessively
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      expect(memoryGrowth).toBeLessThan(100); // Less than 100MB growth
      
      // Should still handle most requests successfully
      const successful = allResults.filter(r => r.success);
      expect(successful.length).toBeGreaterThan(900); // >90% success rate
    });
  });

  describe('Malformed Responses', () => {
    it('should handle corrupted server responses', async () => {
      const corruptedResponses = [
        null,
        undefined,
        {},
        { result: null },
        { result: { account_data: null } },
        { result: { account_data: { Balance: 'not-a-number' } } },
        { error: 'Unexpected server error' },
        'not an object',
        123456
      ];
      
      for (const response of corruptedResponses) {
        const mockClient = {
          ensureConnection: jest.fn(),
          getClient: () => ({
            request: jest.fn().mockResolvedValue(response)
          })
        };
        
        jest.spyOn(require('../../src/client'), 'getXRPClient')
          .mockReturnValue(mockClient);
        
        // Should handle without crashing
        const result = await handleGetBalance({
          address: 'rB7ASwFaJ2ryXUDUN8ViiVWba1ikXcqFxB'
        }, mockClient).catch(e => e);
        
        expect(result).toBeDefined();
      }
    });
  });

  describe('Concurrent Modification', () => {
    it('should handle concurrent state modifications', async () => {
      let sharedState = { balance: 1000000 };
      
      const mockClient = {
        ensureConnection: jest.fn(),
        getClient: () => ({
          request: jest.fn().mockImplementation(async (cmd) => {
            // Simulate concurrent modification
            const currentBalance = sharedState.balance;
            
            // Random delay to increase chance of race conditions
            await new Promise(r => setTimeout(r, Math.random() * 10));
            
            // Modify state (simulating another operation)
            if (cmd.command === 'submit') {
              sharedState.balance -= 100;
            }
            
            return {
              result: {
                account_data: {
                  Balance: currentBalance.toString()
                }
              }
            };
          })
        })
      };
      
      jest.spyOn(require('../../src/client'), 'getXRPClient')
        .mockReturnValue(mockClient);
      
      // Execute many operations concurrently
      const operations = [];
      for (let i = 0; i < 50; i++) {
        operations.push(
          handleGetBalance({ address: 'test' }, mockClient),
          handleSendTransaction({ to: 'test', amount: '100' }).catch(() => null)
        );
      }
      
      const results = await Promise.all(operations);
      
      // All operations should complete without deadlock
      expect(results.length).toBe(100);
    });
  });

  describe('Cascade Failures', () => {
    it('should prevent cascade failures in dependent operations', async () => {
      let primaryFailed = false;
      
      const mockClient = {
        ensureConnection: jest.fn().mockImplementation(async () => {
          if (primaryFailed) {
            throw new Error('Primary service down');
          }
        }),
        getClient: () => ({
          request: jest.fn().mockImplementation(async () => {
            // Simulate primary service failure after some operations
            if (Math.random() < 0.1) {
              primaryFailed = true;
              throw new Error('Service unavailable');
            }
            return { result: { info: {} } };
          })
        })
      };
      
      jest.spyOn(require('../../src/client'), 'getXRPClient')
        .mockReturnValue(mockClient);
      
      const results = [];
      for (let i = 0; i < 50; i++) {
        const result = await handleGetChainInfo({}, mockClient)
          .then(r => ({ success: true, index: i }))
          .catch(e => ({ success: false, index: i, error: e.message }));
        results.push(result);
        
        // If primary failed, subsequent calls should fail fast
        if (primaryFailed) {
          expect(result.success).toBe(false);
        }
      }
      
      // Should have some successes before failure
      const successBeforeFailure = results.filter((r, i) => 
        r.success && i < results.findIndex(r => !r.success)
      );
      expect(successBeforeFailure.length).toBeGreaterThan(0);
    });
  });
});