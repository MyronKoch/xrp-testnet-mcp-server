import { handleCreateWallet } from '../../../src/tools/wallet/xrp-create_wallet';

describe('xrp_create_wallet', () => {
  it('should create a new wallet with all required fields', async () => {
    const result = await handleCreateWallet({});
    const data = JSON.parse(result.content[0].text);

    expect(data).toHaveProperty('address');
    expect(data).toHaveProperty('publicKey');
    expect(data).toHaveProperty('privateKey');
    expect(data).toHaveProperty('seed');
    
    expect(data.address).toMatch(/^r[a-zA-Z0-9]{24,34}$/);
    expect(data.seed).toMatch(/^s[a-zA-Z0-9]+$/);
  });

  it('should create unique wallets on each call', async () => {
    const wallet1 = await handleCreateWallet({});
    const wallet2 = await handleCreateWallet({});
    
    const data1 = JSON.parse(wallet1.content[0].text);
    const data2 = JSON.parse(wallet2.content[0].text);

    expect(data1.address).not.toBe(data2.address);
    expect(data1.seed).not.toBe(data2.seed);
  });
});