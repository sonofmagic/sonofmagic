import process from 'node:process'
import { sleep } from './shared'

// 使用 Intl.Segmenter 按“用户可见字符”分割（支持 emoji）
const segmenter
  = typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('en', { granularity: 'grapheme' })
    : null

export function splitGraphemes(text: string): string[] {
  if (!segmenter) {
    return Array.from(text)
  }
  return Array.from(segmenter.segment(text), seg => seg.segment)
}

export async function typeWriter(text: string, speed: number = 30, randomSeed = 5): Promise<void> {
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
