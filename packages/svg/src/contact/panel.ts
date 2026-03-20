import { createQrCodeSvg } from '../qr/svg'
import { hashCode } from '../shared/svg'
import type { ContactPanelSvgOptions } from '../types'
import { createCenterSignalAccents, createPanelOrbitAccents } from './panel-accents'
import { renderPanelBackdrop, renderPanelDefs } from './panel-background'
import { renderContactPanelCell } from './panel-cell'

const CONTACT_PANEL_DEFAULTS = {
  width: 1280,
  height: 360,
} satisfies Required<Omit<ContactPanelSvgOptions, 'entries'>>

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
    renderPanelDefs({
      id,
      width,
      height,
      dividerX,
      leftX,
      rightX,
      cardWidth,
      cardHeight,
      cardY,
    }),
    renderPanelBackdrop({
      id,
      width,
      height,
      isBanner,
      dividerX,
      leftX,
      rightX,
      cardWidth,
      cardHeight,
      cardY,
    }),
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
