import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { runCliMock } = vi.hoisted(() => {
  return {
    runCliMock: vi.fn(),
  }
})

vi.mock('@icebreakers/profile', () => {
  return {
    runCli: runCliMock,
  }
})

describe('yangqiming bin', () => {
  let previousArgv: string[]
  let previousExitCode: typeof process.exitCode
  let stderrWriteSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    previousArgv = [...process.argv]
    previousExitCode = process.exitCode
    process.argv = ['node', 'yangqiming', 'links']
    process.exitCode = undefined
    runCliMock.mockReset()
    stderrWriteSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
    vi.resetModules()
  })

  afterEach(() => {
    process.argv = previousArgv
    process.exitCode = previousExitCode
    stderrWriteSpy.mockRestore()
  })

  it('delegates to shared profile cli with package specific name', async () => {
    runCliMock.mockResolvedValue(undefined)

    await import('../bin/index.js')
    await Promise.resolve()

    expect(runCliMock).toHaveBeenCalledTimes(1)
    expect(runCliMock).toHaveBeenCalledWith({
      name: 'yangqiming',
    })
    expect(process.exitCode).toBeUndefined()
    expect(stderrWriteSpy).not.toHaveBeenCalled()
  })

  it('writes error to stderr and sets exit code when runCli fails', async () => {
    runCliMock.mockRejectedValue(new Error('boom'))

    await import('../bin/index.js')
    await Promise.resolve()

    expect(runCliMock).toHaveBeenCalledTimes(1)
    expect(process.exitCode).toBe(1)
    expect(stderrWriteSpy).toHaveBeenCalled()
    expect(stderrWriteSpy.mock.calls[0]?.[0]).toContain('boom')
  })
})
