import { createHeroSvg, createHeroSvgDataUri } from '@/index'

describe('svg', () => {
  it('creates a hero svg string', () => {
    const svg = createHeroSvg({
      title: 'son ofmagic',
      subtitle: 'A profile banner for Github.',
    })

    expect(svg).toContain('<svg')
    expect(svg).toContain('son ofmagic')
    expect(svg).toContain('A profile banner for Github.')
    expect(svg).toContain('linearGradient')
    expect(svg).toContain('animateTransform')
    expect(svg).toContain('repeatCount="indefinite"')
    expect(svg).toContain('attributeName="fill"')
  })

  it('creates a data uri wrapper', () => {
    const uri = createHeroSvgDataUri({
      title: 'ice breaker',
    })

    expect(uri.startsWith('data:image/svg+xml;utf8,')).toBe(true)
    expect(decodeURIComponent(uri)).toContain('ice breaker')
  })
})
