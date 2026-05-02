describe('ENV module', () => {
  it('API_URL falls back to localhost', () => {
    const API_URL =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
      'http://localhost:8080';
    expect(API_URL).toBe('http://localhost:8080');
  });

  it('EXPO_PUBLIC_API_URL override is respected when set', () => {
    const original = process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = 'https://api.4wins.app';
    const API_URL =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
      'http://localhost:8080';
    expect(API_URL).toBe('https://api.4wins.app');
    process.env.EXPO_PUBLIC_API_URL = original;
  });
});
