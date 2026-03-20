import { EC_BLOCKS_TABLE, EC_CODEWORDS_TABLE, TOTAL_CODEWORDS } from './constants'

export interface QrMatrix {
  mask: number
  modules: boolean[][]
  size: number
  version: number
}

export type EcLevel = 'L' | 'M' | 'Q' | 'H'

export class QrBitBuffer {
  buffer: number[] = []
  length = 0

  put(value: number, length: number) {
    for (let bit = 0; bit < length; bit += 1) {
      this.putBit(((value >>> (length - bit - 1)) & 1) === 1)
    }
  }

  putBit(bit: boolean) {
    const index = Math.floor(this.length / 8)
    if (this.buffer.length <= index) {
      this.buffer.push(0)
    }

    if (bit) {
      const current = this.buffer[index] ?? 0
      this.buffer[index] = current | (0x80 >>> (this.length % 8))
    }

    this.length += 1
  }
}

export class QrMatrixBuffer {
  data: Uint8Array
  reserved: Uint8Array
  size: number

  constructor(size: number) {
    this.size = size
    this.data = new Uint8Array(size * size)
    this.reserved = new Uint8Array(size * size)
  }

  clone() {
    const next = new QrMatrixBuffer(this.size)
    next.data.set(this.data)
    next.reserved.set(this.reserved)
    return next
  }

  get(row: number, col: number) {
    return this.data[row * this.size + col] === 1
  }

  isReserved(row: number, col: number) {
    return this.reserved[row * this.size + col] === 1
  }

  set(row: number, col: number, value: boolean, reserved = false) {
    const index = row * this.size + col
    this.data[index] = value ? 1 : 0
    if (reserved) {
      this.reserved[index] = 1
    }
  }

  xor(row: number, col: number, value: boolean) {
    if (!value) {
      return
    }
    const index = row * this.size + col
    const current = this.data[index] ?? 0
    this.data[index] = current ^ 1
  }

  toBooleanMatrix() {
    const modules: boolean[][] = []
    for (let row = 0; row < this.size; row += 1) {
      const line: boolean[] = []
      for (let col = 0; col < this.size; col += 1) {
        line.push(this.get(row, col))
      }
      modules.push(line)
    }
    return modules
  }
}

export function getEcLevelIndex(level: EcLevel) {
  switch (level) {
    case 'L': return 0
    case 'M': return 1
    case 'Q': return 2
    case 'H': return 3
  }
}

export function getEcLevelBits(level: EcLevel) {
  switch (level) {
    case 'L': return 1
    case 'M': return 0
    case 'Q': return 3
    case 'H': return 2
  }
}

export function getSymbolSize(version: number) {
  return version * 4 + 17
}

export function getTotalCodewords(version: number) {
  const total = TOTAL_CODEWORDS[version]
  if (!total) {
    throw new Error(`Unsupported QR version: ${version}`)
  }
  return total
}

export function getEcBlocks(version: number, level: EcLevel) {
  return requireNumber(EC_BLOCKS_TABLE[(version - 1) * 4 + getEcLevelIndex(level)], 'ec block count')
}

export function getEcTotalCodewords(version: number, level: EcLevel) {
  return requireNumber(EC_CODEWORDS_TABLE[(version - 1) * 4 + getEcLevelIndex(level)], 'ec total codewords')
}

export function getByteCharCountBits(version: number) {
  if (version < 10) {
    return 8
  }
  if (version < 27) {
    return 16
  }
  return 16
}

export function getByteCapacity(version: number, level: EcLevel) {
  const dataBits = (getTotalCodewords(version) - getEcTotalCodewords(version, level)) * 8
  return Math.floor((dataBits - 4 - getByteCharCountBits(version)) / 8)
}

export function requireNumber(value: number | undefined, label: string) {
  if (typeof value !== 'number') {
    throw new TypeError(`Missing ${label}`)
  }
  return value
}
