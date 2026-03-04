import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  beforeEach(() => {
    logMock.mockReset()
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

  it('throws for unknown url targets', async () => {
    await expect(runDirectCommand({
      command: 'url',
      args: ['unknown-target'],
    })).rejects.toThrowError(/Unknown url target/)
  })
})
