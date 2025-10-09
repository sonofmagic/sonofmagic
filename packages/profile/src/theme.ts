import process from 'node:process'
import ansis from 'ansis'

export type TerminalThemeMode = 'light' | 'dark'
export type Colorizer = (value: string) => string

interface MenuPalette {
  border: string
  header: Colorizer
  body: Colorizer
}

interface HeroColors {
  palette: Colorizer[]
  subtitle: Colorizer
  accent: Colorizer
  tagline?: Colorizer
  borderColor: string
}

interface QrcodeColors {
  highlight: Colorizer
  base: Colorizer
}

interface MenuColors {
  headingPrefix: Colorizer
  body: Colorizer
  palettes: MenuPalette[]
}

export interface ProfileTheme {
  mode: TerminalThemeMode
  colors: {
    primary: Colorizer
    primaryStrong: Colorizer
    primaryUnderline: Colorizer
    accent: Colorizer
    accentStrong: Colorizer
    secondary: Colorizer
    secondaryStrong: Colorizer
    prompt: Colorizer
    success: Colorizer
    successStrong: Colorizer
    heading: Colorizer
    arrowHint: Colorizer
    link: Colorizer
    hero: HeroColors
    qrcode: QrcodeColors
    menu: MenuColors
  }
}

function detectThemeFromEnv(): TerminalThemeMode | null {
  const envKeys = [
    'ICEBREAKER_PROFILE_THEME',
    'ICEBREAKER_PROFILE_MODE',
    'PROFILE_THEME',
    'TERMINAL_THEME',
  ]

  for (const key of envKeys) {
    const value = process.env[key]
    if (!value) {
      continue
    }

    const normalized = value.trim().toLowerCase()
    if (['light', 'lightmode', 'light-mode', 'bright'].includes(normalized)) {
      return 'light'
    }
    if (['dark', 'darkmode', 'dark-mode', 'dim'].includes(normalized)) {
      return 'dark'
    }
  }

  return null
}

function classifyColorCode(code: number): TerminalThemeMode | null {
  if (Number.isNaN(code)) {
    return null
  }

  if (code >= 0 && code <= 15) {
    return code >= 7 ? 'light' : 'dark'
  }

  if (code >= 16 && code <= 231) {
    const normalized = code - 16
    const blue = normalized % 6
    const green = Math.floor(normalized / 6) % 6
    const red = Math.floor(normalized / 36) % 6
    const brightness = (red + green + blue) / 3
    return brightness >= 3 ? 'light' : 'dark'
  }

  if (code >= 232 && code <= 255) {
    const intensity = code - 232
    return intensity >= 12 ? 'light' : 'dark'
  }

  return null
}

function detectThemeFromColorFgbg(): TerminalThemeMode | null {
  const value = process.env.COLORFGBG
  if (!value) {
    return null
  }

  const parts = value
    .split(/[:;]/)
    .map(part => Number.parseInt(part, 10))
    .filter(part => Number.isInteger(part))

  if (!parts.length) {
    return null
  }

  const backgroundCandidate = parts[parts.length - 1]
  const detected = classifyColorCode(backgroundCandidate)
  if (detected) {
    return detected
  }

  if (parts.length >= 2) {
    return classifyColorCode(parts[1])
  }

  return null
}

function detectTerminalTheme(): TerminalThemeMode {
  return (
    detectThemeFromEnv()
    ?? detectThemeFromColorFgbg()
    ?? 'dark'
  )
}

function createDarkTheme(): ProfileTheme {
  return {
    mode: 'dark',
    colors: {
      primary: ansis.greenBright,
      primaryStrong: ansis.bold.greenBright,
      primaryUnderline: ansis.greenBright.underline,
      accent: ansis.yellowBright,
      accentStrong: ansis.bold.yellowBright,
      secondary: ansis.blueBright,
      secondaryStrong: ansis.bold.blueBright,
      prompt: ansis.greenBright,
      success: ansis.green,
      successStrong: ansis.greenBright.bold,
      heading: ansis.bold.greenBright,
      arrowHint: ansis.bold.greenBright,
      link: ansis.greenBright.underline,
      hero: {
        palette: [
          ansis.magentaBright.bold,
          ansis.blueBright.bold,
          ansis.cyanBright.bold,
          ansis.greenBright.bold,
        ],
        subtitle: ansis.bold.whiteBright,
        accent: ansis.bold.yellowBright,
        tagline: ansis.dim,
        borderColor: 'cyan',
      },
      qrcode: {
        highlight: ansis.greenBright,
        base: value => ansis.green(value),
      },
      menu: {
        headingPrefix: ansis.bold.greenBright,
        body: ansis.white,
        palettes: [
          { border: 'cyan', header: ansis.cyanBright.bold, body: ansis.whiteBright },
          { border: 'magenta', header: ansis.magentaBright.bold, body: ansis.white },
          { border: 'blue', header: ansis.blueBright.bold, body: ansis.white },
          { border: 'green', header: ansis.greenBright.bold, body: ansis.white },
          { border: 'yellow', header: ansis.yellowBright.bold, body: ansis.white },
          { border: 'red', header: ansis.redBright.bold, body: ansis.white },
        ],
      },
    },
  }
}

function createLightTheme(): ProfileTheme {
  return {
    mode: 'light',
    colors: {
      primary: ansis.green,
      primaryStrong: ansis.bold.green,
      primaryUnderline: ansis.green.underline,
      accent: ansis.blue,
      accentStrong: ansis.bold.blue,
      secondary: ansis.blue,
      secondaryStrong: ansis.bold.blue,
      prompt: ansis.green,
      success: ansis.green,
      successStrong: ansis.bold.green,
      heading: ansis.bold.green,
      arrowHint: ansis.bold.green,
      link: ansis.green.underline,
      hero: {
        palette: [
          ansis.magenta.bold,
          ansis.blue.bold,
          ansis.cyan.bold,
          ansis.green.bold,
        ],
        subtitle: ansis.bold.black,
        accent: ansis.bold.blue,
        tagline: value => ansis.black(value),
        borderColor: 'blue',
      },
      qrcode: {
        highlight: ansis.bold.green,
        base: ansis.green,
      },
      menu: {
        headingPrefix: ansis.bold.green,
        body: ansis.black,
        palettes: [
          { border: 'blue', header: ansis.blue.bold, body: ansis.black },
          { border: 'magenta', header: ansis.magenta.bold, body: ansis.black },
          { border: 'cyan', header: ansis.cyan.bold, body: ansis.black },
          { border: 'green', header: ansis.green.bold, body: ansis.black },
          { border: 'yellow', header: ansis.yellow.bold, body: ansis.black },
          { border: 'red', header: ansis.red.bold, body: ansis.black },
        ],
      },
    },
  }
}

let cachedTheme: ProfileTheme | null = null

export function getProfileTheme(): ProfileTheme {
  if (!cachedTheme) {
    const mode = detectTerminalTheme()
    cachedTheme = mode === 'light' ? createLightTheme() : createDarkTheme()
  }
  return cachedTheme
}

export const profileTheme = getProfileTheme()
export const isLightTheme = profileTheme.mode === 'light'
