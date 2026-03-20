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
  variant?: 'decorated' | 'plain'
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

export interface ContactPanelEntry {
  title?: string
  qrValue: string
  iconHref?: string
  note?: string
  badge?: string
  accentColor?: string
  highlightColor?: string
}

export interface ContactPanelSvgOptions {
  width?: number
  height?: number
  entries: [ContactPanelEntry, ContactPanelEntry]
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
  variant: 'decorated',
} satisfies Required<QrCodeSvgOptions>

const CONTACT_CARD_DEFAULTS = {
  width: 320,
  height: 236,
  badge: 'Scan to connect',
  accentColor: '#7A7CFF',
  highlightColor: '#2BFFCF',
} satisfies Omit<Required<ContactCardSvgOptions>, 'title' | 'label' | 'value' | 'qrValue' | 'note' | 'iconHref'>

const CONTACT_PANEL_DEFAULTS = {
  width: 1280,
  height: 360,
} satisfies Required<Omit<ContactPanelSvgOptions, 'entries'>>

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
    buildFinderPattern(padding, padding, moduleSize, dotColor, id),
    buildFinderPattern(size - padding - moduleSize * 7, padding, moduleSize, dotColor, id),
    buildFinderPattern(padding, size - padding - moduleSize * 7, moduleSize, dotColor, id),
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

export function createContactPanelSvg(options: ContactPanelSvgOptions) {
  const width = options.width ?? CONTACT_PANEL_DEFAULTS.width
  const height = options.height ?? CONTACT_PANEL_DEFAULTS.height
  const id = `contact-panel-${Math.abs(hashCode(`${width}-${height}-${options.entries.map(entry => entry.qrValue).join('|')}`))}`
  const isBanner = width >= 960
  const cardWidth = isBanner ? Math.round(width * 0.31) : 136
  const cardHeight = isBanner ? Math.round(height * 0.84) : 172
  const cardY = isBanner ? Math.round((height - cardHeight) / 2) : 16
  const sidePadding = isBanner ? Math.round(width * 0.11) : 18
  const leftX = sidePadding
  const rightX = width - cardWidth - sidePadding
  const dividerX = Math.round(width / 2)
  const leftEntry = options.entries[0]
  const rightEntry = options.entries[1]

  return [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc">`,
    `<title id="${id}-title">Contact panel</title>`,
    `<desc id="${id}-desc">Combined website and Wechat contact panel with two scannable QR codes.</desc>`,
    '<defs>',
    `<linearGradient id="${id}-bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">`,
    '<stop offset="0%" stop-color="#03101E" />',
    '<stop offset="22%" stop-color="#0B2442" />',
    '<stop offset="58%" stop-color="#16467F" />',
    '<stop offset="100%" stop-color="#07111D" />',
    `<animate attributeName="x1" values="0;${width * 0.1};0" dur="10s" repeatCount="indefinite" />`,
    `<animate attributeName="y2" values="${height};${height * 0.78};${height}" dur="12s" repeatCount="indefinite" />`,
    '</linearGradient>',
    `<linearGradient id="${id}-divider" x1="${dividerX}" y1="76" x2="${dividerX}" y2="${height - 76}" gradientUnits="userSpaceOnUse">`,
    '<stop offset="0%" stop-color="rgba(96,165,250,0)" />',
    '<stop offset="50%" stop-color="rgba(96,165,250,0.34)" />',
    '<stop offset="100%" stop-color="rgba(43,255,207,0)" />',
    '</linearGradient>',
    `<radialGradient id="${id}-wash-left" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${formatNumber(leftX + cardWidth / 2)} ${formatNumber(cardY + cardHeight / 2)}) rotate(-8) scale(${formatNumber(cardWidth * 0.86)} ${formatNumber(cardHeight * 0.88)})">`,
    '<stop offset="0%" stop-color="#2BFFCF" stop-opacity="0.18" />',
    '<stop offset="100%" stop-color="#2BFFCF" stop-opacity="0" />',
    '</radialGradient>',
    `<radialGradient id="${id}-wash-right" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${formatNumber(rightX + cardWidth / 2)} ${formatNumber(cardY + cardHeight / 2)}) rotate(8) scale(${formatNumber(cardWidth * 0.86)} ${formatNumber(cardHeight * 0.88)})">`,
    '<stop offset="0%" stop-color="#60A5FA" stop-opacity="0.18" />',
    '<stop offset="100%" stop-color="#60A5FA" stop-opacity="0" />',
    '</radialGradient>',
    `<radialGradient id="${id}-top-bloom" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${formatNumber(width * 0.5)} ${formatNumber(height * 0.08)}) rotate(90) scale(${formatNumber(width * 0.36)} ${formatNumber(height * 0.22)})">`,
    '<stop offset="0%" stop-color="#C1F8FF" stop-opacity="0.24" />',
    '<stop offset="100%" stop-color="#C1F8FF" stop-opacity="0" />',
    '</radialGradient>',
    `<linearGradient id="${id}-edge-left" x1="0" y1="${height * 0.18}" x2="${width * 0.12}" y2="${height * 0.82}" gradientUnits="userSpaceOnUse">`,
    '<stop offset="0%" stop-color="rgba(43,255,207,0)" />',
    '<stop offset="52%" stop-color="rgba(43,255,207,0.26)" />',
    '<stop offset="100%" stop-color="rgba(43,255,207,0)" />',
    '</linearGradient>',
    `<linearGradient id="${id}-edge-right" x1="${width}" y1="${height * 0.12}" x2="${width * 0.88}" y2="${height * 0.88}" gradientUnits="userSpaceOnUse">`,
    '<stop offset="0%" stop-color="rgba(96,165,250,0)" />',
    '<stop offset="48%" stop-color="rgba(96,165,250,0.24)" />',
    '<stop offset="100%" stop-color="rgba(96,165,250,0)" />',
    '</linearGradient>',
    `<filter id="${id}-blur" x="-20%" y="-20%" width="140%" height="140%">`,
    '<feGaussianBlur stdDeviation="16" />',
    '</filter>',
    `<filter id="${id}-soft-glow" x="-30%" y="-30%" width="160%" height="160%">`,
    '<feGaussianBlur stdDeviation="7" />',
    '</filter>',
    `<filter id="${id}-edge-glow" x="-40%" y="-40%" width="180%" height="180%">`,
    '<feGaussianBlur stdDeviation="3.5" />',
    '</filter>',
    '</defs>',
    `<rect width="${width}" height="${height}" rx="26" fill="url(#${id}-bg)" />`,
    `<rect width="${width}" height="${height}" rx="26" fill="url(#${id}-top-bloom)" />`,
    `<rect width="${width}" height="${height}" rx="26" fill="url(#${id}-wash-left)" opacity="0.74" />`,
    `<rect width="${width}" height="${height}" rx="26" fill="url(#${id}-wash-right)" opacity="0.74" />`,
    [
      `<path d="M ${formatNumber(width * 0.04)} ${formatNumber(height * 0.18)} C ${formatNumber(width * 0.08)} ${formatNumber(height * 0.3)}, ${formatNumber(width * 0.06)} ${formatNumber(height * 0.62)}, ${formatNumber(width * 0.11)} ${formatNumber(height * 0.82)}" stroke="url(#${id}-edge-left)" stroke-width="14" stroke-linecap="round" opacity="0.42" filter="url(#${id}-soft-glow)">`,
      '<animate attributeName="opacity" values="0.12;0.42;0.12" dur="4.6s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<path d="M ${formatNumber(width * 0.96)} ${formatNumber(height * 0.14)} C ${formatNumber(width * 0.92)} ${formatNumber(height * 0.28)}, ${formatNumber(width * 0.94)} ${formatNumber(height * 0.58)}, ${formatNumber(width * 0.89)} ${formatNumber(height * 0.84)}" stroke="url(#${id}-edge-right)" stroke-width="14" stroke-linecap="round" opacity="0.4" filter="url(#${id}-soft-glow)">`,
      '<animate attributeName="opacity" values="0.1;0.4;0.1" dur="5.2s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    `<path d="${buildGridPath(width, height, 28)}" stroke="rgba(160,210,255,0.08)" stroke-width="1" />`,
    `<path d="M 0 ${height - 1} H ${width}" stroke="rgba(255,255,255,0.08)" />`,
    `<path d="M 28 28 H ${isBanner ? 120 : 84}" stroke="rgba(43,255,207,0.68)" stroke-width="2.5" stroke-linecap="round" />`,
    `<path d="M 28 28 V ${isBanner ? 76 : 60}" stroke="rgba(43,255,207,0.46)" stroke-width="2.5" stroke-linecap="round" />`,
    `<path d="M ${width - 28} 28 H ${width - (isBanner ? 120 : 84)}" stroke="rgba(96,165,250,0.68)" stroke-width="2.5" stroke-linecap="round" />`,
    `<path d="M ${width - 28} 28 V ${isBanner ? 76 : 60}" stroke="rgba(96,165,250,0.46)" stroke-width="2.5" stroke-linecap="round" />`,
    `<path d="M 28 ${height - 28} H ${isBanner ? 120 : 84}" stroke="rgba(96,165,250,0.36)" stroke-width="2.5" stroke-linecap="round" />`,
    `<path d="M ${width - 28} ${height - 28} H ${width - (isBanner ? 120 : 84)}" stroke="rgba(43,255,207,0.36)" stroke-width="2.5" stroke-linecap="round" />`,
    isBanner
      ? `<rect x="${dividerX - 1}" y="76" width="2" height="${height - 152}" rx="1" fill="url(#${id}-divider)" />`
      : '',
    isBanner
      ? `<path d="M ${dividerX - 26} 102 H ${dividerX + 26}" stroke="rgba(43,255,207,0.5)" stroke-width="2.5" stroke-linecap="round" />`
      : '',
    isBanner
      ? `<path d="M ${dividerX - 26} ${height - 102} H ${dividerX + 26}" stroke="rgba(96,165,250,0.42)" stroke-width="2.5" stroke-linecap="round" />`
      : '',
    isBanner
      ? `<circle cx="${dividerX}" cy="${Math.round(height / 2)}" r="5" fill="#C7FBFF" filter="url(#${id}-edge-glow)">`
      : '',
    isBanner
      ? '<animate attributeName="opacity" values="0.56;1;0.56" dur="2.6s" repeatCount="indefinite" />'
      : '',
    isBanner
      ? '</circle>'
      : '',
    [
      `<circle cx="${width * 0.5}" cy="26" r="3.5" fill="#FFD166">`,
      '<animate attributeName="opacity" values="0.45;1;0.45" dur="2.2s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${leftX + cardWidth / 2}" cy="${cardY + cardHeight / 2}" r="${Math.round(cardWidth * 0.34)}" fill="rgba(43,255,207,0.16)" filter="url(#${id}-blur)">`,
      '<animate attributeName="opacity" values="0.24;0.5;0.24" dur="4.6s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${rightX + cardWidth / 2}" cy="${cardY + cardHeight / 2}" r="${Math.round(cardWidth * 0.34)}" fill="rgba(96,165,250,0.16)" filter="url(#${id}-blur)">`,
      '<animate attributeName="opacity" values="0.24;0.5;0.24" dur="4.9s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    ...createPanelOrbitAccents({
      cardX: leftX,
      cardY,
      cardWidth,
      cardHeight,
      qrSide: 'left',
      color: '#2BFFCF',
      secondaryColor: '#C7FBFF',
      id: `${id}-orbit-left`,
      compact: !isBanner,
    }),
    ...createPanelOrbitAccents({
      cardX: rightX,
      cardY,
      cardWidth,
      cardHeight,
      qrSide: 'right',
      color: '#60A5FA',
      secondaryColor: '#FFD166',
      id: `${id}-orbit-right`,
      compact: !isBanner,
    }),
    ...createCenterSignalAccents({
      centerX: dividerX,
      centerY: Math.round(height / 2),
      width,
      height,
      id,
      compact: !isBanner,
    }),
    `<rect x="0.75" y="0.75" width="${width - 1.5}" height="${height - 1.5}" rx="25.25" stroke="rgba(148,163,184,0.22)" />`,
    renderContactPanelCell(leftEntry, {
      x: leftX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      id: `${id}-left`,
      compact: !isBanner,
    }),
    renderContactPanelCell(rightEntry, {
      x: rightX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      id: `${id}-right`,
      compact: !isBanner,
    }),
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

function renderContactPanelCell(
  entry: ContactPanelEntry,
  frame: { x: number, y: number, width: number, height: number, id: string, compact?: boolean },
) {
  const iconName = resolveIconName(entry.iconHref)
  const title = escapeXml(entry.title ?? '')
  const note = entry.note ? escapeXml(entry.note) : ''
  const badge = entry.badge ? escapeXml(entry.badge) : ''
  const compact = frame.compact ?? false
  const qrSize = compact ? 114 : Math.min(Math.round(frame.width * 0.5), frame.height - 118)
  const qrX = frame.x + Math.floor((frame.width - qrSize) / 2)
  const qrY = frame.y + (compact ? 42 : 66)
  const iconSize = compact ? 22 : 34
  const iconX = frame.x + Math.floor((frame.width - iconSize) / 2)
  const iconY = frame.y + (compact ? 14 : 24)
  const noteX = frame.x + frame.width / 2
  const chipText = note || badge
  const chipWidth = chipText ? Math.max(compact ? 92 : 148, chipText.length * (compact ? 11 : 15) + (compact ? 20 : 30)) : 0
  const chipRectX = noteX - chipWidth / 2
  const chipRectHeight = compact ? 24 : 34
  const chipRectY = compact ? frame.y + frame.height - 30 : frame.y + frame.height - 46
  const chipTextY = chipRectY + (compact ? 15 : 22)
  const titleY = frame.y + (compact ? 34 : 42)
  const safeInset = compact ? 16 : 28
  const safeZoneX = qrX - safeInset
  const safeZoneY = qrY - safeInset
  const safeZoneSize = qrSize + safeInset * 2
  const qrSvg = createQrCodeSvg(entry.qrValue, {
    size: qrSize,
    padding: compact ? 12 : 18,
    backgroundColor: '#FFFFFF',
    dotColor: '#020617',
    cornerRadius: compact ? 16 : 28,
    variant: 'plain',
  })

  return [
    `<g>`,
    `<rect x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" rx="${compact ? 22 : 36}" fill="rgba(4,12,28,0.22)" stroke="rgba(191,235,255,0.14)" />`,
    `<rect x="${frame.x + 2}" y="${frame.y + 2}" width="${frame.width - 4}" height="${frame.height - 4}" rx="${compact ? 20 : 34}" fill="none" stroke="rgba(96,165,250,0.12)" />`,
    `<rect x="${frame.x + (compact ? 10 : 14)}" y="${frame.y + (compact ? 10 : 14)}" width="${frame.width - (compact ? 20 : 28)}" height="${frame.height - (compact ? 20 : 28)}" rx="${compact ? 18 : 28}" fill="rgba(255,255,255,0.03)" />`,
    `<path d="M ${frame.x + (compact ? 14 : 24)} ${frame.y + (compact ? 16 : 24)} H ${frame.x + (compact ? 44 : 82)}" stroke="rgba(43,255,207,0.6)" stroke-width="${compact ? 2 : 3}" stroke-linecap="round" />`,
    `<path d="M ${frame.x + frame.width - (compact ? 14 : 24)} ${frame.y + (compact ? 16 : 24)} H ${frame.x + frame.width - (compact ? 44 : 82)}" stroke="rgba(96,165,250,0.6)" stroke-width="${compact ? 2 : 3}" stroke-linecap="round" />`,
    renderInlineIcon(iconName, iconX, iconY, iconSize),
    title
      ? `<text x="${frame.x + frame.width / 2}" y="${titleY}" text-anchor="middle" fill="rgba(226,232,240,0.84)" font-family="'Space Grotesk', 'Avenir Next', sans-serif" font-size="${compact ? 11 : 15}" font-weight="700" letter-spacing="${compact ? 0.6 : 1.8}">${title}</text>`
      : '',
    [
      `<path d="M ${safeZoneX} ${qrY + qrSize / 2} H ${safeZoneX + safeZoneSize}" stroke="${iconName === 'wechat' ? 'rgba(255,138,91,0.66)' : 'rgba(43,255,207,0.62)'}" stroke-width="${compact ? 2.2 : 3.4}" stroke-linecap="round" opacity="0.8" stroke-dasharray="${compact ? '14 22' : '24 30'}">`,
      '<animate attributeName="stroke-dashoffset" values="0;-60" dur="2.4s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.26;0.94;0.26" dur="2.6s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<path d="M ${qrX + qrSize / 2} ${safeZoneY} V ${safeZoneY + safeZoneSize}" stroke="${iconName === 'wechat' ? 'rgba(255,209,102,0.58)' : 'rgba(96,165,250,0.54)'}" stroke-width="${compact ? 2.2 : 3.4}" stroke-linecap="round" opacity="0.78" stroke-dasharray="${compact ? '12 18' : '18 24'}">`,
      '<animate attributeName="stroke-dashoffset" values="0;50" dur="2.8s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.24;0.86;0.24" dur="3s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<rect x="${qrX - (compact ? 5 : 10)}" y="${qrY - (compact ? 5 : 10)}" width="${qrSize + (compact ? 10 : 20)}" height="${qrSize + (compact ? 10 : 20)}" rx="${compact ? 22 : 38}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="${compact ? 1.25 : 1.6}" stroke-dasharray="${compact ? '10 8' : '14 10'}">`,
      '<animate attributeName="stroke-opacity" values="0.22;0.64;0.22" dur="3.2s" repeatCount="indefinite" />',
      '<animate attributeName="stroke-dashoffset" values="0;-36" dur="2.8s" repeatCount="indefinite" />',
      '</rect>',
    ].join(''),
    [
      `<rect x="${qrX - (compact ? 10 : 18)}" y="${qrY - (compact ? 10 : 18)}" width="${qrSize + (compact ? 20 : 36)}" height="${qrSize + (compact ? 20 : 36)}" rx="${compact ? 28 : 46}" fill="none" stroke="rgba(96,165,250,0.12)" stroke-width="${compact ? 1 : 1.4}">`,
      '<animate attributeName="stroke-opacity" values="0.1;0.26;0.1" dur="4.4s" repeatCount="indefinite" />',
      '</rect>',
    ].join(''),
    !compact
      ? `<rect x="${qrX - 24}" y="${qrY - 24}" width="${qrSize + 48}" height="${qrSize + 48}" rx="50" fill="rgba(255,255,255,0.025)" />`
      : '',
    [
      `<rect x="${safeZoneX}" y="${safeZoneY}" width="${safeZoneSize}" height="${safeZoneSize}" rx="${compact ? 26 : 48}" fill="none" stroke="${iconName === 'wechat' ? 'rgba(255,138,91,0.34)' : 'rgba(96,165,250,0.32)'}" stroke-width="${compact ? 1.2 : 1.6}" stroke-dasharray="${compact ? '10 14' : '16 18'}">`,
      '<animate attributeName="stroke-dashoffset" values="0;56" dur="4s" repeatCount="indefinite" />',
      '<animate attributeName="stroke-opacity" values="0.22;0.68;0.22" dur="3.6s" repeatCount="indefinite" />',
      '</rect>',
    ].join(''),
    ...createQrCornerPulses({
      x: safeZoneX,
      y: safeZoneY,
      size: safeZoneSize,
      color: iconName === 'wechat' ? '#FF8A5B' : '#2BFFCF',
      secondaryColor: iconName === 'wechat' ? '#FFD166' : '#60A5FA',
      panelId: frame.id,
      compact,
    }),
    chipText
      ? `<rect x="${chipRectX}" y="${chipRectY}" width="${chipWidth}" height="${chipRectHeight}" rx="${Math.round(chipRectHeight / 2)}" fill="rgba(7,19,36,0.96)" stroke="${note ? 'rgba(43,255,207,0.66)' : 'rgba(96,165,250,0.5)'}" />`
      : '',
    chipText
      ? `<path d="M ${chipRectX + (compact ? 10 : 16)} ${chipRectY + Math.round(chipRectHeight / 2)} H ${chipRectX + (compact ? 24 : 42)}" stroke="${note ? 'rgba(43,255,207,0.88)' : 'rgba(96,165,250,0.82)'}" stroke-width="${compact ? 2 : 3}" stroke-linecap="round" />`
      : '',
    chipText
      ? `<text x="${noteX + (compact ? 6 : 10)}" y="${chipTextY}" text-anchor="middle" fill="#F8FAFC" font-family="'IBM Plex Sans', 'Segoe UI', sans-serif" font-size="${compact ? 12 : 16}" font-weight="700">${chipText}</text>`
      : '',
    `<svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" viewBox="0 0 ${qrSize} ${qrSize}">`,
    qrSvg,
    '</svg>',
    '</g>',
  ].join('')
}

function createPanelOrbitAccents(options: {
  cardX: number
  cardY: number
  cardWidth: number
  cardHeight: number
  qrSide: 'left' | 'right'
  color: string
  secondaryColor: string
  id: string
  compact: boolean
}) {
  const {
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    qrSide,
    color,
    secondaryColor,
    id,
    compact,
  } = options
  const orbitWidth = compact ? 54 : 76
  const orbitHeight = compact ? 102 : 154
  const orbitX = qrSide === 'left'
    ? cardX - (compact ? 10 : 22)
    : cardX + cardWidth - orbitWidth + (compact ? 10 : 22)
  const orbitY = cardY + cardHeight * (compact ? 0.28 : 0.24)
  const satelliteX = qrSide === 'left' ? orbitX + orbitWidth - 8 : orbitX + 8
  const pathA = buildOrbitPath(orbitX, orbitY, orbitWidth, orbitHeight, qrSide === 'left')
  const pathB = buildOrbitPath(orbitX + (compact ? 6 : 10), orbitY + (compact ? 10 : 14), orbitWidth - (compact ? 12 : 20), orbitHeight - (compact ? 20 : 28), qrSide !== 'left')

  return [
    [
      `<path d="${pathA}" fill="none" stroke="${color}" stroke-width="${compact ? 1.8 : 2.4}" stroke-linecap="round" stroke-dasharray="${compact ? '10 16' : '16 24'}" opacity="0.72">`,
      '<animate attributeName="stroke-dashoffset" values="0;-64" dur="3.4s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.24;0.82;0.24" dur="3.6s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<path d="${pathB}" fill="none" stroke="${secondaryColor}" stroke-width="${compact ? 1.2 : 1.6}" stroke-linecap="round" stroke-dasharray="${compact ? '6 14' : '10 18'}" opacity="0.64">`,
      '<animate attributeName="stroke-dashoffset" values="0;52" dur="4.2s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.18;0.62;0.18" dur="4.6s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<circle cx="${formatNumber(satelliteX)}" cy="${formatNumber(orbitY + orbitHeight * 0.26)}" r="${compact ? 3.2 : 4.8}" fill="${secondaryColor}" filter="url(#${id.split('-orbit-')[0]}-edge-glow)">`,
      `<animateMotion dur="${compact ? '4.4s' : '5.2s'}" repeatCount="indefinite" path="${pathA}" />`,
      '<animate attributeName="opacity" values="0.46;1;0.46" dur="1.6s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${formatNumber(satelliteX)}" cy="${formatNumber(orbitY + orbitHeight * 0.68)}" r="${compact ? 2.6 : 4}" fill="${color}" filter="url(#${id.split('-orbit-')[0]}-soft-glow)">`,
      `<animateMotion dur="${compact ? '5.2s' : '6.4s'}" repeatCount="indefinite" rotate="auto-reverse" path="${pathB}" />`,
      '<animate attributeName="opacity" values="0.32;0.94;0.32" dur="2s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
  ]
}

function createCenterSignalAccents(options: {
  centerX: number
  centerY: number
  width: number
  height: number
  id: string
  compact: boolean
}) {
  const { centerX, centerY, width, height, id, compact } = options
  const ringRx = compact ? 34 : 56
  const ringRy = compact ? 72 : 108
  const innerRx = compact ? 20 : 32
  const innerRy = compact ? 44 : 68
  const dataHalf = compact ? 44 : 72
  const pillarHeight = compact ? 72 : 112

  return [
    [
      `<ellipse cx="${centerX}" cy="${centerY}" rx="${ringRx}" ry="${ringRy}" fill="none" stroke="rgba(193,248,255,0.28)" stroke-width="${compact ? 1.2 : 1.6}" stroke-dasharray="${compact ? '10 14' : '14 20'}" opacity="0.72">`,
      '<animate attributeName="stroke-dashoffset" values="0;-52" dur="4.8s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.16;0.72;0.16" dur="4.2s" repeatCount="indefinite" />',
      '</ellipse>',
    ].join(''),
    [
      `<ellipse cx="${centerX}" cy="${centerY}" rx="${innerRx}" ry="${innerRy}" fill="none" stroke="rgba(43,255,207,0.42)" stroke-width="${compact ? 1.6 : 2.2}" stroke-dasharray="${compact ? '8 12' : '10 16'}" opacity="0.84">`,
      '<animate attributeName="stroke-dashoffset" values="0;40" dur="3.4s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.24;0.84;0.24" dur="3.2s" repeatCount="indefinite" />',
      '</ellipse>',
    ].join(''),
    [
      `<path d="M ${centerX} ${centerY - pillarHeight / 2} V ${centerY + pillarHeight / 2}" stroke="rgba(193,248,255,0.18)" stroke-width="${compact ? 8 : 12}" stroke-linecap="round" filter="url(#${id}-soft-glow)">`,
      '<animate attributeName="opacity" values="0.08;0.34;0.08" dur="2.8s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<path d="M ${centerX - dataHalf} ${centerY - 62} H ${centerX + dataHalf}" stroke="rgba(43,255,207,0.48)" stroke-width="${compact ? 1.8 : 2.4}" stroke-linecap="round" stroke-dasharray="${compact ? '8 10' : '12 14'}">`,
      '<animate attributeName="stroke-dashoffset" values="0;-36" dur="2.4s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<path d="M ${centerX - dataHalf + 8} ${centerY + 62} H ${centerX + dataHalf - 8}" stroke="rgba(96,165,250,0.44)" stroke-width="${compact ? 1.8 : 2.4}" stroke-linecap="round" stroke-dasharray="${compact ? '8 10' : '12 14'}">`,
      '<animate attributeName="stroke-dashoffset" values="0;36" dur="2.7s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<circle cx="${centerX}" cy="${centerY}" r="${compact ? 7 : 10}" fill="#C7FBFF" filter="url(#${id}-edge-glow)">`,
      '<animate attributeName="r" values="6;11;6" dur="2.2s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.48;1;0.48" dur="1.8s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${centerX}" cy="${centerY - ringRy + (compact ? 14 : 20)}" r="${compact ? 2.8 : 4}" fill="#FFD166">`,
      `<animateMotion dur="${compact ? '4.8s' : '5.6s'}" repeatCount="indefinite" path="M ${centerX} ${centerY - ringRy + (compact ? 14 : 20)} A ${ringRx - (compact ? 8 : 12)} ${ringRy - (compact ? 16 : 24)} 0 1 1 ${centerX - 0.1} ${centerY - ringRy + (compact ? 14 : 20)}" />`,
      '<animate attributeName="opacity" values="0.34;0.92;0.34" dur="1.8s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${centerX}" cy="${centerY + ringRy - (compact ? 14 : 20)}" r="${compact ? 2.4 : 3.6}" fill="#60A5FA">`,
      `<animateMotion dur="${compact ? '5.4s' : '6.2s'}" repeatCount="indefinite" path="M ${centerX} ${centerY + ringRy - (compact ? 14 : 20)} A ${innerRx + (compact ? 2 : 4)} ${innerRy + (compact ? 10 : 16)} 0 1 0 ${centerX - 0.1} ${centerY + ringRy - (compact ? 14 : 20)}" />`,
      '<animate attributeName="opacity" values="0.28;0.84;0.28" dur="2s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
  ]
}

function buildOrbitPath(x: number, y: number, width: number, height: number, bendLeft: boolean) {
  const startX = bendLeft ? x + width : x
  const controlAX = bendLeft ? x - width * 0.36 : x + width * 1.36
  const controlBX = bendLeft ? x + width * 1.18 : x - width * 0.18
  const endX = bendLeft ? x + width * 0.4 : x + width * 0.6

  return `M ${formatNumber(startX)} ${formatNumber(y)} C ${formatNumber(controlAX)} ${formatNumber(y + height * 0.12)}, ${formatNumber(controlBX)} ${formatNumber(y + height * 0.54)}, ${formatNumber(endX)} ${formatNumber(y + height)}`
}

function createQrCornerPulses(options: {
  x: number
  y: number
  size: number
  color: string
  secondaryColor: string
  panelId: string
  compact: boolean
}) {
  const { x, y, size, color, secondaryColor, panelId, compact } = options
  const inset = compact ? 6 : 10
  const pulseRadius = compact ? 2.8 : 4.2
  const points = [
    { x: x + inset, y: y + inset, delay: '0s', fill: color },
    { x: x + size - inset, y: y + inset, delay: '0.4s', fill: secondaryColor },
    { x: x + inset, y: y + size - inset, delay: '0.8s', fill: secondaryColor },
    { x: x + size - inset, y: y + size - inset, delay: '1.2s', fill: color },
  ]

  return points.map(point => [
    `<circle cx="${formatNumber(point.x)}" cy="${formatNumber(point.y)}" r="${pulseRadius}" fill="${point.fill}" filter="url(#${panelId.replace(/-(left|right)$/, '')}-edge-glow)">`,
    `<animate attributeName="r" values="${pulseRadius * 0.8};${pulseRadius * 1.8};${pulseRadius * 0.8}" dur="2.4s" begin="${point.delay}" repeatCount="indefinite" />`,
    `<animate attributeName="opacity" values="0.36;1;0.36" dur="2.4s" begin="${point.delay}" repeatCount="indefinite" />`,
    '</circle>',
  ].join(''))
}

function resolveIconName(iconHref?: string) {
  if (!iconHref) {
    return ''
  }
  if (iconHref.includes('chorme')) {
    return 'chrome'
  }
  if (iconHref.includes('wechat')) {
    return 'wechat'
  }
  return ''
}

function renderInlineIcon(iconName: string, x: number, y: number, size: number) {
  if (!iconName) {
    return ''
  }

  const pathData = iconName === 'chrome'
    ? 'M371.8 512c0 77.5 62.7 140.2 140.2 140.2S652.2 589.5 652.2 512 589.5 371.8 512 371.8 371.8 434.4 371.8 512zM900 362.4l-234.3 12.1c63.6 74.3 64.6 181.5 11.1 263.7l-188 289.2c78 4.2 158.4-12.9 231.2-55.2 180-104 253-322.1 180-509.8zM320.3 591.9L163.8 284.1A415.35 415.35 0 0096 512c0 208 152.3 380.3 351.4 410.8l106.9-209.4c-96.6 18.2-189.9-34.8-234-121.5zm218.5-285.5l344.4 18.1C848 254.7 792.6 194 719.8 151.7 653.9 113.6 581.5 95.5 510.5 96c-122.5.5-242.2 55.2-322.1 154.5l128.2 196.9c32-91.9 124.8-146.7 222.2-141z'
    : 'M690.1 377.4c5.9 0 11.8.2 17.6.5-24.4-128.7-158.3-227.1-319.9-227.1C209 150.8 64 271.4 64 420.2c0 81.1 43.6 154.2 111.9 203.6a21.5 21.5 0 019.1 17.6c0 2.4-.5 4.6-1.1 6.9-5.5 20.3-14.2 52.8-14.6 54.3-.7 2.6-1.7 5.2-1.7 7.9 0 5.9 4.8 10.8 10.8 10.8 2.3 0 4.2-.9 6.2-2l70.9-40.9c5.3-3.1 11-5 17.2-5 3.2 0 6.4.5 9.5 1.4 33.1 9.5 68.8 14.8 105.7 14.8 6 0 11.9-.1 17.8-.4-7.1-21-10.9-43.1-10.9-66 0-135.8 132.2-245.8 295.3-245.8zm-194.3-86.5c23.8 0 43.2 19.3 43.2 43.1s-19.3 43.1-43.2 43.1c-23.8 0-43.2-19.3-43.2-43.1s19.4-43.1 43.2-43.1zm-215.9 86.2c-23.8 0-43.2-19.3-43.2-43.1s19.3-43.1 43.2-43.1 43.2 19.3 43.2 43.1-19.4 43.1-43.2 43.1zm586.8 415.6c56.9-41.2 93.2-102 93.2-169.7 0-124-120.8-224.5-269.9-224.5-149 0-269.9 100.5-269.9 224.5S540.9 847.5 690 847.5c30.8 0 60.6-4.4 88.1-12.3 2.6-.8 5.2-1.2 7.9-1.2 5.2 0 9.9 1.6 14.3 4.1l59.1 34c1.7 1 3.3 1.7 5.2 1.7a9 9 0 006.4-2.6 9 9 0 002.6-6.4c0-2.2-.9-4.4-1.4-6.6-.3-1.2-7.6-28.3-12.2-45.3-.5-1.9-.9-3.8-.9-5.7.1-5.9 3.1-11.2 7.6-14.5zM600.2 587.2c-19.9 0-36-16.1-36-35.9 0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9c0 19.8-16.2 35.9-36 35.9zm179.9 0c-19.9 0-36-16.1-36-35.9 0-19.8 16.1-35.9 36-35.9s36 16.1 36 35.9a36.08 36.08 0 01-36 35.9z'
  const fill = iconName === 'chrome' ? '#5193FB' : '#0DCB19'

  return [
    `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 1024 1024" fill="none">`,
    `<path d="${pathData}" fill="${fill}" />`,
    '</svg>',
  ].join('')
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
