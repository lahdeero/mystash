import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest.setup.ts',
    watch: true,
    env: {
      NODE_ENV: 'test',
    }
  },
})
