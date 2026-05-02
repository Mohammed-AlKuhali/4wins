import { syncWidgetState } from '../lib/widget_sync';

jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'ios' },
}));

describe('Widget sync', () => {
  it('does not throw when NativeModules.WidgetSync is absent', async () => {
    await expect(
      syncWidgetState({ date: '2026-05-02', pillarsLogged: ['mental'], isClosed: false })
    ).resolves.not.toThrow();
  });
});
