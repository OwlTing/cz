import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock console.log to capture output
const mockConsoleLog = vi.fn()
console.log = mockConsoleLog

describe('where command', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show config directory path', async () => {
    // We need to dynamically import to ensure mocks are in place
    const { default: where } = await import('../../src/commands/where')

    where()

    expect(mockConsoleLog).toHaveBeenCalled()
    const output = mockConsoleLog.mock.calls[0][0]
    expect(output).toContain('Your config will be saved in')
    expect(output).toContain('src/commands')
  })

  it('should display a path ending with a period', async () => {
    const { default: where } = await import('../../src/commands/where')

    where()

    expect(mockConsoleLog).toHaveBeenCalled()
    const output = mockConsoleLog.mock.calls[0][0]
    expect(output).toMatch(/.*\.$/)
  })
})
