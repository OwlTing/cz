import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'tests/**',
        'dist/**',
        'coverage/**',
        '*.config.{js,ts}',
        'bin/**',
        'scripts/**',
        'src/types/**'
      ],
      all: true
    }
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
})
