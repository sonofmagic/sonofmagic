import { createQrCodeSvg } from '../qr/svg'
import { buildGridPath, escapeXml, formatNumber, hashCode } from '../shared/svg'
import type { ContactCardSvgOptions } from '../types'

const CONTACT_CARD_DEFAULTS = {
  width: 320,
  height: 236,
  badge: 'Scan to connect',
  accentColor: '#7A7CFF',
  highlightColor: '#2BFFCF',
} satisfies Omit<Required<ContactCardSvgOptions>, 'title' | 'label' | 'value' | 'qrValue' | 'note' | 'iconHref'>

export function createContactCardSvg(options: ContactCardSvgOptions) {
  const width = options.width ?? CONTACT_CARD_DEFAULTS.width
  const height = options.height ?? CONTACT_CARD_DEFAULTS.height
  const badgeText = options.badge === undefined ? CONTACT_CARD_DEFAULTS.badge : options.badge
  const badge = badgeText ? escapeXml(badgeText) : ''
  const accentColor = options.accentColor ?? CONTACT_CARD_DEFAULTS.accentColor
  const highlightColor = options.highlightColor ?? CONTACT_CARD_DEFAULTS.highlightColor
  const title = escapeXml(options.title ?? '')
  const label = escapeXml(options.label ?? '')
  const value = escapeXml(options.value ?? '')
  const qrValue = options.qrValue ?? options.value ?? ''
  const iconHref = options.iconHref ? escapeXml(options.iconHref) : ''
  const note = options.note ? escapeXml(options.note) : ''
  const qrSize = 138
  const qrX = width - qrSize - 28
  const qrY = height - qrSize - 28
  const id = `contact-${Math.abs(hashCode(`${title}-${label}-${value}-${qrValue}-${accentColor}-${highlightColor}`))}`
  const badgeWidth = Math.max(120, badge.length * 8 + 28)
  const qrSvg = createQrCodeSvg(qrValue, {
    size: qrSize,
    padding: 18,
    accentColor,
    highlightColor,
    backgroundColor: '#F8FAFC',
    gridColor: 'rgba(15, 23, 42, 0.12)',
    dotColor: '#020617',
    cornerRadius: 22,
  })

  return [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc">`,
    `<title id="${id}-title">${title}</title>`,
    `<desc id="${id}-desc">${label} contact card with a scannable QR code.</desc>`,
    '<defs>',
    `<linearGradient id="${id}-bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">`,
    '<stop offset="0%" stop-color="#030711" />',
    '<stop offset="40%" stop-color="#0A1B3D" />',
    '<stop offset="78%" stop-color="#15104A" />',
    '<stop offset="100%" stop-color="#02050D" />',
    '</linearGradient>',
    `<radialGradient id="${id}-glow-a" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(72 42) rotate(38) scale(${formatNumber(width * 0.42)} ${formatNumber(height * 0.58)})">`,
    `<stop offset="0%" stop-color="${highlightColor}" stop-opacity="0.34" />`,
    '<stop offset="100%" stop-color="#31D0AA" stop-opacity="0" />',
    '</radialGradient>',
    `<radialGradient id="${id}-glow-b" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${formatNumber(width * 0.84)} ${formatNumber(height * 0.18)}) rotate(120) scale(${formatNumber(width * 0.26)} ${formatNumber(height * 0.42)})">`,
    `<stop offset="0%" stop-color="${accentColor}" stop-opacity="0.42" />`,
    '<stop offset="100%" stop-color="#5DA9FF" stop-opacity="0" />',
    '</radialGradient>',
    `<filter id="${id}-blur" x="-20%" y="-20%" width="140%" height="140%">`,
    '<feGaussianBlur stdDeviation="14" />',
    '</filter>',
    '</defs>',
    `<rect width="${width}" height="${height}" rx="28" fill="url(#${id}-bg)" />`,
    `<rect width="${width}" height="${height}" rx="28" fill="url(#${id}-glow-a)" />`,
    `<rect width="${width}" height="${height}" rx="28" fill="url(#${id}-glow-b)" />`,
    `<path d="${buildGridPath(width, height, 24)}" stroke="rgba(133,164,255,0.08)" stroke-width="1" />`,
    badge
      ? `<rect x="22" y="20" width="${badgeWidth}" height="30" rx="15" fill="rgba(10,16,36,0.72)" stroke="${accentColor}" />`
      : '',
    badge
      ? `<text x="36" y="40" fill="${accentColor}" font-family="'Fira Code', 'JetBrains Mono', monospace" font-size="13">${badge}</text>`
      : '',
    `<rect x="24" y="70" width="88" height="88" rx="24" fill="rgba(248,250,252,0.08)" stroke="rgba(226,232,240,0.16)" />`,
    `<circle cx="68" cy="114" r="28" fill="rgba(10,16,36,0.78)" stroke="${accentColor}" stroke-width="1.5" />`,
    iconHref
      ? `<image href="${iconHref}" x="48" y="94" width="40" height="40" preserveAspectRatio="xMidYMid meet" />`
      : '',
    note
      ? `<text x="24" y="${height - 28}" fill="rgba(148,163,184,0.92)" font-family="'IBM Plex Sans', 'Segoe UI', sans-serif" font-size="13">${note}</text>`
      : '',
    `<path d="M 24 ${height - 48} H 124" stroke="${highlightColor}" stroke-width="3" stroke-linecap="round" opacity="0.82" />`,
    `<circle cx="${width - 30}" cy="34" r="5" fill="#FFD166">`,
    '<animate attributeName="opacity" values="0.62;1;0.62" dur="2.2s" repeatCount="indefinite" />',
    '</circle>',
    `<circle cx="${width - 54}" cy="34" r="5" fill="${highlightColor}">`,
    '<animate attributeName="opacity" values="0.52;0.92;0.52" dur="2.8s" repeatCount="indefinite" />',
    '</circle>',
    `<path d="M ${qrX - 8} ${qrY + 22} L ${qrX - 8} ${qrY + qrSize - 22}" stroke="rgba(248,250,252,0.2)" stroke-width="1.5" stroke-linecap="round" />`,
    `<path d="M ${qrX + 22} ${qrY - 8} L ${qrX + qrSize - 22} ${qrY - 8}" stroke="rgba(248,250,252,0.2)" stroke-width="1.5" stroke-linecap="round" />`,
    `<g filter="url(#${id}-blur)" opacity="0.35">`,
    `<circle cx="${formatNumber(width * 0.76)}" cy="${formatNumber(height * 0.76)}" r="28" fill="${highlightColor}" />`,
    '</g>',
    `<svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" viewBox="0 0 ${qrSize} ${qrSize}">`,
    qrSvg,
    '</svg>',
    `<rect x="0.75" y="0.75" width="${width - 1.5}" height="${height - 1.5}" rx="27.25" stroke="rgba(122,124,255,0.32)" />`,
    '</svg>',
  ].join('')
}
