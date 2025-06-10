// Test setup file
import { vi } from 'vitest'

// Setup global mocks
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}
