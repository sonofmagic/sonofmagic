import { createContactCardSvg, createContactPanelSvg } from '@/index'

describe('contact svg', () => {
  it('creates a contact card svg string', () => {
    const svg = createContactCardSvg({
      title: 'Website',
      badge: 'Scan to connect',
      note: 'icebreaker.top',
      iconHref: '../svg/chorme.svg',
      qrValue: 'https://www.icebreaker.top',
    })

    expect(svg).toContain('<svg')
    expect(svg).toContain('Website')
    expect(svg).toContain('Scan to connect')
    expect(svg).toContain('icebreaker.top')
    expect(svg).toContain('QR code for https://www.icebreaker.top')
  })

  it('creates a contact panel svg string with both channels', () => {
    const svg = createContactPanelSvg({
      entries: [
        {
          title: 'Website',
          iconHref: '../svg/chorme.svg',
          qrValue: 'https://www.icebreaker.top',
          accentColor: '#7A7CFF',
          highlightColor: '#2BFFCF',
        },
        {
          title: 'Wechat',
          iconHref: '../svg/wechat.svg',
          qrValue: 'https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ',
          note: '备注: Github',
          accentColor: '#FFD166',
          highlightColor: '#FF8A5B',
        },
      ],
    })

    expect(svg).toContain('<svg')
    expect(svg).toContain('Combined website and Wechat contact panel with two scannable QR codes.')
    expect(svg).toContain('QR code for https://www.icebreaker.top')
    expect(svg).toContain('#5193FB')
    expect(svg).toContain('#0DCB19')
    expect(svg).toContain('备注: Github')
    expect(svg).toContain('animateMotion')
  })
})
