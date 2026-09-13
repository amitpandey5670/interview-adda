import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['data/tests/**/*.test.ts'],
  },
});
