import { describe, expect, it } from 'vitest'
import { photoGalleryInternal } from '@/features/photo-gallery'
import { repositoryInternal } from '@/features/repositories'
import { emoji, isComplexType, isPrimitivesType, splitParagraphByLines } from '@/util'

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
