import type { Colorizer } from '../theme'
import process from 'node:process'
import boxen from 'boxen'
import { consoleLog as log } from '../logger'
import { profileTheme } from '../theme'
import { splitGraphemes, typeWriterLines } from './typewriter'

function applyPalette(text: string, palette: Colorizer[]) {
  if (!palette.length) {
    return text
  }
  const chars = splitGraphemes(text)
  return chars
    .map((char, index) => {
      const colorize = palette[index % palette.length]
      return colorize(char)
    })
    .join('')
}

export interface HeroBannerOptions {
  title: string
  subtitle?: string
  tagline?: string[]
  accent?: string
  accentColor?: Colorizer
  taglineColor?: Colorizer | null
  subtitleColor?: Colorizer
  palette?: Colorizer[]
  borderColor?: string
}

export async function displayHeroBanner(options: HeroBannerOptions) {
  const theme = profileTheme
  const palette = options.palette ?? theme.colors.hero.palette
  const title = applyPalette(options.title, palette)
  const subtitleColorizer = options.subtitleColor ?? theme.colors.hero.subtitle
  const subtitle = options.subtitle ? subtitleColorizer(options.subtitle) : undefined
  const accentColorizer = options.accentColor ?? theme.colors.hero.accent
  const accent = options.accent ? accentColorizer(options.accent) : undefined
  const taglineColorizer = options.taglineColor === null ? undefined : options.taglineColor ?? theme.colors.hero.tagline
  const bodyLines = options.tagline?.map(line => (taglineColorizer ? taglineColorizer(line) : line)) ?? []

  const bannerContent = [title]
  if (subtitle) {
    bannerContent.push(subtitle)
  }
  if (accent) {
    bannerContent.push(accent)
  }
  if (bodyLines.length) {
    bannerContent.push('', ...bodyLines)
  }

  const boxed = boxen(bannerContent.join('\n'), {
    borderStyle: 'double',
    padding: { top: 1, bottom: 1, left: 3, right: 3 },
    margin: 1,
    borderColor: options.borderColor ?? theme.colors.hero.borderColor,
  })

  if (!process.stdout.isTTY) {
    log(boxed)
    return
  }

  const bannerLines = boxed.split('\n')
  await typeWriterLines(bannerLines, 2, 10, 1)
}
