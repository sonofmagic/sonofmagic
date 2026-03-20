import { Buffer } from 'node:buffer'
import { createCodewords, pickVersion } from './encoding'
import { buildMatrix } from './matrix'
import type { EcLevel, QrMatrix } from './shared'

export type { QrMatrix } from './shared'

export function createQrMatrix(content: string, level: EcLevel = 'H'): QrMatrix {
  if (!content) {
    throw new Error('QR content is required')
  }

  const bytes = Uint8Array.from(Buffer.from(content, 'utf8'))
  const version = pickVersion(bytes.length, level)
  const codewords = createCodewords(bytes, version, level)
  const matrix = buildMatrix(codewords, version, level)

  return {
    mask: matrix.mask,
    modules: matrix.buffer.toBooleanMatrix(),
    size: matrix.buffer.size,
    version,
  }
}
