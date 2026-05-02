import { storeTokens, getAccessToken, getRefreshToken, clearTokens } from '../lib/auth_state';

jest.mock('expo-secure-store', () => require('../__mocks__/expo-secure-store'));

describe('Auth token storage', () => {
  beforeEach(async () => { await clearTokens(); });

  it('returns null before tokens are stored', async () => {
    expect(await getAccessToken()).toBeNull();
    expect(await getRefreshToken()).toBeNull();
  });

  it('stores and retrieves tokens', async () => {
    await storeTokens('access_abc', 'refresh_xyz');
    expect(await getAccessToken()).toBe('access_abc');
    expect(await getRefreshToken()).toBe('refresh_xyz');
  });

  it('clears tokens', async () => {
    await storeTokens('access_abc', 'refresh_xyz');
    await clearTokens();
    expect(await getAccessToken()).toBeNull();
    expect(await getRefreshToken()).toBeNull();
  });
});
