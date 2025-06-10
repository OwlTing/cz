import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import type { CommitResponse, ProjectConfig, CommitResult } from '../../src/types'
import {
  loadProjectConfig,
  getDefaultProjectValue,
  buildCommitTypesList,
  buildProjectsList,
  findCommitType,
  findProject,
  buildCommitTitle,
  buildFinalCommitMessage,
  buildGitCommands,
  parseCommitResult,
  buildPromptSteps,
  showConfigMissingWarning,
  showCancelMessage,
  showCommitResult,
  showGitOutput,
  showGitError
} from '../../src/commands/index'

// Mock dependencies
vi.mock('fs')
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

describe('Refactored CLI Functions (TDD Style)', () => {
  const mockConsoleLog = vi.fn()
  const mockConsoleError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = mockConsoleLog
    console.error = mockConsoleError
  })

  describe('Configuration Loading Functions', () => {
    describe('loadProjectConfig', () => {
      it('should load valid config file', () => {
        const mockConfig = { defaultProject: 'owlpay' }
        mockFs.readFileSync = vi.fn().mockReturnValue(JSON.stringify(mockConfig))

        const result = loadProjectConfig('/path/to/config.json')

        expect(result).toEqual(mockConfig)
        expect(mockFs.readFileSync).toHaveBeenCalledWith('/path/to/config.json', 'utf8')
      })

      it('should return null for invalid config file', () => {
        mockFs.readFileSync = vi.fn().mockImplementation(() => {
          throw new Error('File not found')
        })

        const result = loadProjectConfig('/path/to/config.json')

        expect(result).toBeNull()
      })

      it('should return null for invalid JSON', () => {
        mockFs.readFileSync = vi.fn().mockReturnValue('invalid json')

        const result = loadProjectConfig('/path/to/config.json')

        expect(result).toBeNull()
      })
    })

    describe('getDefaultProjectValue', () => {
      it('should return default project when config exists', () => {
        const config: ProjectConfig = { defaultProject: 'owlpay' }
        const result = getDefaultProjectValue(config)
        expect(result).toBe('owlpay')
      })

      it('should return empty string when config is null', () => {
        const result = getDefaultProjectValue(null)
        expect(result).toBe('')
      })

      it('should return empty string when defaultProject is undefined', () => {
        const config: ProjectConfig = {}
        const result = getDefaultProjectValue(config)
        expect(result).toBe('')
      })
    })
  })

  describe('List Building Functions', () => {
    describe('buildCommitTypesList', () => {
      it('should build commit types list correctly', () => {
        const result = buildCommitTypesList()

        expect(result).toHaveLength(13)
        expect(result[0]).toMatchObject({
          title: 'chore',
          description: '🧹 Build process or auxiliary tool changes',
          value: 'chore',
          emoji: '🧹'
        })
      })
    })

    describe('buildProjectsList', () => {
      it('should build projects list correctly', () => {
        const result = buildProjectsList()

        expect(result).toHaveLength(5)
        expect(result[0]).toMatchObject({
          title: 'OwlPay',
          description: '[OWLPAY-13845] title',
          value: 'owlpay'
        })
      })
    })
  })

  describe('Finder Functions', () => {
    describe('findCommitType', () => {
      it('should find existing commit type', () => {
        const result = findCommitType('feat')
        expect(result).toMatchObject({
          name: 'feat',
          emoji: '💡',
          value: 'feat'
        })
      })

      it('should return undefined for non-existing commit type', () => {
        const result = findCommitType('nonexistent')
        expect(result).toBeUndefined()
      })
    })

    describe('findProject', () => {
      it('should find existing project', () => {
        const result = findProject('owlpay')
        expect(result).toMatchObject({
          name: 'OwlPay',
          prefix: 'OWLPAY',
          value: 'owlpay'
        })
      })

      it('should return undefined for non-existing project', () => {
        const result = findProject('nonexistent')
        expect(result).toBeUndefined()
      })
    })
  })

  describe('Commit Message Building Functions', () => {
    describe('buildCommitTitle', () => {
      it('should build commit title correctly', () => {
        const result = buildCommitTitle('feat', 'add new feature')
        expect(result).toBe('💡 feat: add new feature')
      })

      it('should throw error for invalid commit type', () => {
        expect(() => buildCommitTitle('invalid', 'message')).toThrow('Invalid commit type: invalid')
      })
    })

    describe('buildFinalCommitMessage', () => {
      it('should return plain commit title when not using Jira', () => {
        const response: CommitResponse = {
          commit_type: 'feat',
          commit_message: 'test',
          is_jira: false
        }

        const result = buildFinalCommitMessage('💡 feat: test', response, 'owlpay')
        expect(result).toBe('💡 feat: test')
      })

      it('should build Jira commit with default project', () => {
        const response: CommitResponse = {
          commit_type: 'feat',
          commit_message: 'test',
          is_jira: true,
          is_default_project: true,
          jira_id: 12345
        }

        const result = buildFinalCommitMessage('💡 feat: test', response, 'owlpay')
        expect(result).toBe('[OWLPAY-12345] 💡 feat: test')
      })

      it('should build Jira commit with selected project', () => {
        const response: CommitResponse = {
          commit_type: 'feat',
          commit_message: 'test',
          is_jira: true,
          is_default_project: false,
          project_type: 'owlnest',
          jira_id: 67890
        }

        const result = buildFinalCommitMessage('💡 feat: test', response, 'owlpay')
        expect(result).toBe('[OW-67890] 💡 feat: test')
      })

      it('should throw error for invalid project type', () => {
        const response: CommitResponse = {
          commit_type: 'feat',
          commit_message: 'test',
          is_jira: true,
          is_default_project: false,
          project_type: 'invalid'
        }

        expect(() => buildFinalCommitMessage('💡 feat: test', response, 'owlpay'))
          .toThrow('Invalid project type: invalid')
      })

      it('should throw error when Jira ID is missing', () => {
        const response: CommitResponse = {
          commit_type: 'feat',
          commit_message: 'test',
          is_jira: true,
          is_default_project: true
        }

        expect(() => buildFinalCommitMessage('💡 feat: test', response, 'owlpay'))
          .toThrow('Jira ID is required when using Jira integration')
      })
    })

    describe('buildGitCommands', () => {
      it('should build basic git command without description', () => {
        const result = buildGitCommands('feat: add feature')
        expect(result).toEqual(['commit', '-m', 'feat: add feature'])
      })

      it('should build git command with description', () => {
        const result = buildGitCommands('feat: add feature', 'detailed description')
        expect(result).toEqual(['commit', '-m', 'feat: add feature', '-m', 'detailed description'])
      })

      it('should handle empty description as falsy value', () => {
        const result = buildGitCommands('feat: add feature', '')
        // Empty string is falsy, so it should NOT include the second -m flag
        expect(result).toEqual(['commit', '-m', 'feat: add feature'])
      })
    })
  })

  describe('Result Parsing Functions', () => {
    describe('parseCommitResult', () => {
      it('should parse git commit output correctly', () => {
        const stdout = '[main abc123] feat: add new feature'
        const result = parseCommitResult(stdout)

        expect(result).toEqual({
          branch: 'main',
          hash: 'abc123'
        })
      })

      it('should handle different branch names', () => {
        const stdout = '[feature/test-branch def456] fix: bug fix'
        const result = parseCommitResult(stdout)

        expect(result).toEqual({
          branch: 'feature/test-branch',
          hash: 'def456'
        })
      })

      it('should throw error for invalid output format', () => {
        const stdout = 'invalid git output'
        expect(() => parseCommitResult(stdout)).toThrow('Could not parse commit result')
      })
    })
  })

  describe('Prompt Step Building Functions', () => {
    describe('buildPromptSteps', () => {
      it('should build all steps when default project exists', () => {
        const projectsList = buildProjectsList()
        const typesList = buildCommitTypesList()

        const steps = buildPromptSteps('owlpay', projectsList, typesList)

        expect(steps).toHaveLength(7) // All steps including default project step
        expect(steps[0]).toMatchObject({
          type: 'autocomplete',
          name: 'commit_type'
        })
      })

      it('should skip default project step when no default project', () => {
        const projectsList = buildProjectsList()
        const typesList = buildCommitTypesList()

        const steps = buildPromptSteps('', projectsList, typesList)

        expect(steps).toHaveLength(6) // Missing default project step
      })
    })
  })

  describe('Display Functions', () => {
    describe('showConfigMissingWarning', () => {
      it('should display warning message', () => {
        showConfigMissingWarning()
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('You can try `cz -i` to choose a default project prefix')
        )
      })
    })

    describe('showCancelMessage', () => {
      it('should display cancel message', () => {
        showCancelMessage()
        expect(mockConsoleLog).toHaveBeenCalledWith(' commit abort. ')
      })
    })

    describe('showCommitResult', () => {
      it('should display basic commit result', () => {
        const result: CommitResult = {
          title: 'feat: new feature'
        }

        showCommitResult(result)

        expect(mockConsoleLog).toHaveBeenCalledWith('-----------------------------------------------------------')
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('feat: new feature'))
      })

      it('should display commit result with description and hash', () => {
        const result: CommitResult = {
          title: 'feat: new feature',
          description: 'detailed description',
          hash: 'abc123',
          branch: 'main'
        }

        showCommitResult(result)

        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('feat: new feature'))
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('detailed description'))
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('abc123'))
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('main'))
      })
    })

    describe('showGitOutput', () => {
      it('should display git stdout only', () => {
        showGitOutput('git output')

        expect(mockConsoleLog).toHaveBeenCalledWith('-----------------------------------------------------------')
        expect(mockConsoleLog).toHaveBeenCalledWith('git output')
      })

      it('should display git stdout and stderr', () => {
        showGitOutput('git output', 'git error')

        expect(mockConsoleLog).toHaveBeenCalledWith('git output')
        expect(mockConsoleLog).toHaveBeenCalledWith('git error')
      })
    })

    describe('showGitError', () => {
      it('should display git error with no changes message', () => {
        const error = {
          stderr: 'git error',
          exitCode: 1
        }

        showGitError(error)

        expect(mockConsoleLog).toHaveBeenCalledWith('git error')
        expect(mockConsoleLog).toHaveBeenCalledWith(' No changes added to commit. ')
      })

      it('should display git error without special message', () => {
        const error = {
          stderr: 'some other error',
          exitCode: 2
        }

        showGitError(error)

        expect(mockConsoleLog).toHaveBeenCalledWith('some other error')
        expect(mockConsoleError).toHaveBeenCalledWith(error)
      })
    })
  })
})
