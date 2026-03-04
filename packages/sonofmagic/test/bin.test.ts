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

describe('sonofmagic bin', () => {
  let previousArgv: string[]
  let previousExitCode: number | undefined

  beforeEach(() => {
    previousArgv = [...process.argv]
    previousExitCode = process.exitCode
    process.argv = ['node', 'sonofmagic', 'links']
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
      name: 'sonofmagic',
    })
    expect(process.exitCode).toBeUndefined()
  })
})
