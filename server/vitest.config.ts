import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      GEMINI_API_KEY: 'test-key',
      LOG_LEVEL: 'error',
      TELEMETRY_SIM_ENABLED: 'false',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // index.ts is the process bootstrap; *.types.ts files hold only type
      // declarations (no executable code to cover).
      exclude: ['src/index.ts', 'src/**/types.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
