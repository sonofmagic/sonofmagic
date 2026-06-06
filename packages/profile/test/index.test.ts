import readline from 'node:readline'
import axios from 'axios'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { cliInternal } from '@/cli'
import { optionsData, profileLinks } from '@/constants'
import { arcadeInternal } from '@/features/arcade'
import { photoGalleryInternal } from '@/features/photo-gallery'
import { repositoryInternal } from '@/features/repositories'
import { shareCenterInternal } from '@/features/share-center'
import { changeLanguage, Dic, getCurrentLanguage, getSupportedLanguages, i18nInternal, init, t } from '@/i18n'
import { buildMenuItems, menuInternal } from '@/menu'
import { getFallbackRepoList, getRepoList, getRepositorySpotlight } from '@/repos'
import { terminalShortcutsInternal } from '@/terminal-shortcuts'
import { emoji, isComplexType, isPrimitivesType, splitParagraphByLines, terminalDisplayWidth, truncateDisplay } from '@/util'

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

describe('terminal display width', () => {
  it('counts ansi, chinese text, and emoji by visible terminal width', () => {
    expect(terminalDisplayWidth('\u001B[32m关于我\u001B[39m')).toBe(6)
    expect(terminalDisplayWidth('About')).toBe(5)
    expect(terminalDisplayWidth('🚀')).toBe(2)
    expect(terminalDisplayWidth('⚙')).toBe(1)
  })

  it('truncates long mixed-width text to a single terminal line', () => {
    const truncated = truncateDisplay('weapp-vite 把现代化的 web 开发方式，带入传统的小程序开发吧！', 24)

    expect(terminalDisplayWidth(truncated)).toBeLessThanOrEqual(24)
    expect(truncated.endsWith('…')).toBe(true)
  })
})

describe('photo helpers', () => {
  const { isPhotoExitKey, normalizePhotoIndex } = photoGalleryInternal

  it('normalizes negative and overflow indices', () => {
    expect(normalizePhotoIndex(0, 6)).toBe(0)
    expect(normalizePhotoIndex(5, 6)).toBe(5)
    expect(normalizePhotoIndex(6, 6)).toBe(0)
    expect(normalizePhotoIndex(-1, 6)).toBe(5)
  })

  it('treats q, escape, and ctrl-c as photo gallery back keys', () => {
    expect(isPhotoExitKey('q', { name: 'q' })).toBe(true)
    expect(isPhotoExitKey('\u001B', { name: 'escape' })).toBe(true)
    expect(isPhotoExitKey('', { ctrl: true, name: 'c' })).toBe(true)
    expect(isPhotoExitKey('', { name: 'right' })).toBe(false)
  })
})

describe('repository helpers', () => {
  const {
    buildPagedRepoChoices,
    buildRepositoryPagerText,
    buildRepositoryActionChoices,
    buildRepositoryShareLines,
    formatRepositoryLabel,
    getRepositoryPageCount,
  } = repositoryInternal
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

  it('keeps repository pages short and leaves paging out of choices', () => {
    const repos = Array.from({ length: 13 }, (_, index) => ({
      name: `repo-${index}`,
      stargazers_count: index,
      forks_count: index,
      description: `repo ${index}`,
      html_url: `https://example.com/repo-${index}`,
      language: 'TypeScript',
    }))

    const firstPage = buildPagedRepoChoices(repos, true, 0)
    const values = firstPage.map(choice => choice.value.type)

    expect(getRepositoryPageCount(repos)).toBe(2)
    expect(values.filter(value => value === 'repo')).toHaveLength(8)
    expect(values).toEqual(['repo', 'repo', 'repo', 'repo', 'repo', 'repo', 'repo', 'repo'])
  })

  it('renders repository paging as terminal footer text', () => {
    const text = stripAnsi(buildRepositoryPagerText(0, 2))

    expect(text).toContain('previous')
    expect(text).toContain('next')
    expect(text).toContain('page 1/2')
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

  it('normalizes locale tags before matching supported languages', () => {
    const { matchSupportedLanguage, sanitizeLocaleTag } = i18nInternal

    expect(matchSupportedLanguage(sanitizeLocaleTag('zh_CN.UTF-8'))).toBe('zh')
    expect(matchSupportedLanguage(sanitizeLocaleTag('en_US.UTF-8'))).toBe('en')
    expect(matchSupportedLanguage(sanitizeLocaleTag('C.UTF-8'))).toBeUndefined()
  })

  it('extracts macOS language candidates from defaults output', () => {
    const candidates = i18nInternal.extractMacOSLocaleCandidates(`(
    "zh-Hans-CN",
    "en-CN"
)`)

    expect(candidates).toEqual(['zh-Hans-CN', 'en-CN'])
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

  it('puts browser open first in share actions', () => {
    const actionValues = shareCenterInternal.buildActionChoices().map(action => action.value)

    expect(actionValues).toEqual(['open', 'qrcode', 'shareText', 'back'])
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
      optionsData.quit,
    ])
    expect(stripAnsi(items[3]!.title)).toBe('Games')
  })

  it('parses main menu shortcut keys', () => {
    expect(terminalShortcutsInternal.parseShortcutInput('l')).toBe('language')
    expect(terminalShortcutsInternal.parseShortcutInput('L')).toBe('language')
    expect(terminalShortcutsInternal.parseShortcutInput('q')).toBe('back')
    expect(terminalShortcutsInternal.parseShortcutInput('\u001B')).toBe('back')
    expect(terminalShortcutsInternal.parseShortcutInput('j')).toBe('down')
    expect(terminalShortcutsInternal.parseShortcutInput('k')).toBe('up')
    expect(terminalShortcutsInternal.parseShortcutInput('\u001B[D')).toBe('left')
    expect(terminalShortcutsInternal.parseShortcutInput('\u001B[C')).toBe('right')
    expect(terminalShortcutsInternal.parseShortcutInput('\n')).toBe('submit')
  })

  it('shows language switching in the main menu shortcut bar', () => {
    const items = buildMenuItems({
      icebreaker: 'icebreaker',
      options: optionsData,
      isUnicodeSupported: true,
    })
    const output = stripAnsi(terminalShortcutsInternal.renderShortcutSelect('Pick', items, 0))

    expect(items.map(item => item.value)).not.toContain(optionsData.changeLanguage)
    expect(output).toContain('L language')
  })

  it('aligns shortcut descriptions by terminal display width', () => {
    const output = stripAnsi(terminalShortcutsInternal.renderShortcutSelect('Pick', [
      { title: '关于我', description: '中文标题', value: 'profile' },
      { title: 'Games', description: 'English title', value: 'games' },
      { title: `${emoji.get('star')} Repo`, description: 'emoji title', value: 'repo' },
      { title: '返回', value: 'back' },
    ], 0))
    const lines = output.split('\n').filter(line => line.includes(' - '))
    const separatorColumns = lines.map((line) => {
      const separatorIndex = line.indexOf(' - ')
      return terminalDisplayWidth(line.slice(0, separatorIndex))
    })

    expect(new Set(separatorColumns).size).toBe(1)
  })

  it('truncates shortcut rows to avoid terminal wrapping', () => {
    const output = stripAnsi(terminalShortcutsInternal.renderShortcutSelect('Pick', [
      {
        title: 'uni-app-vite-vue3-tailwind-vscode-template (⭐:338 🍴:56)',
        description: 'uni-app vue3 tailwindcss 模板，集成了 iconify,eslint,typescript,prettier 等等工具作为解决方案',
        value: 'repo',
      },
      { title: '下一张 1/2', value: 'next' },
    ], 0, 80))
    const row = output.split('\n').find(line => line.includes(' - '))

    expect(row).toBeDefined()
    expect(terminalDisplayWidth(row!)).toBeLessThanOrEqual(76)
    expect(row).toContain('…')
  })

  it('renders shortcut footer outside the selectable rows', () => {
    const output = stripAnsi(terminalShortcutsInternal.renderShortcutSelect('Pick', [
      { title: 'repo', description: 'demo', value: 'repo' },
    ], 0, 80, '← previous · → next · page 1/2'))
    const lines = output.split('\n')

    expect(lines.some(line => line.startsWith('← previous'))).toBe(true)
    expect(lines.filter(line => line.includes(' - '))).toHaveLength(1)
  })

  it('pauses stdin when restoring shortcut input state', () => {
    const setRawMode = vi.fn()
    const pause = vi.fn()
    const stream = {
      setRawMode,
      pause,
    } as unknown as NodeJS.ReadStream

    terminalShortcutsInternal.restoreInput(stream, false)

    expect(setRawMode).toHaveBeenCalledWith(false)
    expect(pause).toHaveBeenCalledTimes(1)
  })

  it('clears the current shortcut menu block before replacing it', () => {
    const moveCursor = vi.spyOn(readline, 'moveCursor').mockImplementation(() => true)
    const cursorTo = vi.spyOn(readline, 'cursorTo').mockImplementation(() => true)
    const clearScreenDown = vi.spyOn(readline, 'clearScreenDown').mockImplementation(() => true)

    terminalShortcutsInternal.clearRenderedBlock(process.stdout, 7)

    expect(moveCursor).toHaveBeenCalledWith(process.stdout, 0, -7)
    expect(cursorTo).toHaveBeenCalledWith(process.stdout, 0)
    expect(clearScreenDown).toHaveBeenCalledWith(process.stdout)

    moveCursor.mockRestore()
    cursorTo.mockRestore()
    clearScreenDown.mockRestore()
  })
})

describe('profile hub', () => {
  beforeAll(async () => {
    await changeLanguage('en')
  })

  it('keeps the profile hub focused', () => {
    const choices = menuInternal.buildProfileHubChoices()

    expect(choices.map(choice => choice.value)).toEqual(['overview', 'timeline', 'photo', 'back'])
    expect(choices[0]?.title).toBe(t(Dic.profile.summaryTitle))
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

  it('clears each terminal line when rendering 2048 frames', () => {
    const state = arcadeInternal.createInitial2048State(() => 0)
    const frame = arcadeInternal.render2048Frame({
      ...state,
      message: 'New board started.',
    })
    const visibleLines = frame
      // eslint-disable-next-line no-control-regex
      .replace(/^\u001B\[H/, '')
      // eslint-disable-next-line no-control-regex
      .replace(/\u001B\[J$/, '')
      .split('\n')

    expect(frame.startsWith('\u001B[H')).toBe(true)
    expect(frame.endsWith('\u001B[J')).toBe(true)
    expect(visibleLines.length).toBeGreaterThan(1)
    expect(visibleLines.every(line => line.endsWith('\u001B[K'))).toBe(true)
  })

  it('keeps 2048 inside the games menu', () => {
    const items = buildMenuItems({
      icebreaker: 'icebreaker',
      options: optionsData,
      isUnicodeSupported: true,
    })
    const games = menuInternal.buildGameHubChoices()

    expect(items.map(item => item.value)).toContain(optionsData.arcade)
    expect(items.find(item => item.value === optionsData.arcade)?.title).toBe('Games')
    expect(games.map(game => game.value)).toEqual(['game2048', 'back'])
    expect(games.find(game => game.value === 'game2048')?.title).toBe('2048')
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

  it('aligns profile skill text after mixed-width icons', () => {
    const sections = menuInternal.buildProfileSections()
    const skillsTitle = t(Dic.profile.skillsTitle) as string
    const skills = sections.find(section => section.title === skillsTitle)
    expect(skills).toBeDefined()

    const textColumns = skills!.lines.map((line) => {
      const visibleLine = stripAnsi(line)
      const match = /^(\S+\s+)/.exec(visibleLine)
      expect(match).not.toBeNull()
      return terminalDisplayWidth(match![1]!)
    })

    expect(new Set(textColumns).size).toBe(1)
    expect(stripAnsi(skills!.lines.join('\n'))).toContain('⚙  Node.js')
  })

  it('presents a broader open-source and full-stack profile', async () => {
    await changeLanguage('en')
    const englishSections = menuInternal.buildProfileSections()
    const englishText = stripAnsi(englishSections.map(section => section.lines.join(' ')).join(' '))

    expect(englishText).toContain('open-source')
    expect(englishText).toContain('full-stack')
    expect(englishText).toContain('automation')
    expect(englishText).toContain('project problem')

    await changeLanguage('zh')
    const chineseSections = menuInternal.buildProfileSections()
    const chineseText = stripAnsi(chineseSections.map(section => section.lines.join(' ')).join(' '))

    expect(chineseText).toContain('开源爱好者')
    expect(chineseText).toContain('全栈')
  })
})
