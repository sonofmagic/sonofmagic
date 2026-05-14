import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { profileLinks } from '../src/constants'
import { directCommandInternal, runDirectCommand } from '../src/direct-commands'

const { logMock } = vi.hoisted(() => {
  return {
    logMock: vi.fn(),
  }
})

vi.mock('../src/logger', () => {
  return {
    consoleLog: logMock,
  }
})

describe('direct commands', () => {
  let tempDirs: string[] = []

  beforeEach(() => {
    tempDirs = []
    logMock.mockReset()
  })

  afterEach(async () => {
    await Promise.all(tempDirs.map(dir => rm(dir, { recursive: true, force: true })))
  })

  it('resolves supported aliases for url targets', () => {
    expect(directCommandInternal.resolveLinkTarget('gh')).toBe('github')
    expect(directCommandInternal.resolveLinkTarget('repos')).toBe('repositories')
    expect(directCommandInternal.resolveLinkTarget('web')).toBe('website')
  })

  it('prints all links for links command', async () => {
    await runDirectCommand({
      command: 'links',
      args: [],
    })

    expect(logMock).toHaveBeenCalledTimes(Object.keys(profileLinks).length)
    expect(logMock).toHaveBeenCalledWith(`github: ${profileLinks.github}`)
    expect(logMock).toHaveBeenCalledWith(`website: ${profileLinks.website}`)
  })

  it('prints highlighted projects for projects command', async () => {
    await runDirectCommand({
      command: 'projects',
      args: [],
    })

    const output = logMock.mock.calls.map(call => String(call[0])).join('\n')
    expect(output).toContain('1. weapp-tailwindcss')
    expect(output).toContain('bestFor:')
    expect(output).toContain('mokup')
  })

  it('prints highlighted projects as json', async () => {
    await runDirectCommand({
      command: 'projects',
      args: [],
      json: true,
    })

    expect(logMock).toHaveBeenCalledTimes(1)
    const records = JSON.parse(String(logMock.mock.calls[0]?.[0])) as Array<{ name: string, spotlight?: unknown }>
    expect(records[0]?.name).toBe('weapp-tailwindcss')
    expect(records[0]?.spotlight).toBeDefined()
  })

  it('prints a single url for url command', async () => {
    await runDirectCommand({
      command: 'url',
      args: ['gh'],
    })

    expect(logMock).toHaveBeenCalledTimes(1)
    expect(logMock).toHaveBeenCalledWith(profileLinks.github)
  })

  it('prints summary lines with localized position text', async () => {
    await runDirectCommand({
      command: 'summary',
      args: [],
      language: 'en',
    })

    const outputLines = logMock.mock.calls.map(call => String(call[0]))
    expect(outputLines).toContain(`name: Icebreaker Lab`)
    expect(outputLines.some(line => line.startsWith('position: '))).toBe(true)
  })

  it('prints markdown export with timeline content', async () => {
    await runDirectCommand({
      command: 'export',
      args: [],
      language: 'en',
    })

    expect(logMock).toHaveBeenCalledTimes(1)
    const output = String(logMock.mock.calls[0]?.[0])
    expect(output).toContain('# Engineering Profile')
    expect(output).toContain('## Engineering Timeline')
    expect(output).toContain('weapp-tailwindcss')
  })

  it('writes markdown export to a file', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'profile-export-'))
    tempDirs.push(tempDir)
    const outputPath = join(tempDir, 'profile.md')

    await runDirectCommand({
      command: 'export',
      args: [],
      language: 'en',
      output: outputPath,
    })

    const content = await readFile(outputPath, 'utf8')
    expect(content).toContain('# Engineering Profile')
    expect(logMock).toHaveBeenCalledWith(`Wrote profile export to ${outputPath}`)
  })

  it('throws for unknown url targets', async () => {
    await expect(runDirectCommand({
      command: 'url',
      args: ['unknown-target'],
    })).rejects.toThrowError(/Unknown url target/)
  })
})
