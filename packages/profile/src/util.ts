import type { QRCodeToStringOptions } from 'qrcode'
import process from 'node:process'
import ansis from 'ansis'
import boxen from 'boxen'
import dayjs from 'dayjs'
// import _Graphemer from 'graphemer'
import * as emoji from 'node-emoji'
import prompts from 'prompts'
import QRCode from 'qrcode'
import { isUnicodeSupported } from './support'

export function _interopDefaultCompat(e: any) {
  return e && typeof e === 'object' && 'default' in e ? e.default : e
}

// const Graphemer = _interopDefaultCompat(_Graphemer)

// const splitter = new Graphemer()
async function generateQrcode(input: string) {
  const opt: QRCodeToStringOptions & { small: boolean } = {
    type: 'terminal',
    errorCorrectionLevel: 'L',
    version: 3,
    scale: 1,
    small: isUnicodeSupported(),
  }
  const str = await QRCode.toString(input, opt as QRCodeToStringOptions)
  return str
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 使用 Intl.Segmenter 按“用户可见字符”分割（支持 emoji）
function splitGraphemes(text: string): string[] {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
  return Array.from(segmenter.segment(text), seg => seg.segment)
}

async function typeWriter(text: string, speed: number = 30): Promise<void> {
  const chars = splitGraphemes(text)
  for (let i = 0; i < chars.length; i++) {
    process.stdout.write(chars[i])
    await sleep(speed + Math.random() * 20) // 更真实打字节奏
  }
  process.stdout.write('\n')
}

export async function typeWriterLines(
  lines: string[],
  speed: number = 30,
  lineDelay: number = 300,
): Promise<void> {
  for (const line of lines) {
    await typeWriter(line, speed)
    await sleep(lineDelay)
  }
}

export { ansis, boxen, dayjs, emoji, generateQrcode, prompts }
