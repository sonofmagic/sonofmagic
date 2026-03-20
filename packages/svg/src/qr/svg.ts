import { createQrMatrix } from '.'
import { escapeXml, formatNumber, hashCode } from '../shared/svg'
import type { QrCodeSvgOptions } from '../types'

const QR_DEFAULTS = {
  size: 160,
  padding: 20,
  backgroundColor: '#F8FAFC',
  gridColor: '#E2E8F0',
  accentColor: '#7A7CFF',
  highlightColor: '#2BFFCF',
  dotColor: '#111827',
  cornerRadius: 26,
  variant: 'decorated',
} satisfies Required<QrCodeSvgOptions>

export function createQrCodeSvg(content: string, options: QrCodeSvgOptions = {}) {
  const size = options.size ?? QR_DEFAULTS.size
  const padding = options.padding ?? QR_DEFAULTS.padding
  const backgroundColor = options.backgroundColor ?? QR_DEFAULTS.backgroundColor
  const gridColor = options.gridColor ?? QR_DEFAULTS.gridColor
  const accentColor = options.accentColor ?? QR_DEFAULTS.accentColor
  const highlightColor = options.highlightColor ?? QR_DEFAULTS.highlightColor
  const dotColor = options.dotColor ?? QR_DEFAULTS.dotColor
  const cornerRadius = options.cornerRadius ?? QR_DEFAULTS.cornerRadius
  const variant = options.variant ?? QR_DEFAULTS.variant
  const qr = createQrMatrix(content, 'H')
  const moduleCount = qr.size
  const moduleSize = (size - padding * 2) / moduleCount
  const id = `qr-${Math.abs(hashCode(`${content}-${size}-${padding}-${accentColor}-${highlightColor}`))}`
  const moduleRects: string[] = []
  const panelInset = Math.max(8, padding * 0.4)
  const panelSize = size - panelInset * 2
  const panelRadius = Math.max(cornerRadius * 0.72, 16)

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      const qrRow = qr.modules[row]
      if (!qrRow?.[col] || isFinderZone(row, col, moduleCount)) {
        continue
      }

      const x = padding + col * moduleSize
      const y = padding + row * moduleSize
      const inset = moduleSize * 0.08
      const rectSize = Math.max(moduleSize - inset * 2, moduleSize * 0.76)
      const radius = Math.max(rectSize * 0.18, 1.2)

      moduleRects.push(
        `<rect x="${formatNumber(x + inset)}" y="${formatNumber(y + inset)}" width="${formatNumber(rectSize)}" height="${formatNumber(rectSize)}" rx="${formatNumber(radius)}" fill="${dotColor}" />`,
      )
    }
  }

  const finderPatterns = [
    buildFinderPattern(padding, padding, moduleSize, dotColor),
    buildFinderPattern(size - padding - moduleSize * 7, padding, moduleSize, dotColor),
    buildFinderPattern(padding, size - padding - moduleSize * 7, moduleSize, dotColor),
  ].join('')

  if (variant === 'plain') {
    return [
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc">`,
      `<title id="${id}-title">QR code for ${escapeXml(content)}</title>`,
      `<desc id="${id}-desc">Plain SVG QR code generated locally.</desc>`,
      `<rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${backgroundColor}" />`,
      ...moduleRects,
      finderPatterns,
      '</svg>',
    ].join('')
  }

  return [
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc">`,
    `<title id="${id}-title">QR code for ${escapeXml(content)}</title>`,
    `<desc id="${id}-desc">Stylized SVG QR code generated locally.</desc>`,
    '<defs>',
    `<linearGradient id="${id}-frame" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">`,
    '<stop offset="0%" stop-color="#0B1220" />',
    '<stop offset="55%" stop-color="#172554" />',
    '<stop offset="100%" stop-color="#0F172A" />',
    '</linearGradient>',
    `<radialGradient id="${id}-halo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${formatNumber(size * 0.18)} ${formatNumber(size * 0.12)}) rotate(40) scale(${formatNumber(size * 0.42)} ${formatNumber(size * 0.38)})">`,
    `<stop offset="0%" stop-color="${accentColor}" stop-opacity="0.34" />`,
    `<stop offset="100%" stop-color="${highlightColor}" stop-opacity="0" />`,
    '</radialGradient>',
    `<filter id="${id}-frame-glow" x="-20%" y="-20%" width="140%" height="140%">`,
    '<feGaussianBlur stdDeviation="10" />',
    '</filter>',
    '</defs>',
    `<rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#${id}-frame)" />`,
    `<rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#${id}-halo)" />`,
    `<rect x="${formatNumber(panelInset)}" y="${formatNumber(panelInset)}" width="${formatNumber(panelSize)}" height="${formatNumber(panelSize)}" rx="${formatNumber(panelRadius)}" fill="${backgroundColor}" />`,
    `<rect x="${formatNumber(panelInset)}" y="${formatNumber(panelInset)}" width="${formatNumber(panelSize)}" height="${formatNumber(panelSize)}" rx="${formatNumber(panelRadius)}" fill="none" stroke="${gridColor}" />`,
    ...moduleRects,
    finderPatterns,
    [
      `<circle cx="${formatNumber(size * 0.12)}" cy="${formatNumber(size * 0.12)}" r="${formatNumber(size * 0.024)}" fill="${highlightColor}" opacity="0.9" filter="url(#${id}-frame-glow)">`,
      '<animate attributeName="opacity" values="0.72;1;0.72" dur="3.6s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${formatNumber(size * 0.88)}" cy="${formatNumber(size * 0.88)}" r="${formatNumber(size * 0.026)}" fill="${accentColor}" opacity="0.86" filter="url(#${id}-frame-glow)">`,
      '<animate attributeName="opacity" values="0.68;0.96;0.68" dur="4.2s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    `<path d="M ${formatNumber(size * 0.16)} ${formatNumber(size * 0.91)} H ${formatNumber(size * 0.34)}" stroke="${highlightColor}" stroke-width="3" stroke-linecap="round" opacity="0.88" />`,
    `<path d="M ${formatNumber(size * 0.66)} ${formatNumber(size * 0.09)} H ${formatNumber(size * 0.84)}" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" opacity="0.88" />`,
    '</svg>',
  ].join('')
}

export function createQrCodeSvgDataUri(content: string, options: QrCodeSvgOptions = {}) {
  const svg = createQrCodeSvg(content, options)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function buildFinderPattern(
  x: number,
  y: number,
  moduleSize: number,
  darkColor: string,
) {
  const outerSize = moduleSize * 7
  const outerInset = moduleSize
  const innerInset = moduleSize * 2
  const outerRadius = moduleSize * 0.9
  const innerRadius = moduleSize * 0.56

  return [
    `<g transform="translate(${formatNumber(x)} ${formatNumber(y)})">`,
    `<rect width="${formatNumber(outerSize)}" height="${formatNumber(outerSize)}" rx="${formatNumber(outerRadius)}" fill="${darkColor}" />`,
    `<rect x="${formatNumber(outerInset)}" y="${formatNumber(outerInset)}" width="${formatNumber(outerSize - outerInset * 2)}" height="${formatNumber(outerSize - outerInset * 2)}" rx="${formatNumber(outerRadius * 0.72)}" fill="#FFFFFF" />`,
    `<rect x="${formatNumber(innerInset)}" y="${formatNumber(innerInset)}" width="${formatNumber(outerSize - innerInset * 2)}" height="${formatNumber(outerSize - innerInset * 2)}" rx="${formatNumber(innerRadius)}" fill="${darkColor}" />`,
    '</g>',
  ].join('')
}

function isFinderZone(row: number, col: number, moduleCount: number) {
  return (
    (row < 7 && col < 7)
    || (row < 7 && col >= moduleCount - 7)
    || (row >= moduleCount - 7 && col < 7)
  )
}
