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
