import { createHeroSvg, createHeroSvgDataUri } from '@/index'

describe('svg', () => {
  it('creates a hero svg string', () => {
    const svg = createHeroSvg({
      title: 'SONOFMAGIC',
      subtitle: 'A profile banner for Github.',
    })

    expect(svg).toContain('<svg')
    expect(svg).toContain('SONOFMAGIC')
    expect(svg).toContain('A profile banner for Github.')
    expect(svg).toContain('linearGradient')
    expect(svg).toContain('animateTransform')
    expect(svg).toContain('repeatCount="indefinite"')
  })

  it('creates a data uri wrapper', () => {
    const uri = createHeroSvgDataUri({
      title: 'ICEBREAKER',
    })

    expect(uri.startsWith('data:image/svg+xml;utf8,')).toBe(true)
    expect(decodeURIComponent(uri)).toContain('ICEBREAKER')
  })
})
