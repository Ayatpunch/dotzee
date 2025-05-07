import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // You can add more configuration here as needed
    // setupFiles: './src/setupTests.ts', // if you need setup files
  },
});
