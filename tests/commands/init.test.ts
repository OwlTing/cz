import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import prompts from 'prompts'

// Mock dependencies
vi.mock('fs')
vi.mock('prompts')
vi.mock('picocolors', () => ({
  default: {
    green: (text: string) => text,
    bgRed: (text: string) => text,
    white: (text: string) => text,
    magenta: (text: string) => text
  }
}))

const mockFs = vi.mocked(fs)
const mockPrompts = vi.mocked(prompts)

describe('init command', () => {
  const mockConsoleLog = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = mockConsoleLog
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should save selected project to config file', async () => {
    // Mock prompts response
    mockPrompts.mockResolvedValue({
      set_default_project: 'owlpay'
    })

    // Mock fs.writeFileSync
    mockFs.writeFileSync = vi.fn()

    const { default: init } = await import('../../src/commands/init')

    await init()

    expect(mockPrompts).toHaveBeenCalled()
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('keep/cz_config.json'),
      JSON.stringify({ defaultProject: 'owlpay' }, null, 2)
    )
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('default project set: owlpay')
    )
  })

  it('should handle user cancellation', async () => {
    // Mock prompts cancellation
    mockPrompts.mockImplementation((questions, options) => {
      if (options?.onCancel) {
        options.onCancel({} as any, {} as any)
      }
      return Promise.resolve({})
    })

    const { default: init } = await import('../../src/commands/init')

    const result = await init()

    expect(result).toBe(false)
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('init abort')
    )
  })

  it('should handle user cancellation via onSubmit with undefined', async () => {
    // Mock prompts with onSubmit returning undefined
    mockPrompts.mockImplementation((questions, options) => {
      if (options?.onSubmit) {
        // onSubmit should return true to stop, and answers being undefined triggers cancellation
        options.onSubmit({} as any, undefined, {} as any)
      }
      return Promise.resolve({})
    })

    const { default: init } = await import('../../src/commands/init')

    const result = await init()

    expect(result).toBe(false)
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('init abort')
    )
  })

  it('should handle file write errors', async () => {
    // Mock prompts response
    mockPrompts.mockResolvedValue({
      set_default_project: 'owlpay'
    })

    // Mock fs.writeFileSync to throw error
    mockFs.writeFileSync = vi.fn().mockImplementation(() => {
      throw new Error('Permission denied')
    })

    const { default: init } = await import('../../src/commands/init')

    await init()

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('init Fail')
    )
  })

  it('should present correct project choices', async () => {
    mockPrompts.mockResolvedValue({
      set_default_project: 'owlnest'
    })
    mockFs.writeFileSync = vi.fn()

    const { default: init } = await import('../../src/commands/init')

    await init()

    expect(mockPrompts).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'autocomplete',
          name: 'set_default_project',
          message: 'Set default project prefix.',
          choices: expect.arrayContaining([
            expect.objectContaining({
              title: 'OwlPay',
              value: 'owlpay'
            }),
            expect.objectContaining({
              title: 'OwlNest',
              value: 'owlnest'
            })
          ])
        })
      ]),
      expect.any(Object)
    )
  })

  it('should test all available projects in choices', async () => {
    mockPrompts.mockResolvedValue({
      set_default_project: 'market'
    })
    mockFs.writeFileSync = vi.fn()

    const { default: init } = await import('../../src/commands/init')

    await init()

    const callArgs = mockPrompts.mock.calls[0]
    const stepType = callArgs[0][0]
    expect(stepType.choices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'OwlPay', value: 'owlpay' }),
        expect.objectContaining({ title: 'OwlNest', value: 'owlnest' }),
        expect.objectContaining({ title: 'Market', value: 'market' }),
        expect.objectContaining({ title: 'PayNow', value: 'paynow' }),
        expect.objectContaining({ title: 'Wallet Pro', value: 'wallet-pro' })
      ])
    )
  })

  it('should handle successful completion with different projects', async () => {
    const projects = ['owlpay', 'owlnest', 'market', 'paynow', 'wallet-pro']

    for (const project of projects) {
      vi.clearAllMocks()

      mockPrompts.mockResolvedValue({
        set_default_project: project
      })
      mockFs.writeFileSync = vi.fn()

      const { default: init } = await import('../../src/commands/init')
      await init()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(`default project set: ${project}`)
      )
    }
  })
})
