import { createQrCodeSvg } from '../qr/svg'
import { renderInlineIcon, resolveIconName } from '../shared/icons'
import { escapeXml, formatNumber } from '../shared/svg'
import type { ContactPanelEntry } from '../types'

export function renderContactPanelCell(
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
    '<g>',
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
