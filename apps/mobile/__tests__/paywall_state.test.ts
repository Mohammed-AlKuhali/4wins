import { hasPaywallBeenShown, markPaywallShown, clearPaywallState } from '../lib/paywall_state';

jest.mock('expo-secure-store', () => require('../__mocks__/expo-secure-store'));

describe('Paywall state', () => {
  beforeEach(async () => { await clearPaywallState(); });

  it('returns false before paywall shown', async () => {
    expect(await hasPaywallBeenShown()).toBe(false);
  });

  it('returns true after marking shown', async () => {
    await markPaywallShown();
    expect(await hasPaywallBeenShown()).toBe(true);
  });

  it('returns false after clearing', async () => {
    await markPaywallShown();
    await clearPaywallState();
    expect(await hasPaywallBeenShown()).toBe(false);
  });
});
