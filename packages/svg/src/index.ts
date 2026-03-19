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

const DEFAULTS = {
  width: 1280,
  height: 360,
  title: 'ICEBREAKER',
  subtitle: 'Build systems, mini-program workflows, and profile-grade interfaces.',
  badge: {
    text: 'Github Profile Hero',
    color: '#FFD166',
  },
} satisfies Required<HeroSvgOptions>

export function createHeroSvg(options: HeroSvgOptions = {}) {
  const width = options.width ?? DEFAULTS.width
  const height = options.height ?? DEFAULTS.height
  const title = escapeXml(options.title ?? DEFAULTS.title)
  const subtitle = escapeXml(options.subtitle ?? DEFAULTS.subtitle)
  const badge = {
    text: escapeXml(options.badge?.text ?? DEFAULTS.badge.text),
    color: options.badge?.color ?? DEFAULTS.badge.color,
  }

  const id = `hero-${Math.abs(hashCode(`${width}-${height}-${title}-${subtitle}-${badge.text}`))}`
  const gridPath = buildGridPath(width, height, 48)
  const accents = createAccentShapes(width, height, id)
  const badgeWidth = estimateBadgeWidth(badge.text)

  return [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-title ${id}-desc">`,
    `<title id="${id}-title">${title}</title>`,
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
    `<text x="72" y="${height * 0.56}" fill="#F8FAFC" font-family="'Space Grotesk', 'Avenir Next', sans-serif" font-size="56" font-weight="700" letter-spacing="4">${title}</text>`,
    `<text x="74" y="${height * 0.56 + 2}" fill="rgba(43,255,207,0.2)" font-family="'Space Grotesk', 'Avenir Next', sans-serif" font-size="56" font-weight="700" letter-spacing="4">${title}<animate attributeName="opacity" values="0.18;0.4;0.18" dur="3.2s" repeatCount="indefinite" /></text>`,
    `<text x="72" y="${height * 0.69}" fill="rgba(226,232,240,0.92)" font-family="'IBM Plex Sans', 'Segoe UI', sans-serif" font-size="24">${subtitle}</text>`,
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
