import { formatNumber } from '../shared/svg'

export function createPanelOrbitAccents(options: {
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
  const { cardX, cardY, cardWidth, cardHeight, qrSide, color, secondaryColor, id, compact } = options
  const orbitWidth = compact ? 54 : 76
  const orbitHeight = compact ? 102 : 154
  const orbitX = qrSide === 'left'
    ? cardX - (compact ? 10 : 22)
    : cardX + cardWidth - orbitWidth + (compact ? 10 : 22)
  const orbitY = cardY + cardHeight * (compact ? 0.28 : 0.24)
  const satelliteX = qrSide === 'left' ? orbitX + orbitWidth - 8 : orbitX + 8
  const pathA = buildOrbitLoopPath(orbitX, orbitY, orbitWidth, orbitHeight, qrSide === 'left')
  const pathB = buildOrbitLoopPath(orbitX + (compact ? 6 : 10), orbitY + (compact ? 10 : 14), orbitWidth - (compact ? 12 : 20), orbitHeight - (compact ? 20 : 28), qrSide !== 'left')

  return [
    [
      `<path d="${pathA}" fill="none" stroke="${color}" stroke-width="${compact ? 1.8 : 2.4}" stroke-linecap="round" stroke-dasharray="${compact ? '10 16' : '16 24'}" opacity="0.72">`,
      '<animate attributeName="stroke-dashoffset" values="0;-64" dur="3.4s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.42;0.7;0.42" dur="3.6s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<path d="${pathB}" fill="none" stroke="${secondaryColor}" stroke-width="${compact ? 1.2 : 1.6}" stroke-linecap="round" stroke-dasharray="${compact ? '6 14' : '10 18'}" opacity="0.64">`,
      '<animate attributeName="stroke-dashoffset" values="0;52" dur="4.2s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.34;0.58;0.34" dur="4.6s" repeatCount="indefinite" />',
      '</path>',
    ].join(''),
    [
      `<circle cx="${formatNumber(satelliteX)}" cy="${formatNumber(orbitY + orbitHeight * 0.26)}" r="${compact ? 3.2 : 4.8}" fill="${secondaryColor}" filter="url(#${id.split('-orbit-')[0]}-edge-glow)">`,
      `<animateMotion dur="${compact ? '5.2s' : '6s'}" repeatCount="indefinite" rotate="auto" path="${pathA}" />`,
      '<animate attributeName="opacity" values="0.6;0.92;0.6" dur="2.2s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${formatNumber(satelliteX)}" cy="${formatNumber(orbitY + orbitHeight * 0.68)}" r="${compact ? 2.6 : 4}" fill="${color}" filter="url(#${id.split('-orbit-')[0]}-soft-glow)">`,
      `<animateMotion dur="${compact ? '6s' : '7.2s'}" repeatCount="indefinite" rotate="auto" path="${pathB}" />`,
      '<animate attributeName="opacity" values="0.48;0.86;0.48" dur="2.6s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
  ]
}

export function createCenterSignalAccents(options: {
  centerX: number
  centerY: number
  id: string
  compact: boolean
}) {
  const { centerX, centerY, id, compact } = options
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
      '<animate attributeName="opacity" values="0.38;0.62;0.38" dur="4.2s" repeatCount="indefinite" />',
      '</ellipse>',
    ].join(''),
    [
      `<ellipse cx="${centerX}" cy="${centerY}" rx="${innerRx}" ry="${innerRy}" fill="none" stroke="rgba(43,255,207,0.42)" stroke-width="${compact ? 1.6 : 2.2}" stroke-dasharray="${compact ? '8 12' : '10 16'}" opacity="0.84">`,
      '<animate attributeName="stroke-dashoffset" values="0;40" dur="3.4s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.46;0.74;0.46" dur="3.2s" repeatCount="indefinite" />',
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
      '<animate attributeName="r" values="7.6;9.6;7.6" dur="2.6s" repeatCount="indefinite" />',
      '<animate attributeName="opacity" values="0.64;0.94;0.64" dur="2.2s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${centerX}" cy="${centerY - ringRy + (compact ? 14 : 20)}" r="${compact ? 2.8 : 4}" fill="#FFD166">`,
      `<animateMotion dur="${compact ? '5.8s' : '6.8s'}" repeatCount="indefinite" rotate="auto" path="${buildClosedEllipsePath(centerX, centerY, ringRx - (compact ? 8 : 12), ringRy - (compact ? 16 : 24))}" />`,
      '<animate attributeName="opacity" values="0.52;0.86;0.52" dur="2.4s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
    [
      `<circle cx="${centerX}" cy="${centerY + ringRy - (compact ? 14 : 20)}" r="${compact ? 2.4 : 3.6}" fill="#60A5FA">`,
      `<animateMotion dur="${compact ? '6.6s' : '7.8s'}" repeatCount="indefinite" rotate="auto" path="${buildClosedEllipsePath(centerX, centerY, innerRx + (compact ? 2 : 4), innerRy + (compact ? 10 : 16))}" />`,
      '<animate attributeName="opacity" values="0.46;0.78;0.46" dur="2.8s" repeatCount="indefinite" />',
      '</circle>',
    ].join(''),
  ]
}

function buildOrbitLoopPath(x: number, y: number, width: number, height: number, bendLeft: boolean) {
  const startX = bendLeft ? x + width : x
  const controlAX = bendLeft ? x - width * 0.36 : x + width * 1.36
  const controlBX = bendLeft ? x + width * 1.18 : x - width * 0.18
  const endX = bendLeft ? x + width * 0.4 : x + width * 0.6
  const returnAX = bendLeft ? x + width * 1.14 : x - width * 0.14
  const returnBX = bendLeft ? x - width * 0.28 : x + width * 1.28

  return [
    `M ${formatNumber(startX)} ${formatNumber(y)}`,
    `C ${formatNumber(controlAX)} ${formatNumber(y + height * 0.12)}, ${formatNumber(controlBX)} ${formatNumber(y + height * 0.54)}, ${formatNumber(endX)} ${formatNumber(y + height)}`,
    `C ${formatNumber(returnAX)} ${formatNumber(y + height * 0.78)}, ${formatNumber(returnBX)} ${formatNumber(y + height * 0.24)}, ${formatNumber(startX)} ${formatNumber(y)}`,
    'Z',
  ].join(' ')
}

function buildClosedEllipsePath(cx: number, cy: number, rx: number, ry: number) {
  return [
    `M ${formatNumber(cx + rx)} ${formatNumber(cy)}`,
    `A ${formatNumber(rx)} ${formatNumber(ry)} 0 1 1 ${formatNumber(cx - rx)} ${formatNumber(cy)}`,
    `A ${formatNumber(rx)} ${formatNumber(ry)} 0 1 1 ${formatNumber(cx + rx)} ${formatNumber(cy)}`,
    'Z',
  ].join(' ')
}
