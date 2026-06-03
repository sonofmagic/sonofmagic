import axios from 'axios'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { cliInternal } from '@/cli'
import { optionsData, profileLinks } from '@/constants'
import { arcadeInternal } from '@/features/arcade'
import { photoGalleryInternal } from '@/features/photo-gallery'
import { pitchLabInternal } from '@/features/pitch-lab'
import { repositoryInternal } from '@/features/repositories'
import { shareCenterInternal } from '@/features/share-center'
import { changeLanguage, Dic, getCurrentLanguage, getSupportedLanguages, init, t } from '@/i18n'
import { buildMenuItems, menuInternal } from '@/menu'
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
  const { buildRepositoryActionChoices, buildRepositoryShareLines, formatRepositoryLabel } = repositoryInternal
  const axiosGetMock = vi.mocked(axios.get)

  beforeAll(async () => {
    await init('en')
  })

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

  it('adds QR and share actions to repository selections', () => {
    const actionValues = buildRepositoryActionChoices().map(action => action.value)

    expect(actionValues).toEqual(['open', 'details', 'qrcode', 'shareText', 'back'])
  })

  it('builds repository share text with spotlight context', () => {
    const repo = getFallbackRepoList()[0]!
    const text = stripAnsi(buildRepositoryShareLines(repo).join('\n'))

    expect(text).toContain(repo.html_url)
    expect(text).toContain('npx @icebreakers/profile@latest projects')
    expect(text).toContain('Write Tailwind')
    expect(text).toContain('Useful for')
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
    expect(t(Dic.quit.title)).toBe('Exit')

    await changeLanguage('zh')
    expect(getCurrentLanguage()).toBe('zh')
    expect(t(Dic.quit.title)).toBe('退出')

    await changeLanguage('en')
  })
})

describe('share center', () => {
  beforeAll(async () => {
    await changeLanguage('en')
  })

  it('builds share commands for supported targets', () => {
    expect(shareCenterInternal.buildShareCommand('github')).toBe('npx @icebreakers/profile@latest url github')
    expect(shareCenterInternal.buildQrCommand('website')).toBe('npx @icebreakers/profile@latest qr website')
  })

  it('builds share text with links and terminal commands', () => {
    const lines = shareCenterInternal.buildShareLines('github')
    const text = stripAnsi(lines.join('\n'))

    expect(text).toContain(profileLinks.github)
    expect(text).toContain('npx @icebreakers/profile@latest url github')
    expect(text).toContain('npx @icebreakers/profile@latest qr github')
  })

  it('adds the share center to the interactive menu', () => {
    const items = buildMenuItems({
      icebreaker: 'icebreaker',
      options: optionsData,
      isUnicodeSupported: true,
    })

    expect(items.map(item => item.value)).toContain(optionsData.shareCenter)
    expect(items.find(item => item.value === optionsData.shareCenter)?.title).toBe('Share Center')
  })

  it('keeps the initial interactive menu compact', () => {
    const items = buildMenuItems({
      icebreaker: 'icebreaker',
      options: optionsData,
      isUnicodeSupported: true,
    })

    expect(items.map(item => item.value)).toEqual([
      optionsData.profile,
      optionsData.myRepositories,
      optionsData.shareCenter,
      optionsData.arcade,
      optionsData.changeLanguage,
      optionsData.quit,
    ])
  })
})

describe('pitch lab', () => {
  beforeAll(async () => {
    await changeLanguage('en')
  })

  it('builds pitch choices for supported audiences', () => {
    const choices = pitchLabInternal.buildPitchChoices()

    expect(choices.map(choice => choice.value)).toEqual(['oss', 'hiring', 'collaboration'])
    expect(choices.every(choice => choice.title.length > 0)).toBe(true)
  })

  it('builds pitch lines with profile context', () => {
    const lines = pitchLabInternal.buildPitchLines('hiring')
    const text = stripAnsi(lines.join('\n'))

    expect(lines.length).toBeGreaterThan(1)
    expect(text).toContain('Icebreaker Lab')
    expect(text).toContain('icebreaker')
    expect(text).toContain('Full-stack Architect')
  })

  it('keeps pitch lab inside the profile hub', () => {
    const choices = menuInternal.buildProfileHubChoices()

    expect(choices.map(choice => choice.value)).toEqual(['overview', 'timeline', 'photo', 'pitchLab', 'back'])
    expect(choices.find(choice => choice.value === 'pitchLab')?.title).toBe('Pitch Lab')
  })
})

describe('terminal arcade', () => {
  beforeAll(async () => {
    await changeLanguage('en')
  })

  it('merges 2048 rows and reports merge score', () => {
    expect(arcadeInternal.collapseLine([2, 0, 2, 4])).toEqual({
      line: [4, 4, 0, 0],
      score: 4,
    })
    expect(arcadeInternal.collapseLine([2, 2, 2, 2])).toEqual({
      line: [4, 4, 0, 0],
      score: 8,
    })
  })

  it('moves a 2048 board in each direction without mutating input', () => {
    const board = [
      [2, 0, 2, 0],
      [0, 4, 0, 4],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    const left = arcadeInternal.moveBoard(board, 'left')
    expect(left.board[0]).toEqual([4, 0, 0, 0])
    expect(left.board[1]).toEqual([8, 0, 0, 0])
    expect(left.score).toBe(12)
    expect(left.moved).toBe(true)
    expect(board[0]).toEqual([2, 0, 2, 0])

    const up = arcadeInternal.moveBoard(board, 'up')
    expect(up.board[0]).toEqual([4, 4, 2, 4])
    expect(up.score).toBe(4)
  })

  it('detects whether a 2048 board can still move', () => {
    expect(arcadeInternal.canMove([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ])).toBe(false)

    expect(arcadeInternal.canMove([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 4],
    ])).toBe(true)
  })

  it('parses real-time 2048 controls', () => {
    expect(arcadeInternal.parse2048Input('w')).toBe('up')
    expect(arcadeInternal.parse2048Input('\u001B[A')).toBe('up')
    expect(arcadeInternal.parse2048Input('s')).toBe('down')
    expect(arcadeInternal.parse2048Input('\u001B[B')).toBe('down')
    expect(arcadeInternal.parse2048Input('a')).toBe('left')
    expect(arcadeInternal.parse2048Input('\u001B[D')).toBe('left')
    expect(arcadeInternal.parse2048Input('d')).toBe('right')
    expect(arcadeInternal.parse2048Input('\u001B[C')).toBe('right')
    expect(arcadeInternal.parse2048Input('u')).toBe('undo')
    expect(arcadeInternal.parse2048Input('r')).toBe('restart')
    expect(arcadeInternal.parse2048Input('q')).toBe('quit')
    expect(arcadeInternal.parse2048Input('\u001B')).toBe('quit')
  })

  it('applies a 2048 move with score, history, and best score', () => {
    const randomValues = [0, 0]
    const random = () => randomValues.shift() ?? 0
    const state = {
      board: [
        [2, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      score: 0,
      moves: 0,
      bestScore: 0,
      won: false,
      message: '',
    }

    const next = arcadeInternal.apply2048Move(state, 'left', random)
    expect(next.board[0]).toEqual([4, 2, 0, 0])
    expect(next.score).toBe(4)
    expect(next.moves).toBe(1)
    expect(next.bestScore).toBe(4)
    expect(next.previous?.board[0]).toEqual([2, 0, 2, 0])

    const blocked = arcadeInternal.apply2048Move(next, 'left', random)
    expect(blocked.moves).toBe(1)
    expect(stripAnsi(blocked.message)).toContain('No tile')
  })

  it('undoes one 2048 move', () => {
    const state = arcadeInternal.createInitial2048State(() => 0)
    const moved = arcadeInternal.apply2048Move({
      ...state,
      board: [
        [2, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    }, 'left', () => 0)

    const undone = arcadeInternal.undo2048Move(moved)
    expect(undone.board[0]).toEqual([2, 0, 2, 0])
    expect(undone.score).toBe(0)
    expect(undone.moves).toBe(0)
    expect(undone.previous).toBeUndefined()
  })

  it('renders enhanced 2048 board metadata', () => {
    const output = stripAnsi(arcadeInternal.render2048Board({
      board: [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 0],
        [0, 0, 0, 0],
      ],
      score: 4096,
      bestScore: 8192,
      moves: 12,
      won: true,
      message: '',
    }))

    expect(output).toContain('2048')
    expect(output).toContain('Score')
    expect(output).toContain('High')
    expect(output).toContain('Moves')
    expect(output).toContain('Best')
  })

  it('adds the arcade to the interactive menu', () => {
    const items = buildMenuItems({
      icebreaker: 'icebreaker',
      options: optionsData,
      isUnicodeSupported: true,
    })

    expect(items.map(item => item.value)).toContain(optionsData.arcade)
    expect(items.find(item => item.value === optionsData.arcade)?.title).toBe('2048')
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
