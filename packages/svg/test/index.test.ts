import {
  createContactPanelSvg,
  createHeroSvg,
  createHeroSvgDataUri,
  createQrCodeSvg,
  createQrCodeSvgDataUri,
} from '@/index'

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

  it('creates a stylized qr code svg string', () => {
    const svg = createQrCodeSvg('https://icebreaker.top')

    expect(svg).toContain('<svg')
    expect(svg).toContain('QR code for https://icebreaker.top')
    expect(svg).toContain('Stylized SVG QR code generated locally.')
    expect(svg).toContain('url(#qr-')
    expect(svg).toContain('repeatCount="indefinite"')
  })

  it('creates a qr code data uri wrapper', () => {
    const uri = createQrCodeSvgDataUri('https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ')

    expect(uri.startsWith('data:image/svg+xml;utf8,')).toBe(true)
    expect(decodeURIComponent(uri)).toContain('<svg')
    expect(decodeURIComponent(uri)).toContain('Stylized SVG QR code generated locally.')
  })

  it('creates a contact panel svg string', () => {
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
  })
})
