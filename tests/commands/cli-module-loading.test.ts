import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'

// Mock dependencies before importing the module
vi.mock('fs')
vi.mock('prompts')
vi.mock('execa')
vi.mock('picocolors', () => ({
  default: {
    yellow: (text: string) => text,
    italic: (text: string) => text,
    magenta: (text: string) => text,
    bgGreen: (text: string) => text,
    bold: (text: string) => text,
    green: (text: string) => text,
    cyan: (text: string) => text,
    dim: (text: string) => text,
    red: (text: string) => text,
    bgRed: (text: string) => text,
    bgCyan: (text: string) => text,
    white: (text: string) => text
  }
}))

const mockFs = vi.mocked(fs)

describe('CLI module loading behavior after refactoring', () => {
  const mockConsoleLog = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = mockConsoleLog
  })

  it('should not show warning during module load (warning moved to function execution)', async () => {
    // Mock config file read error
    mockFs.readFileSync = vi.fn().mockImplementation(() => {
      throw new Error('File not found')
    })

    // Import the module - this should NOT trigger any console.log
    await import('../../src/commands/index')

    expect(mockConsoleLog).not.toHaveBeenCalled()
  })

  it('should load module successfully when config file exists', async () => {
    // Mock successful config file read
    mockFs.readFileSync = vi.fn().mockReturnValue(
      JSON.stringify({ defaultProject: 'owlpay' })
    )

    // Import the module
    await import('../../src/commands/index')

    // No console.log should be called during module loading
    expect(mockConsoleLog).not.toHaveBeenCalled()
  })
})
