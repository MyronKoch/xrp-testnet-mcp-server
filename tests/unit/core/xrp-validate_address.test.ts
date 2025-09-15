import { handleValidateAddress } from '../../../src/tools/core/xrp-validate_address.js';

describe('xrp_validate_address', () => {
  it('should validate correct XRP address', async () => {
    const result = await handleValidateAddress({
      address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
    });

    const data = JSON.parse(result.content[0].text);
    expect(data.valid).toBe(true);
    expect(data.address).toBe('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH');
  });

  it('should reject invalid XRP address', async () => {
    const result = await handleValidateAddress({
      address: 'invalid-address'
    });

    const data = JSON.parse(result.content[0].text);
    expect(data.valid).toBe(false);
    expect(data.error).toContain('Invalid');
  });

  it('should reject non-r prefixed address', async () => {
    const result = await handleValidateAddress({
      address: 'xN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
    });

    const data = JSON.parse(result.content[0].text);
    expect(data.valid).toBe(false);
  });

  it('should handle missing address parameter', async () => {
    await expect(handleValidateAddress({})).rejects.toThrow();
  });
});