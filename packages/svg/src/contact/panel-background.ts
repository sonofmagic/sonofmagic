import { buildGridPath, formatNumber } from '../shared/svg'

export function renderPanelDefs(options: {
  id: string
  width: number
  height: number
  dividerX: number
  leftX: number
  rightX: number
  cardWidth: number
  cardHeight: number
  cardY: number
}) {
  const { id, width, height, dividerX, leftX, rightX, cardWidth, cardHeight, cardY } = options

  return [
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
  ].join('')
}

export function renderPanelBackdrop(options: {
  id: string
  width: number
  height: number
  isBanner: boolean
  dividerX: number
  leftX: number
  rightX: number
  cardWidth: number
  cardHeight: number
  cardY: number
}) {
  const { id, width, height, isBanner, dividerX, leftX, rightX, cardWidth, cardHeight, cardY } = options

  return [
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
      ? `<circle cx="${dividerX}" cy="${Math.round(height / 2)}" r="5" fill="#C7FBFF" filter="url(#${id}-edge-glow)"><animate attributeName="opacity" values="0.56;1;0.56" dur="2.6s" repeatCount="indefinite" /></circle>`
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
  ].join('')
}
