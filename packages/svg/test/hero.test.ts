import { createHeroSvg, createHeroSvgDataUri } from '@/index'

describe('hero svg', () => {
  it('creates a hero svg string with animated accents', () => {
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

  it('keeps the default hero dimensions stable', () => {
    const svg = createHeroSvg()

    expect(svg).toContain('width="1280"')
    expect(svg).toContain('height="360"')
    expect(svg).toContain('viewBox="0 0 1280 360"')
  })

  it('creates a data uri wrapper', () => {
    const uri = createHeroSvgDataUri({
      title: 'ice breaker',
    })

    expect(uri.startsWith('data:image/svg+xml;utf8,')).toBe(true)
    expect(decodeURIComponent(uri)).toContain('ice breaker')
  })
})
