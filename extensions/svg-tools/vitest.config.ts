import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['extensions/svg-tools/tests/**/*.test.ts'],
    environment: 'node',
    clearMocks: true,
    restoreMocks: true
  }
});
