import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import prompts from 'prompts'
import execa from 'execa'

// Mock dependencies
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
const mockPrompts = vi.mocked(prompts)
const mockExeca = vi.mocked(execa)

describe('CLI validation and edge cases', () => {
  const mockConsoleLog = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = mockConsoleLog

    // Default mock for file not found
    mockFs.readFileSync = vi.fn().mockImplementation(() => {
      throw new Error('File not found')
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('step type conditions', () => {
    it('should handle step_is_default_project conditional type', async () => {
      mockFs.readFileSync = vi.fn().mockReturnValue(
        JSON.stringify({ defaultProject: 'owlpay' })
      )

      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'test',
        commit_description: '',
        is_jira: true,
        is_default_project: false,  // This should trigger the conditional logic
        project_type: 'owlnest',
        jira_id: 123
      })

      mockExeca.mockResolvedValue({
        stdout: '[main abc123] [OW-123] 💡 feat: test',
        stderr: ''
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockExeca).toHaveBeenCalledWith('git', [
        'commit', '-m', '[OW-123] 💡 feat: test'
      ])
    })

    it('should handle step_project_type conditional logic when no default project', async () => {
      mockFs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error('File not found')
      })

      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'test',
        commit_description: '',
        is_jira: true,
        project_type: 'market',
        jira_id: 456
      })

      mockExeca.mockResolvedValue({
        stdout: '[main def456] [MAR-456] 💡 feat: test',
        stderr: ''
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockExeca).toHaveBeenCalledWith('git', [
        'commit', '-m', '[MAR-456] 💡 feat: test'
      ])
    })

    it('should handle onSubmit with undefined answers', async () => {
      mockPrompts.mockImplementation((questions, options) => {
        if (options?.onSubmit) {
          // Simulate onSubmit being called with undefined answers
          const shouldStop = options.onSubmit({} as any, undefined, {} as any)
          expect(shouldStop).toBe(true)
        }
        return Promise.resolve({})
      })

      const { default: cli } = await import('../../src/commands/index')
      const result = await cli()

      expect(result).toBe(false)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('commit abort')
      )
    })
  })

  describe('edge cases', () => {
    it('should handle no default project with Jira flow', async () => {
      // No config file, so no default project
      mockFs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error('File not found')
      })

      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'test',
        commit_description: '',
        is_jira: true,
        project_type: 'paynow',
        jira_id: 999
      })

      mockExeca.mockResolvedValue({
        stdout: '[main xyz999] [PN-999] 💡 feat: test',
        stderr: ''
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockExeca).toHaveBeenCalledWith('git', [
        'commit', '-m', '[PN-999] 💡 feat: test'
      ])
    })

    it('should handle all project types in Jira flow', async () => {
      const projects = [
        { value: 'owlpay', prefix: 'OWLPAY' },
        { value: 'owlnest', prefix: 'OW' },
        { value: 'market', prefix: 'MAR' },
        { value: 'paynow', prefix: 'PN' },
        { value: 'wallet-pro', prefix: 'WP' }
      ]

      for (const project of projects) {
        vi.clearAllMocks()

        mockFs.readFileSync = vi.fn().mockImplementation(() => {
          throw new Error('File not found')
        })

        mockPrompts.mockResolvedValue({
          commit_type: 'feat',
          commit_message: 'test',
          commit_description: '',
          is_jira: true,
          project_type: project.value,
          jira_id: 123
        })

        mockExeca.mockResolvedValue({
          stdout: `[main abc123] [${project.prefix}-123] 💡 feat: test`,
          stderr: ''
        } as any)

        const { default: cli } = await import('../../src/commands/index')
        await cli()

        expect(mockExeca).toHaveBeenCalledWith('git', [
          'commit', '-m', `[${project.prefix}-123] 💡 feat: test`
        ])
      }
    })
  })
})
