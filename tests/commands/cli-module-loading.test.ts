import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'

// Mock dependencies before importing the module
vi.mock('fs')
vi.mock('picocolors', () => ({
  default: {
    yellow: (text: string) => text,
    italic: (text: string) => text
  }
}))

const mockFs = vi.mocked(fs)

describe('CLI module loading', () => {
  const mockConsoleLog = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = mockConsoleLog
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show warning when config file is missing during module load', async () => {
    // Mock config file read error
    mockFs.readFileSync = vi.fn().mockImplementation(() => {
      throw new Error('File not found')
    })

    // Import the module to trigger the warning
    await import('../../src/commands/index')

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('You can try `cz -i` to choose a default project prefix')
    )
  })

  it('should not show warning when config file exists during module load', async () => {
    // Mock config file exists
    mockFs.readFileSync = vi.fn().mockReturnValue(
      JSON.stringify({ defaultProject: 'owlpay' })
    )

    // Clear any previous console calls
    mockConsoleLog.mockClear()

    // Import the module
    await import('../../src/commands/index')

    // Should not have warning message
    expect(mockConsoleLog).not.toHaveBeenCalledWith(
      expect.stringContaining('You can try `cz -i` to choose a default project prefix')
    )
  })
})
