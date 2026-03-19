export interface BannerOptions {
  dateLabel?: string
  text?: string
}

const DEFAULT_TEXT = 'ICE BREAKER'
const WORD_SEPARATOR_RE = /\s+/

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
    if (rawChar === ' ') {
      for (const row of rows) {
        row.push('   ')
      }
      continue
    }
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

function buildStackedTitle(text: string) {
  const words = text.trim().split(WORD_SEPARATOR_RE).filter(Boolean)
  if (words.length > 1) {
    const rows: string[] = []
    for (const [index, word] of words.entries()) {
      rows.push(...renderBannerText(word))
      if (index < words.length - 1) {
        rows.push('')
      }
    }
    return rows
  }

  return renderBannerText(text)
}

export function buildProfileBanner(date: string, options: BannerOptions = {}) {
  const text = options.text ?? DEFAULT_TEXT
  const footer = options.dateLabel ?? `updated ${date}`
  const title = buildStackedTitle(text)
  const innerWidth = Math.max(...title.map(line => line.length), footer.length + 8)
  const divider = `| ${'-'.repeat(innerWidth)} |`

  return [
    `.${'-'.repeat(innerWidth + 2)}.`,
    ...title.map(line => `| ${centerText(line, innerWidth)} |`),
    divider,
    `| ${centerText(`:: ${footer} ::`, innerWidth)} |`,
    `'${'-'.repeat(innerWidth + 2)}'`,
  ].join('\n')
}
