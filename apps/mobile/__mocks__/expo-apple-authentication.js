module.exports = {
  signInAsync: jest.fn(() =>
    Promise.resolve({
      identityToken: 'mock-identity-token',
      user: 'mock-user-id',
      fullName: { givenName: 'Test', familyName: 'User' },
      email: null,
    })
  ),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
};
