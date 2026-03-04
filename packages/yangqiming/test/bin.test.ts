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

  beforeEach(() => {
    previousArgv = [...process.argv]
    previousExitCode = process.exitCode
    process.argv = ['node', 'yangqiming', 'links']
    process.exitCode = undefined
    runCliMock.mockReset()
    runCliMock.mockResolvedValue(undefined)
    vi.resetModules()
  })

  afterEach(() => {
    process.argv = previousArgv
    process.exitCode = previousExitCode
  })

  it('delegates to shared profile cli with package specific name', async () => {
    await import('../bin/index.js')
    await Promise.resolve()

    expect(runCliMock).toHaveBeenCalledTimes(1)
    expect(runCliMock).toHaveBeenCalledWith({
      name: 'yangqiming',
    })
    expect(process.exitCode).toBeUndefined()
  })
})
