import { buildProfileBanner, centerText, renderBannerText } from '@/index'

describe('ascii', () => {
  it('renders a five-row banner for text', () => {
    const banner = renderBannerText('ICE')

    expect(banner).toHaveLength(5)
    expect(banner[0]).toContain('#####')
  })

  it('centers text within a fixed width', () => {
    expect(centerText('updated 2026-03-19', 24)).toBe('   updated 2026-03-19   ')
  })

  it('builds a boxed profile banner', () => {
    const banner = buildProfileBanner('2026-03-19')

    expect(banner).toContain('updated 2026-03-19')
    expect(banner).toContain('+')
    expect(banner.split('\n')).toHaveLength(9)
  })
})
