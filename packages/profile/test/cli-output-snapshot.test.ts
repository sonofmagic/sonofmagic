import { afterEach, describe, expect, it, vi } from 'vitest'
import { runCli } from '../src/cli'

type CliName = 'profile' | 'sonofmagic' | 'yangqiming'

const cliNames: CliName[] = ['profile', 'sonofmagic', 'yangqiming']

function stripAnsi(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/\u001B\[[0-9;]*[A-Z]/gi, '')
}

async function captureCliOutput(task: () => Promise<void>) {
  const outputLines: string[] = []
  const writer = (...args: unknown[]) => {
    outputLines.push(args.map(arg => String(arg)).join(' '))
  }

  const logSpy = vi.spyOn(console, 'log').mockImplementation(writer)
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(writer)

  try {
    await task()
    return stripAnsi(outputLines.join('\n')).trimEnd()
  }
  finally {
    logSpy.mockRestore()
    infoSpy.mockRestore()
  }
}

describe('cli output snapshots', () => {
  afterEach(() => {
    process.exitCode = undefined
  })

  it.each(cliNames)('matches help output snapshot for %s', async (name) => {
    const output = await captureCliOutput(async () => {
      await runCli({
        argv: ['node', name, '--help'],
        name,
        version: '3.0.4',
      })
    })

    expect(output).toMatchSnapshot()
  })

  it.each(cliNames)('matches links output snapshot for %s', async (name) => {
    const output = await captureCliOutput(async () => {
      await runCli({
        argv: ['node', name, 'links'],
        name,
        version: '3.0.4',
      })
    })

    expect(output).toMatchSnapshot()
  })

  it.each(cliNames)('matches url output snapshot for %s', async (name) => {
    const output = await captureCliOutput(async () => {
      await runCli({
        argv: ['node', name, 'url', 'gh'],
        name,
        version: '3.0.4',
      })
    })

    expect(output).toMatchSnapshot()
  })
})
