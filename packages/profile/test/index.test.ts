import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { photoGalleryInternal } from '@/features/photo-gallery'
import { repositoryInternal } from '@/features/repositories'
import { changeLanguage, Dic, getCurrentLanguage, getSupportedLanguages, init, t } from '@/i18n'
import { menuInternal } from '@/menu'
import { emoji, isComplexType, isPrimitivesType, splitParagraphByLines } from '@/util'

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
