module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-notifications$': '<rootDir>/__mocks__/expo-notifications.js',
  },
  setupFilesAfterFramework: [],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'components/**/*.ts',
    'components/**/*.tsx',
    'hooks/**/*.ts',
    '!**/__mocks__/**',
  ],
};
