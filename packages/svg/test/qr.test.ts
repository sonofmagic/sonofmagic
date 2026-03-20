import { createQrCodeSvg, createQrCodeSvgDataUri } from '@/index'
import { createQrMatrix } from '@/qr'

describe('qr svg', () => {
  it('creates a stylized qr code svg string', () => {
    const svg = createQrCodeSvg('https://icebreaker.top')

    expect(svg).toContain('<svg')
    expect(svg).toContain('QR code for https://icebreaker.top')
    expect(svg).toContain('Stylized SVG QR code generated locally.')
    expect(svg).toContain('url(#qr-')
    expect(svg).toContain('repeatCount="indefinite"')
  })

  it('creates a plain qr variant without animated frame markup', () => {
    const svg = createQrCodeSvg('https://icebreaker.top/plain', {
      variant: 'plain',
    })

    expect(svg).toContain('Plain SVG QR code generated locally.')
    expect(svg).not.toContain('Stylized SVG QR code generated locally.')
    expect(svg).not.toContain('linearGradient')
  })

  it('creates a qr code data uri wrapper', () => {
    const uri = createQrCodeSvgDataUri('https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ')

    expect(uri.startsWith('data:image/svg+xml;utf8,')).toBe(true)
    expect(decodeURIComponent(uri)).toContain('<svg')
    expect(decodeURIComponent(uri)).toContain('Stylized SVG QR code generated locally.')
  })

  it('creates a deterministic qr matrix structure', () => {
    const matrix = createQrMatrix('https://icebreaker.top', 'H')

    expect(matrix.size).toBeGreaterThan(20)
    expect(matrix.modules.length).toBe(matrix.size)
    expect(matrix.modules.every(row => row.length === matrix.size)).toBe(true)
    expect(matrix.modules.some(row => row.some(Boolean))).toBe(true)
  })
})
