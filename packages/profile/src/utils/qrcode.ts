import type { Options as BoxenOptions } from 'boxen'
import type { QRCodeToStringOptions } from 'qrcode'
import type { Colorizer } from '../theme'
import process from 'node:process'
import readline from 'node:readline'
import boxen from 'boxen'
import QRCode from 'qrcode'
import { isUnicodeSupported } from '../support'
import { profileTheme } from '../theme'
import { sleep } from './shared'

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

export async function generateQrcode(input: string) {
  const cached = qrcodeCache.get(input)
  if (cached) {
    return cached
  }

  const generated = await QRCode.toString(input, qrRuntimeOptions as QRCodeToStringOptions)
  qrcodeCache.set(input, generated)
  return generated
}

export function renderQrcodeBox(qrcode: string, options: BoxenOptions = {}) {
  return boxen(qrcode, {
    borderStyle: 'round',
    padding: 1,
    margin: 1,
    ...options,
  })
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

export interface QrcodeAnimationOptions {
  frameDelay?: number
  settleDelay?: number
  highlightColor?: Colorizer
  baseColor?: Colorizer
  boxenOptions?: BoxenOptions
}

export async function animateQrcodeBox(qrcode: string, options: QrcodeAnimationOptions = {}) {
  const stream = process.stdout
  const frameDelay = options.frameDelay ?? 24
  const settleDelay = options.settleDelay ?? 150
  const highlightColor = options.highlightColor ?? profileTheme.colors.qrcode.highlight
  const baseColor = options.baseColor ?? profileTheme.colors.qrcode.base

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
