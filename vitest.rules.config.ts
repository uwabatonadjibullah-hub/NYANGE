import { defineConfig } from 'vitest/config';

// Security-rules tests. Run with: npm run test:rules (needs Java for the Firestore emulator).
export default defineConfig({
  test: { include: ['tests/**/*.rules.test.ts'], testTimeout: 20000, hookTimeout: 30000, fileParallelism: false },
});
