const API_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:8080';

export const ENV = {
  API_URL,
} as const;
