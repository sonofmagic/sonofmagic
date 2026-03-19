export interface BannerOptions {
  dateLabel?: string
  text?: string
}

const DEFAULT_TEXT = 'ICEBREAKER'

const BANNER_FONT: Record<string, string[]> = {
  A: [' ### ', '#   #', '#####', '#   #', '#   #'],
  B: ['#### ', '#   #', '#### ', '#   #', '#### '],
  C: [' ####', '#    ', '#    ', '#    ', ' ####'],
  D: ['#### ', '#   #', '#   #', '#   #', '#### '],
  E: ['#####', '#    ', '#### ', '#    ', '#####'],
  I: ['#####', '  #  ', '  #  ', '  #  ', '#####'],
  K: ['#   #', '#  # ', '###  ', '#  # ', '#   #'],
  P: ['#### ', '#   #', '#### ', '#    ', '#    '],
  R: ['#### ', '#   #', '#### ', '#  # ', '#   #'],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#   #', '#   #', '#   #', '#   #', ' ### '],
}

export function renderBannerText(text: string) {
  const rows = Array.from({ length: 5 }).fill([] as string[])
  for (const rawChar of text.toUpperCase()) {
    const glyph = BANNER_FONT[rawChar] ?? BANNER_FONT.E
    for (const [index, row] of glyph.entries()) {
      rows[index].push(row)
    }
  }
  return rows.map(row => row.join('  '))
}

export function centerText(value: string, width: number) {
  const totalPadding = Math.max(width - value.length, 0)
  const leftPadding = Math.floor(totalPadding / 2)
  const rightPadding = totalPadding - leftPadding
  return `${' '.repeat(leftPadding)}${value}${' '.repeat(rightPadding)}`
}

export function buildProfileBanner(date: string, options: BannerOptions = {}) {
  const title = renderBannerText(options.text ?? DEFAULT_TEXT)
  const footer = options.dateLabel ?? `updated ${date}`
  const innerWidth = Math.max(...title.map(line => line.length), footer.length)
  const emptyLine = `| ${''.padEnd(innerWidth)} |`

  return [
    `+${'-'.repeat(innerWidth + 2)}+`,
    ...title.map(line => `| ${line.padEnd(innerWidth)} |`),
    emptyLine,
    `| ${centerText(footer, innerWidth)} |`,
    `+${'-'.repeat(innerWidth + 2)}+`,
  ].join('\n')
}
