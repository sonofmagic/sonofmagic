import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mainMock, errorMock } = vi.hoisted(() => {
  return {
    mainMock: vi.fn(),
    errorMock: vi.fn(),
  }
})

vi.mock('../src/program', () => {
  return {
    main: mainMock,
  }
})

vi.mock('../src/logger', () => {
  return {
    consoleError: errorMock,
  }
})

async function loadRunCli() {
  const cliModule = await import('../src/cli')
  return cliModule.runCli
}

describe('runCli', () => {
  let previousExitCode: number | undefined
  let infoSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    previousExitCode = process.exitCode
    process.exitCode = undefined
    mainMock.mockReset()
    errorMock.mockReset()
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    infoSpy.mockRestore()
    process.exitCode = previousExitCode
  })

  it('runs main without language when no option is provided', async () => {
    const runCli = await loadRunCli()
    await runCli({
      argv: ['node', 'profile'],
      name: 'profile',
      version: '3.0.4',
    })

    expect(mainMock).toHaveBeenCalledTimes(1)
    expect(mainMock).toHaveBeenCalledWith(undefined)
    expect(process.exitCode).toBeUndefined()
  })

  it('normalizes language tags and passes resolved language to main', async () => {
    const runCli = await loadRunCli()
    await runCli({
      argv: ['node', 'profile', '--lang', 'EN-US'],
      name: 'profile',
      version: '3.0.4',
    })

    expect(mainMock).toHaveBeenCalledTimes(1)
    expect(mainMock).toHaveBeenCalledWith({ language: 'en' })
    expect(process.exitCode).toBeUndefined()
  })

  it('handles help and version flags without invoking main', async () => {
    const runCli = await loadRunCli()
    await runCli({
      argv: ['node', 'profile', '--help'],
      name: 'profile',
      version: '3.0.4',
    })
    await runCli({
      argv: ['node', 'profile', '--version'],
      name: 'profile',
      version: '3.0.4',
    })

    expect(mainMock).not.toHaveBeenCalled()
    expect(process.exitCode).toBeUndefined()
  })

  it('reports unknown options and sets non-zero exit code', async () => {
    const runCli = await loadRunCli()
    await runCli({
      argv: ['node', 'profile', '--foo'],
      name: 'profile',
      version: '3.0.4',
    })

    expect(mainMock).not.toHaveBeenCalled()
    expect(errorMock).toHaveBeenCalledWith('Unknown option: --foo')
    expect(process.exitCode).toBe(1)
  })

  it('reports unsupported language values and sets non-zero exit code', async () => {
    const runCli = await loadRunCli()
    await runCli({
      argv: ['node', 'profile', '--lang', 'jp'],
      name: 'profile',
      version: '3.0.4',
    })

    expect(mainMock).not.toHaveBeenCalled()
    expect(errorMock).toHaveBeenCalledWith('Unsupported language "jp". Supported languages: zh, en')
    expect(process.exitCode).toBe(1)
  })
})
