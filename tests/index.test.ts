import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the command modules
vi.mock('../src/commands', () => ({
  default: vi.fn()
}))

vi.mock('../src/commands/init', () => ({
  default: vi.fn()
}))

vi.mock('../src/commands/where', () => ({
  default: vi.fn()
}))

describe('main index', () => {
  let mockCli: any
  let mockInit: any
  let mockWhere: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Import mocked modules
    mockCli = (await import('../src/commands')).default
    mockInit = (await import('../src/commands/init')).default
    mockWhere = (await import('../src/commands/where')).default
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call init command when --init flag is provided', async () => {
    const { run } = await import('../src/index')

    await run(['cz', '--init'])

    expect(mockInit).toHaveBeenCalled()
    expect(mockCli).not.toHaveBeenCalled()
    expect(mockWhere).not.toHaveBeenCalled()
  })

  it('should call init command when -i flag is provided', async () => {
    const { run } = await import('../src/index')

    await run(['cz', '-i'])

    expect(mockInit).toHaveBeenCalled()
    expect(mockCli).not.toHaveBeenCalled()
    expect(mockWhere).not.toHaveBeenCalled()
  })

  it('should call where command when --where flag is provided', async () => {
    const { run } = await import('../src/index')

    await run(['cz', '--where'])

    expect(mockWhere).toHaveBeenCalled()
    expect(mockInit).not.toHaveBeenCalled()
    expect(mockCli).not.toHaveBeenCalled()
  })

  it('should call where command when -w flag is provided', async () => {
    const { run } = await import('../src/index')

    await run(['cz', '-w'])

    expect(mockWhere).toHaveBeenCalled()
    expect(mockInit).not.toHaveBeenCalled()
    expect(mockCli).not.toHaveBeenCalled()
  })

  it('should call default cli command when no flags are provided', async () => {
    const { run } = await import('../src/index')

    await run(['cz'])

    expect(mockCli).toHaveBeenCalled()
    expect(mockInit).not.toHaveBeenCalled()
    expect(mockWhere).not.toHaveBeenCalled()
  })

  it('should handle multiple arguments correctly', async () => {
    const { run } = await import('../src/index')

    await run(['cz', 'some', 'other', 'args'])

    expect(mockCli).toHaveBeenCalled()
    expect(mockInit).not.toHaveBeenCalled()
    expect(mockWhere).not.toHaveBeenCalled()
  })
})
