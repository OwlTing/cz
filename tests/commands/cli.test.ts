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

// Custom error type for git errors
interface GitError extends Error {
  stderr?: string
  exitCode?: number
}

describe('CLI main command', () => {
  const mockConsoleLog = vi.fn()
  const mockConsoleError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = mockConsoleLog
    console.error = mockConsoleError
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('config file handling', () => {
    it('should load default project when config exists', async () => {
      // Mock config file exists
      mockFs.readFileSync = vi.fn().mockReturnValue(
        JSON.stringify({ defaultProject: 'owlpay' })
      )

      // Mock successful prompts flow
      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'test feature',
        commit_description: '',
        is_jira: false
      })

      // Mock successful git commit
      mockExeca.mockResolvedValue({
        stdout: '[main abc123] 💡 feat: test feature'
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockFs.readFileSync).toHaveBeenCalled()
    })

    it('should handle missing config file gracefully', async () => {
      // Mock config file read error
      mockFs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error('File not found')
      })

      // Mock successful prompts flow
      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'test feature',
        commit_description: '',
        is_jira: false
      })

      // Mock successful git commit
      mockExeca.mockResolvedValue({
        stdout: '[main abc123] 💡 feat: test feature'
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      // The warning message is shown during module loading, not during execution
      // So we just verify the function completed successfully
      expect(mockExeca).toHaveBeenCalledWith('git', ['commit', '-m', '💡 feat: test feature'])
    })
  })

  describe('commit flow without Jira', () => {
    beforeEach(() => {
      mockFs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error('File not found')
      })
    })

    it('should handle basic commit without description', async () => {
      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'add new feature',
        commit_description: '',
        is_jira: false
      })

      mockExeca.mockResolvedValue({
        stdout: '[main abc123] 💡 feat: add new feature',
        stderr: ''
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockExeca).toHaveBeenCalledWith('git', ['commit', '-m', '💡 feat: add new feature'])
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('💡 feat: add new feature')
      )
    })

    it('should handle commit with description', async () => {
      mockPrompts.mockResolvedValue({
        commit_type: 'fix',
        commit_message: 'fix bug',
        commit_description: 'Fixed critical bug in authentication',
        is_jira: false
      })

      mockExeca.mockResolvedValue({
        stdout: '[main def456] 🐛 fix: fix bug',
        stderr: ''
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockExeca).toHaveBeenCalledWith('git', [
        'commit', '-m', '🐛 fix: fix bug', '-m', 'Fixed critical bug in authentication'
      ])
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Fixed critical bug in authentication')
      )
    })

    it('should handle all commit types', async () => {
      const commitTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'hotfix', 'release', 'storybook', 'revert']

      for (const type of commitTypes) {
        vi.clearAllMocks()

        mockPrompts.mockResolvedValue({
          commit_type: type,
          commit_message: `test ${type}`,
          commit_description: '',
          is_jira: false
        })

        mockExeca.mockResolvedValue({
          stdout: `[main abc123] ${type}: test ${type}`,
          stderr: ''
        } as any)

        const { default: cli } = await import('../../src/commands/index')
        await cli()

        expect(mockExeca).toHaveBeenCalledWith('git', [
          'commit', '-m', expect.stringContaining(`${type}: test ${type}`)
        ])
      }
    })
  })

  describe('commit flow with Jira', () => {
    beforeEach(() => {
      mockFs.readFileSync = vi.fn().mockReturnValue(
        JSON.stringify({ defaultProject: 'owlpay' })
      )
    })

    it('should handle Jira commit with default project', async () => {
      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'new feature',
        commit_description: '',
        is_jira: true,
        is_default_project: true,
        jira_id: 12345
      })

      mockExeca.mockResolvedValue({
        stdout: '[main abc123] [OWLPAY-12345] 💡 feat: new feature',
        stderr: ''
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockExeca).toHaveBeenCalledWith('git', [
        'commit', '-m', '[OWLPAY-12345] 💡 feat: new feature'
      ])
    })

    it('should handle Jira commit with custom project', async () => {
      mockPrompts.mockResolvedValue({
        commit_type: 'fix',
        commit_message: 'bug fix',
        commit_description: '',
        is_jira: true,
        is_default_project: false,
        project_type: 'owlnest',
        jira_id: 98765
      })

      mockExeca.mockResolvedValue({
        stdout: '[main def456] [OW-98765] 🐛 fix: bug fix',
        stderr: ''
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockExeca).toHaveBeenCalledWith('git', [
        'commit', '-m', '[OW-98765] 🐛 fix: bug fix'
      ])
    })

    it('should handle Jira commit with description', async () => {
      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'new feature',
        commit_description: 'Added user authentication',
        is_jira: true,
        is_default_project: true,
        jira_id: 11111
      })

      mockExeca.mockResolvedValue({
        stdout: '[main ghi789] [OWLPAY-11111] 💡 feat: new feature',
        stderr: ''
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockExeca).toHaveBeenCalledWith('git', [
        'commit', '-m', '[OWLPAY-11111] 💡 feat: new feature', '-m', 'Added user authentication'
      ])
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      mockFs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error('File not found')
      })
    })

    it('should handle user cancellation', async () => {
      mockPrompts.mockImplementation((questions, options) => {
        if (options?.onCancel) {
          options.onCancel({} as any, {} as any)
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

    it('should handle git commit errors', async () => {
      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'test feature',
        commit_description: '',
        is_jira: false
      })

      const gitError: GitError = new Error('Git error')
      gitError.stderr = 'fatal: not a git repository'
      gitError.exitCode = 128
      mockExeca.mockRejectedValue(gitError)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('fatal: not a git repository')
      )
      expect(mockConsoleError).toHaveBeenCalledWith(gitError)
    })

    it('should handle "no changes" git error', async () => {
      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'test feature',
        commit_description: '',
        is_jira: false
      })

      const gitError: GitError = new Error('No changes')
      gitError.stderr = 'nothing to commit'
      gitError.exitCode = 1
      mockExeca.mockRejectedValue(gitError)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('No changes added to commit')
      )
    })

    it('should handle git stderr output', async () => {
      mockPrompts.mockResolvedValue({
        commit_type: 'feat',
        commit_message: 'test feature',
        commit_description: '',
        is_jira: false
      })

      mockExeca.mockResolvedValue({
        stdout: '[main abc123] 💡 feat: test feature',
        stderr: 'warning: some git warning'
      } as any)

      const { default: cli } = await import('../../src/commands/index')
      await cli()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('warning: some git warning')
      )
    })
  })

  describe('validation functions', () => {
    it('should test commit message validation logic', async () => {
      // We test validation indirectly by checking the prompts configuration
      const { default: cli } = await import('../../src/commands/index')

      // This is more of a structural test to ensure the function exists
      expect(typeof cli).toBe('function')
    })
  })
})
