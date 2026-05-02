module.exports = {
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
  makeRedirectUri: jest.fn(() => 'fourwins://redirect'),
  ResponseType: { Token: 'token' },
  Prompt: { SelectAccount: 'select_account' },
};
