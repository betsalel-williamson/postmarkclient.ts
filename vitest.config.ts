import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/mocks/setup.ts'],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        ['text', { file: 'text-report.md' }], // Outputs a text table to a file (for summary embedding)
        'json',
        'html',
        'lcov',
        'text-summary'
      ],
      reportsDirectory: 'coverage/',
    },
    reporters: ['default', 'junit'],
    outputFile: 'junit.xml',
  },
});
