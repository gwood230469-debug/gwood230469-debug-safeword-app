import { defineConfig } from 'vitest/config';

// These lib modules are plain TypeScript with no JSX/React Native rendering
// involved, so a plain node environment with no special transform config is
// enough — the only wrinkle is that a couple of them import Expo native
// modules (expo-crypto, expo-linking) and react-native, which the relevant
// test files mock with vi.mock().
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
