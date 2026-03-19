import { createQrMatrix } from './qr'

export interface HeroBadge {
  text: string
  color?: string
}

export interface HeroSvgOptions {
  width?: number
  height?: number
  title?: string
  subtitle?: string
  badge?: HeroBadge
}

export interface QrCodeSvgOptions {
  size?: number
  padding?: number
  backgroundColor?: string
  gridColor?: string
  accentColor?: string
  highlightColor?: string
  dotColor?: string
  cornerRadius?: number
}

export interface ContactCardSvgOptions {
  width?: number
  height?: number
  title?: string
  label?: string
  value?: string
  qrValue?: string
  note?: string
  badge?: string
  iconHref?: string
  accentColor?: string
  highlightColor?: string
}

const DEFAULTS = {
  width: 1280,
  height: 360,
  title: 'ice breaker',
  subtitle: 'Build systems, mini-program workflows, and profile-grade interfaces.',
  badge: {
    text: 'Github Profile Hero',
    color: '#FFD166',
  },
} satisfies Required<HeroSvgOptions>

const QR_DEFAULTS = {
  size: 160,
  padding: 20,
  backgroundColor: '#F8FAFC',
  gridColor: '#E2E8F0',
  accentColor: '#7A7CFF',
  highlightColor: '#2BFFCF',
  dotColor: '#111827',
  cornerRadius: 26,
} satisfies Required<QrCodeSvgOptions>

const CONTACT_CARD_DEFAULTS = {
  width: 320,
  height: 236,
  badge: 'Scan to connect',
  accentColor: '#7A7CFF',
  highlightColor: '#2BFFCF',
} satisfies Omit<Required<ContactCardSvgOptions>, 'title' | 'label' | 'value' | 'qrValue' | 'note' | 'iconHref'>

export function createHeroSvg(options: HeroSvgOptions = {}) {
  const width = options.width ?? DEFAULTS.width
  const height = options.height ?? DEFAULTS.height
  const title = options.title ?? DEFAULTS.title
  const subtitle = escapeXml(options.subtitle ?? DEFAULTS.subtitle)
  const badge = {
    text: escapeXml(options.badge?.text ?? DEFAULTS.badge.text),
    color: options.badge?.color ?? DEFAULTS.badge.color,
  }
  const escapedTitle = escapeXml(title)
  const dotX = 72 + Math.max(340, title.length * 32)
  const dotY = height * 0.5 - 14

  const id = `hero-${Math.abs(hashCode(`${width}-${height}-${title}-${subtitle}-${badge.text}`))}`
  const gridPath = buildGridPath(width, height, 48)
  const accents = createAccentShapes(width, height, id)
  const badgeWidth = estimateBadgeWidth(badge.text)

  return [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc">`,
    `<title id="${id}-title">${escapeXml(title)}</title>`,
    `<desc id="${id}-desc">${subtitle}</desc>`,
    '<defs>',
    `<linearGradient id="${id}-bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">`,
    '<stop offset="0%" stop-color="#030711" />',
    '<stop offset="38%" stop-color="#0A1B3D" />',
    '<stop offset="72%" stop-color="#15104A" />',
    '<stop offset="100%" stop-color="#02050D" />',
    `<animate attributeName="x1" values="0;${width * 0.12};0" dur="12s" repeatCount="indefinite" />`,
    `<animate attributeName="y2" values="${height};${height * 0.82};${height}" dur="14s" repeatCount="indefinite" />`,
    '</linearGradient>',
    `<radialGradient id="${id}-glow-a" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.18} ${height * 0.16}) rotate(48) scale(${width * 0.32} ${height * 0.68})">`,
    '<stop offset="0%" stop-color="#2BFFCF" stop-opacity="0.78" />',
    '<stop offset="100%" stop-color="#31D0AA" stop-opacity="0" />',
    `<animateTransform attributeName="gradientTransform" type="translate" additive="sum" values="0 0;${width * 0.024} ${height * 0.028};0 0" dur="8s" repeatCount="indefinite" />`,
    '</radialGradient>',
    `<radialGradient id="${id}-glow-b" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.82} ${height * 0.22}) rotate(125) scale(${width * 0.2} ${height * 0.55})">`,
    '<stop offset="0%" stop-color="#7A7CFF" stop-opacity="0.72" />',
    '<stop offset="100%" stop-color="#5DA9FF" stop-opacity="0" />',
    `<animateTransform attributeName="gradientTransform" type="translate" additive="sum" values="0 0;-${width * 0.02} ${height * 0.022};0 0" dur="10s" repeatCount="indefinite" />`,
    '</radialGradient>',
    `<linearGradient id="${id}-scan" x1="0" y1="0" x2="${width}" y2="0" gradientUnits="userSpaceOnUse">`,
    '<stop offset="0%" stop-color="rgba(122,124,255,0)" />',
    '<stop offset="50%" stop-color="rgba(122,124,255,0.42)" />',
    '<stop offset="100%" stop-color="rgba(43,255,207,0)" />',
    '</linearGradient>',
    `<filter id="${id}-blur" x="-20%" y="-20%" width="140%" height="140%">`,
    '<feGaussianBlur stdDeviation="18" />',
    '</filter>',
    `<filter id="${id}-title-glow" x="-20%" y="-40%" width="160%" height="180%">`,
    '<feGaussianBlur stdDeviation="6" result="titleBlur" />',
    '<feColorMatrix in="titleBlur" type="matrix" values="1 0 0 0 0  0 1 0 0 0.35  0 0 1 0 0.55  0 0 0 1 0" result="titleGlow" />',
    '<feMerge>',
    '<feMergeNode in="titleGlow" />',
    '<feMergeNode in="SourceGraphic" />',
    '</feMerge>',
    '</filter>',
    '</defs>',
    `<rect width="${width}" height="${height}" rx="28" fill="url(#${id}-bg)" />`,
    `<rect width="${width}" height="${height}" rx="28" fill="url(#${id}-glow-a)" />`,
    `<rect width="${width}" height="${height}" rx="28" fill="url(#${id}-glow-b)" />`,
    `<path d="${gridPath}" stroke="rgba(133,164,255,0.12)" stroke-width="1" />`,
    [
      `<rect x="-${width * 0.18}" y="0" width="${width * 0.24}" height="${height}" fill="url(#${id}-scan)" opacity="0.55">`,
      `<animate attributeName="x" values="-${width * 0.22};${width}" dur="7s" repeatCount="indefinite" />`,
      '</rect>',
    ].join(''),
    ...accents,
    `<rect x="72" y="72" width="${badgeWidth}" height="32" rx="16" fill="rgba(10,16,36,0.72)" stroke="${badge.color}" />`,
    `<text x="88" y="93" fill="${badge.color}" font-family="'Fira Code', 'JetBrains Mono', monospace" font-size="14">${badge.text}</text>`,
    [
      `<text x="72" y="${height * 0.5}" fill="#F8FAFC" filter="url(#${id}-title-glow)" font-family="'Space Grotesk', 'Avenir Next', sans-serif" font-size="52" font-weight="700" letter-spacing="4">${escapedTitle}`,
      '<animate attributeName="fill" values="#EAFDFF;#B6FFF0;#EAFDFF" dur="2.8s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.88;1;0.88" dur="2.8s" repeatCount="indefinite" />',
      '</text>',
    ].join(''),
    [
      `<text x="74" y="${height * 0.5 + 2}" fill="rgba(43,255,207,0.2)" font-family="'Space Grotesk', 'Avenir Next', sans-serif" font-size="52" font-weight="700" letter-spacing="4">${escapedTitle}`,
      '<animate attributeName="opacity" values="0.14;0.46;0.14" dur="1.9s" repeatCount="indefinite" />',
      '</text>',
    ].join(''),
    [
      `<circle cx="${dotX}" cy="${dotY}" r="8" fill="#FFD166">`,
      '<animate attributeName="r" values="7;10;7" dur="2.4s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    `<text x="72" y="${height * 0.7}" fill="rgba(226,232,240,0.92)" font-family="'IBM Plex Sans', 'Segoe UI', sans-serif" font-size="24">${subtitle}</text>`,
    `<text x="72" y="${height - 54}" fill="rgba(148,163,184,0.92)" font-family="'Fira Code', 'JetBrains Mono', monospace" font-size="16">const profile = createSomethingMemorable()</text>`,
    [
      `<rect x="0" y="0" width="${width}" height="${height}" rx="28" fill="none" stroke="rgba(122,124,255,0.28)">`,
      '<animate attributeName="stroke-opacity" values="0.25;0.65;0.25" dur="4s" repeatCount="indefinite" />',
      '</rect>',
    ].join(''),
    '</svg>',
  ].join('')
}

export function createHeroSvgDataUri(options: HeroSvgOptions = {}) {
  const svg = createHeroSvg(options)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function createQrCodeSvg(content: string, options: QrCodeSvgOptions = {}) {
  const size = options.size ?? QR_DEFAULTS.size
  const padding = options.padding ?? QR_DEFAULTS.padding
  const backgroundColor = options.backgroundColor ?? QR_DEFAULTS.backgroundColor
  const gridColor = options.gridColor ?? QR_DEFAULTS.gridColor
  const accentColor = options.accentColor ?? QR_DEFAULTS.accentColor
  const highlightColor = options.highlightColor ?? QR_DEFAULTS.highlightColor
  const dotColor = options.dotColor ?? QR_DEFAULTS.dotColor
  const cornerRadius = options.cornerRadius ?? QR_DEFAULTS.cornerRadius
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
    buildFinderPattern(padding, padding, moduleSize, dotColor, id),
    buildFinderPattern(size - padding - moduleSize * 7, padding, moduleSize, dotColor, id),
    buildFinderPattern(padding, size - padding - moduleSize * 7, moduleSize, dotColor, id),
  ].join('')

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

function createAccentShapes(width: number, height: number, id: string) {
  return [
    [
      `<circle cx="${width * 0.76}" cy="${height * 0.68}" r="88" fill="rgba(43,255,207,0.18)" filter="url(#${id}-blur)">`,
      '<animate attributeName="opacity" values="0.4;0.95;0.4" dur="4.8s" repeatCount="indefinite" />',
      '<animate attributeName="r" values="80;102;80" dur="6.2s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<path d="M ${width * 0.62} ${height * 0.24} L ${width * 0.88} ${height * 0.18} L ${width * 0.84} ${height * 0.42} L ${width * 0.58} ${height * 0.47} Z" fill="rgba(122,124,255,0.16)" stroke="rgba(122,124,255,0.62)">`,
      `<animateTransform attributeName="transform" type="translate" values="0 0;0 -10;0 0" dur="6.5s" repeatCount="indefinite" />`,
      '</path>',
    ].join(''),
    [
      `<path d="M ${width * 0.68} ${height * 0.62} C ${width * 0.77} ${height * 0.54}, ${width * 0.84} ${height * 0.81}, ${width * 0.92} ${height * 0.69}" stroke="rgba(240,244,255,0.54)" stroke-width="2" stroke-linecap="round" stroke-dasharray="10 8">`,
      '<animate attributeName="stroke-dashoffset" values="0;-44" dur="2.8s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<circle cx="${width * 0.8}" cy="${height * 0.28}" r="6" fill="#FFD166">`,
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" dur="4.2s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.65;1;0.65" dur="2.2s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${width * 0.86}" cy="${height * 0.74}" r="8" fill="#31D0AA">`,
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 10;0 0" dur="5.4s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.55;1;0.55" dur="2.4s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
  ]
}

function buildGridPath(width: number, height: number, gap: number) {
  const segments: string[] = []
  for (let x = gap; x < width; x += gap) {
    segments.push(`M${x} 0V${height}`)
  }
  for (let y = gap; y < height; y += gap) {
    segments.push(`M0 ${y}H${width}`)
  }
  return segments.join('')
}

function estimateBadgeWidth(text: string) {
  return Math.max(160, text.length * 8 + 32)
}

function buildFinderPattern(
  x: number,
  y: number,
  moduleSize: number,
  darkColor: string,
  _id: string,
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

function formatNumber(value: number) {
  return Number(value.toFixed(2))
}

function escapeXml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
}

function hashCode(input: string) {
  let hash = 0
  for (const char of input) {
    hash = (hash << 5) - hash + char.charCodeAt(0)
    hash |= 0
  }
  return hash
}
