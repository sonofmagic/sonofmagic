import axios from 'axios'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { cliInternal } from '@/cli'
import { photoGalleryInternal } from '@/features/photo-gallery'
import { repositoryInternal } from '@/features/repositories'
import { changeLanguage, Dic, getCurrentLanguage, getSupportedLanguages, init, t } from '@/i18n'
import { menuInternal } from '@/menu'
import { getFallbackRepoList, getRepoList, getRepositorySpotlight } from '@/repos'
import { emoji, isComplexType, isPrimitivesType, splitParagraphByLines } from '@/util'

vi.mock('axios')

function stripAnsi(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/\u001B\[[0-9;]*[A-Z]/gi, '')
}

describe('utility guards', () => {
  it('detects primitive values', () => {
    expect(isPrimitivesType('foo')).toBe(true)
    expect(isPrimitivesType(0)).toBe(true)
    expect(isPrimitivesType(Symbol('id'))).toBe(true)
    expect(isPrimitivesType(null)).toBe(true)
    expect(isPrimitivesType(undefined)).toBe(true)
  })

  it('detects complex values', () => {
    expect(isComplexType({})).toBe(true)
    expect(isComplexType([])).toBe(true)
    expect(isComplexType(() => {})).toBe(true)
  })
})

describe('cli helpers', () => {
  const { findUnknownOptionKeys, formatOptionKey, resolveCliLanguage } = cliInternal

  it('formats option keys consistently', () => {
    expect(formatOptionKey('l')).toBe('-l')
    expect(formatOptionKey('lang')).toBe('--lang')
  })

  it('detects unknown option keys', () => {
    const options = {
      '--': [],
      'help': true,
      'foo': true,
      'lang': 'en',
    }
    const allowed = new Set(['help', 'lang'])
    expect(findUnknownOptionKeys(options, allowed)).toEqual(['foo'])
  })

  it('normalizes supported language tags', () => {
    expect(resolveCliLanguage('en')).toBe('en')
    expect(resolveCliLanguage('EN-US')).toBe('en')
    expect(resolveCliLanguage('zh_CN')).toBe('zh')
    expect(resolveCliLanguage(undefined)).toBeUndefined()
  })

  it('rejects unsupported language tags', () => {
    expect(() => resolveCliLanguage('jp')).toThrowError(/Unsupported language/)
  })
})

describe('splitParagraphByLines', () => {
  it('groups lines into fixed-size chunks', () => {
    const sample = Array.from({ length: 7 }, (_, idx) => `line-${idx}`).join('\n')
    expect(splitParagraphByLines(sample, 3)).toEqual([
      'line-0\nline-1\nline-2',
      'line-3\nline-4\nline-5',
      'line-6',
    ])
  })
})

describe('photo helpers', () => {
  const { normalizePhotoIndex } = photoGalleryInternal

  it('normalizes negative and overflow indices', () => {
    expect(normalizePhotoIndex(0, 6)).toBe(0)
    expect(normalizePhotoIndex(5, 6)).toBe(5)
    expect(normalizePhotoIndex(6, 6)).toBe(0)
    expect(normalizePhotoIndex(-1, 6)).toBe(5)
  })
})

describe('repository helpers', () => {
  const { formatRepositoryLabel } = repositoryInternal
  const axiosGetMock = vi.mocked(axios.get)

  it('formats metadata with unicode icons', () => {
    const repo = {
      name: 'demo',
      stargazers_count: 10,
      forks_count: 2,
      description: 'demo repo',
      html_url: '',
      language: null,
    }
    expect(formatRepositoryLabel(repo, true)).toContain(emoji.get('star'))
    expect(formatRepositoryLabel(repo, true)).toContain(emoji.get('fork_and_knife'))
  })

  it('provides offline fallback repositories as copies', () => {
    const first = getFallbackRepoList()
    const second = getFallbackRepoList()
    expect(first.map(repo => repo.name)).toEqual(['weapp-tailwindcss', 'weapp-vite', 'mokup'])
    expect(first[0]).not.toBe(second[0])
  })

  it('provides spotlight metadata for highlighted repositories', () => {
    const spotlight = getRepositorySpotlight('weapp-tailwindcss')
    expect(spotlight?.name).toBe('weapp-tailwindcss')
    expect(getRepositorySpotlight('unknown')).toBeNull()
  })

  it('fetches highlighted repositories even when the user repository list fails', async () => {
    axiosGetMock.mockImplementation(async (url: string) => {
      if (url === 'https://api.github.com/repos/sonofmagic/weapp-tailwindcss') {
        return {
          data: {
            name: 'weapp-tailwindcss',
            html_url: 'https://github.com/sonofmagic/weapp-tailwindcss',
            description: 'Tailwind CSS utility compiler',
            language: 'TypeScript',
            stargazers_count: 123,
            forks_count: 45,
          },
        }
      }

      if (url === 'https://api.github.com/repos/weapp-vite/weapp-vite') {
        return {
          data: {
            name: 'weapp-vite',
            html_url: 'https://github.com/weapp-vite/weapp-vite',
            description: 'Vite workflow',
            language: 'TypeScript',
            stargazers_count: 67,
            forks_count: 8,
          },
        }
      }

      if (url === 'https://api.github.com/repos/sonofmagic/mokup') {
        return {
          data: {
            name: 'mokup',
            html_url: 'https://github.com/sonofmagic/mokup',
            description: 'Mock toolkit',
            language: 'TypeScript',
            stargazers_count: 9,
            forks_count: 1,
          },
        }
      }

      throw new Error('user repos unavailable')
    })

    const repos = await getRepoList()

    expect(repos.map(repo => repo.name)).toEqual(['weapp-tailwindcss', 'weapp-vite', 'mokup'])
    expect(repos.map(repo => repo.stargazers_count)).toEqual([123, 67, 9])
    expect(repos.map(repo => repo.forks_count)).toEqual([45, 8, 1])

    axiosGetMock.mockReset()
  })
})

describe('i18n manager', () => {
  beforeAll(async () => {
    await init('en')
  })

  afterAll(async () => {
    await changeLanguage('en')
  })

  it('exposes supported languages', () => {
    expect(getSupportedLanguages()).toEqual(['zh', 'en'])
  })

  it('provides translations after initialization', async () => {
    expect(t(Dic.quit.title)).toBe('Sign out')

    await changeLanguage('zh')
    expect(getCurrentLanguage()).toBe('zh')
    expect(t(Dic.quit.title)).toBe('退出')

    await changeLanguage('en')
  })
})

describe('profile sections', () => {
  beforeAll(async () => {
    await changeLanguage('zh')
  })

  afterAll(async () => {
    await changeLanguage('en')
  })

  it('builds sections with non-empty lines', () => {
    const sections = menuInternal.buildProfileSections()
    expect(sections).toHaveLength(7)
    sections.forEach((section) => {
      expect(section.lines.length).toBeGreaterThan(0)
      section.lines.forEach((line) => {
        expect(stripAnsi(line).trim()).not.toBe('')
      })
    })
  })

  it('splits expectation into multiple bullet lines', () => {
    const sections = menuInternal.buildProfileSections()
    const expectationTitle = t(Dic.profile.expectationTitle) as string
    const expectation = sections.find(section => section.title === expectationTitle)
    expect(expectation).toBeDefined()
    expect(expectation?.lines).toHaveLength(3)
  })

  it('reflects deep toolbelt details in english', async () => {
    await changeLanguage('en')
    const sections = menuInternal.buildProfileSections()
    const skillsTitle = t(Dic.profile.skillsTitle) as string
    const toolbelt = sections.find(section => section.title === skillsTitle)
    expect(toolbelt).toBeDefined()
    const normalized = stripAnsi(toolbelt!.lines.join(' '))
    expect(normalized).toContain('Cloudflare Workers')
    expect(normalized).toContain('Hono')
    expect(normalized).toContain('Rolldown')
    expect(normalized).toContain('monorepo automation')
    await changeLanguage('zh')
  })
})
