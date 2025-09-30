import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline'
import { assetPaths } from '../constants'
import { Dic, t } from '../i18n'
import { ansis, sleep, splitParagraphByLines } from '../util'

const log = console.log
const defaultPhotoDir = assetPaths.photosDir
const photoCache = new Map<string, string>()

interface PhotoGalleryOptions {
  photoDir?: string
}

export async function showPhotoGallery(options: PhotoGalleryOptions = {}) {
  const photoDir = options.photoDir ?? defaultPhotoDir
  const total = await countPhotos(photoDir)

  if (total <= 0) {
    console.warn('No photos available.')
    return
  }

  let index = 0
  let loading = false

  const render = async (nextIndex: number) => {
    loading = true
    index = normalizePhotoIndex(nextIndex, total)
    await renderPhoto(index, photoDir, total)
    loading = false
  }

  await render(index)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  readline.emitKeypressEvents(process.stdin, rl)
  const restoreRawMode = enableRawMode(process.stdin)

  const handleKeypress = async (_: string, key?: readline.Key) => {
    if (loading || !key) {
      return
    }

    if (key.name === 'right' || key.name === 'down') {
      await render(index + 1)
    }
    else if (key.name === 'left' || key.name === 'up') {
      await render(index - 1)
    }
    else if (key.ctrl && key.name === 'c') {
      rl.close()
    }
  }

  process.stdin.on('keypress', handleKeypress)

  return new Promise<void>((resolve) => {
    rl.on('close', () => {
      process.stdin.off('keypress', handleKeypress)
      restoreRawMode()
      resolve()
    })
  })
}

async function countPhotos(photoDir: string) {
  try {
    const entries = await fs.readdir(photoDir)
    return entries.filter(name => name.endsWith('.txt')).length
  }
  catch {
    return 0
  }
}

async function renderPhoto(index: number, photoDir: string, total: number) {
  const photo = await loadPhoto(index, photoDir, total)
  log('\n')

  for (const rows of splitParagraphByLines(photo)) {
    log(rows)
    await sleep(100)
  }

  log(
    `\n${t(Dic.page)}: ${index + 1}/${total} ${t(Dic.prev)}: ${ansis.bold.greenBright('← ↑')} ${t(
      Dic.next,
    )}: ${ansis.bold.greenBright('→ ↓')} ${t(Dic.exit)}: ${ansis.bold.greenBright('ctrl + c')}`,
  )
}

async function loadPhoto(index: number, photoDir: string, total: number) {
  const normalized = normalizePhotoIndex(index, total)
  const photoPath = buildPhotoPath(photoDir, normalized)
  const cached = photoCache.get(photoPath)
  if (cached) {
    return cached
  }

  const content = await fs.readFile(photoPath, { encoding: 'utf-8' })
  photoCache.set(photoPath, content)
  return content
}

function buildPhotoPath(photoDir: string, index: number) {
  return path.join(photoDir, `${index}.txt`)
}

function normalizePhotoIndex(index: number, total: number) {
  const normalized = index % total
  return normalized < 0 ? normalized + total : normalized
}

function enableRawMode(stream: NodeJS.ReadStream) {
  const canToggle = Boolean(stream.isTTY && typeof stream.setRawMode === 'function')
  if (!canToggle) {
    return () => {}
  }

  const previous = stream.isRaw
  stream.setRawMode(true)
  return () => {
    stream.setRawMode(Boolean(previous))
  }
}

/** @internal */
export const photoGalleryInternal = {
  normalizePhotoIndex,
  buildPhotoPath,
}
