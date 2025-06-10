import { vi } from 'vitest'

/**
 * Creates a mock console object for testing console output
 */
export function createMockConsole() {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
}

/**
 * Helper to mock prompts responses
 */
export function mockPromptsResponse(response: any) {
  const prompts = vi.hoisted(() => vi.fn())
  prompts.mockResolvedValue(response)
  return prompts
}

/**
 * Helper to mock file system operations
 */
export function createMockFs() {
  return {
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    existsSync: vi.fn()
  }
}

/**
 * Helper to test git command execution
 */
export function mockGitExecution(result: { stdout: string; stderr?: string; exitCode?: number }) {
  const execa = vi.hoisted(() => vi.fn())
  execa.mockResolvedValue({
    stdout: result.stdout,
    stderr: result.stderr || '',
    exitCode: result.exitCode || 0
  })
  return execa
}
