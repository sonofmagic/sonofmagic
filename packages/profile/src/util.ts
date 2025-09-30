import type { Options as BoxenOptions } from 'boxen'
import type { QRCodeToStringOptions } from 'qrcode'
import process from 'node:process'
import readline from 'node:readline'
import ansis from 'ansis'
import boxen from 'boxen'
import dayjs from 'dayjs'
import * as emoji from 'node-emoji'
import prompts from 'prompts'
import QRCode from 'qrcode'
import { isUnicodeSupported } from './support'

const unicodeSupported = isUnicodeSupported()
const qrcodeCache = new Map<string, string>()
const qrBaseOptions: QRCodeToStringOptions = {
  type: 'terminal',
  errorCorrectionLevel: 'L',
  version: 3,
  scale: 1,
}
const qrRuntimeOptions: QRCodeToStringOptions & { small: boolean } = {
  ...qrBaseOptions,
  small: unicodeSupported,
}

async function generateQrcode(input: string) {
  const cached = qrcodeCache.get(input)
  if (cached) {
    return cached
  }

  const generated = await QRCode.toString(input, qrRuntimeOptions as QRCodeToStringOptions)
  qrcodeCache.set(input, generated)
  return generated
}
// https://github.com/airbnb/javascript
export function isPrimitivesType(value: unknown) {
  return (
    typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
    || value === null
    || value === undefined
    || typeof value === 'symbol'
    || typeof value === 'bigint'
  )
}

export function isComplexType(value: unknown) {
  // 不用 instance of 因为原型链
  return !isPrimitivesType(value) && (typeof value === 'object' || typeof value === 'function' || Array.isArray(value))
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 使用 Intl.Segmenter 按“用户可见字符”分割（支持 emoji）
const segmenter
  = typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('en', { granularity: 'grapheme' })
    : null

function splitGraphemes(text: string): string[] {
  if (!segmenter) {
    return Array.from(text)
  }
  return Array.from(segmenter.segment(text), seg => seg.segment)
}

async function typeWriter(text: string, speed: number = 30, randomSeed = 5): Promise<void> {
  const chars = splitGraphemes(text)
  if (!chars.length) {
    process.stdout.write('\n')
    return
  }

  const baseDelay = Math.max(0, speed)
  const jitter = Math.max(0, randomSeed)

  if (baseDelay === 0 && jitter === 0) {
    process.stdout.write(`${text}\n`)
    return
  }

  const chunkSize = baseDelay > 0
    ? Math.max(1, Math.floor(12 / baseDelay))
    : Math.min(32, chars.length)

  let index = 0
  let buffer = ''

  while (index < chars.length) {
    buffer += chars[index]
    index++

    const reachedChunkBoundary = index % chunkSize === 0 || index === chars.length
    if (reachedChunkBoundary) {
      process.stdout.write(buffer)
      buffer = ''

      if (index < chars.length) {
        const delay = baseDelay + Math.random() * jitter
        if (delay > 0) {
          await sleep(delay)
        }
      }
    }
  }

  process.stdout.write('\n')
}

export async function typeWriterLines(
  lines: string[],
  speed: number = 30,
  lineDelay: number = 200,
  randomSeed = 5,
): Promise<void> {
  for (const line of lines) {
    await typeWriter(line, speed, randomSeed)
    if (lineDelay > 0) {
      await sleep(lineDelay)
    }
  }
}

type Colorizer = (value: string) => string

export interface QrcodeAnimationOptions {
  frameDelay?: number
  settleDelay?: number
  highlightColor?: Colorizer
  baseColor?: Colorizer
  boxenOptions?: BoxenOptions
}

export function renderQrcodeBox(qrcode: string, options: BoxenOptions = {}) {
  return boxen(qrcode, {
    borderStyle: 'round',
    padding: 1,
    margin: 1,
    ...options,
  })
}

export async function animateQrcodeBox(qrcode: string, options: QrcodeAnimationOptions = {}) {
  const stream = process.stdout
  const frameDelay = options.frameDelay ?? 24
  const settleDelay = options.settleDelay ?? 150
  const highlightColor = options.highlightColor ?? ansis.greenBright
  const baseColor = options.baseColor ?? ((value: string) => ansis.green(value))

  const boxed = renderQrcodeBox(qrcode, options.boxenOptions)
  const lines = boxed.split('\n')

  if (!stream.isTTY) {
    stream.write(`\n${boxed}\n`)
    return
  }

  stream.write('\n')

  const topIndex = 0
  const bottomIndex = lines.length - 1
  const interiorStart = Math.max(1, topIndex + 1)
  const interiorEnd = Math.max(interiorStart, bottomIndex - 1)

  const frames: string[][] = []

  for (let row = interiorStart; row <= interiorEnd; row++) {
    frames.push(
      lines.map((line, idx) => {
        if (idx === topIndex || idx === bottomIndex) {
          return highlightColor(line)
        }
        return idx === row ? highlightColor(line) : baseColor(line)
      }),
    )
  }

  frames.push(lines.map(line => highlightColor(line)))

  let previousLineCount = 0

  for (const frame of frames) {
    previousLineCount = renderAnimatedFrame(stream, frame, previousLineCount)
    await sleep(frameDelay)
  }

  if (settleDelay > 0) {
    await sleep(settleDelay)
  }
}

function renderAnimatedFrame(stream: NodeJS.WriteStream, frameLines: string[], previousLineCount: number) {
  if (!stream.isTTY) {
    stream.write(`${frameLines.join('\n')}\n`)
    return frameLines.length
  }

  if (previousLineCount > 0) {
    readline.moveCursor(stream, 0, -previousLineCount)
    readline.cursorTo(stream, 0)
    readline.clearScreenDown(stream)
  }

  stream.write(frameLines.join('\n'))
  stream.write('\n')
  return frameLines.length
}

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
}

export async function displayHeroBanner(options: HeroBannerOptions) {
  const palette: Colorizer[] = [
    ansis.magentaBright.bold,
    ansis.blueBright.bold,
    ansis.cyanBright.bold,
    ansis.greenBright.bold,
  ]

  const title = applyPalette(options.title, palette)
  const subtitleColorizer = options.subtitleColor ?? ansis.bold.white
  const subtitle = options.subtitle ? subtitleColorizer(options.subtitle) : undefined
  const accentColorizer = options.accentColor ?? ansis.yellowBright
  const accent = options.accent ? accentColorizer(options.accent) : undefined
  const taglineColorizer = options.taglineColor === null ? undefined : options.taglineColor ?? ansis.dim
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
    borderColor: 'cyan',
  })

  if (!process.stdout.isTTY) {
    console.log(boxed)
    return
  }

  const bannerLines = boxed.split('\n')
  await typeWriterLines(bannerLines, 2, 10, 1)
}

function splitParagraphByLines(text: string, linesPerGroup = 5) {
  // 先把段落按行切分
  const lines = text.split('\n')
  const result = []

  for (let i = 0; i < lines.length; i += linesPerGroup) {
    // 每5行合并成一个字符串
    const group = lines.slice(i, i + linesPerGroup).join('\n')
    result.push(group)
  }

  return result
}

export { ansis, boxen, dayjs, emoji, generateQrcode, prompts, splitParagraphByLines }
