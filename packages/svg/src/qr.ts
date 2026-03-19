import { Buffer } from 'node:buffer'

const BYTE_MODE_INDICATOR = 0b0100
const PAD_CODEWORDS = [0xEC, 0x11] as const
const VERSION_INFO_POLY = 0x1F25
const FORMAT_INFO_POLY = 0x537
const FORMAT_MASK = 0x5412

const TOTAL_CODEWORDS = [
  0,
  26,
  44,
  70,
  100,
  134,
  172,
  196,
  242,
  292,
  346,
  404,
  466,
  532,
  581,
  655,
  733,
  815,
  901,
  991,
  1085,
  1156,
  1258,
  1364,
  1474,
  1588,
  1706,
  1828,
  1921,
  2051,
  2185,
  2323,
  2465,
  2611,
  2761,
  2876,
  3034,
  3196,
  3362,
  3532,
  3706,
] as const

const EC_BLOCKS_TABLE = [
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  1,
  2,
  2,
  4,
  1,
  2,
  4,
  4,
  2,
  4,
  4,
  4,
  2,
  4,
  6,
  5,
  2,
  4,
  6,
  6,
  2,
  5,
  8,
  8,
  4,
  5,
  8,
  8,
  4,
  5,
  8,
  11,
  4,
  8,
  10,
  11,
  4,
  9,
  12,
  16,
  4,
  9,
  16,
  16,
  6,
  10,
  12,
  18,
  6,
  10,
  17,
  16,
  6,
  11,
  16,
  19,
  6,
  13,
  18,
  21,
  7,
  14,
  21,
  25,
  8,
  16,
  20,
  25,
  8,
  17,
  23,
  25,
  9,
  17,
  23,
  34,
  9,
  18,
  25,
  30,
  10,
  20,
  27,
  32,
  12,
  21,
  29,
  35,
  12,
  23,
  34,
  37,
  12,
  25,
  34,
  40,
  13,
  26,
  35,
  42,
  14,
  28,
  38,
  45,
  15,
  29,
  40,
  48,
  16,
  31,
  43,
  51,
  17,
  33,
  45,
  54,
  18,
  35,
  48,
  57,
  19,
  37,
  51,
  60,
  19,
  38,
  53,
  63,
  20,
  40,
  56,
  66,
  21,
  43,
  59,
  70,
  22,
  45,
  62,
  74,
  24,
  47,
  65,
  77,
  25,
  49,
  68,
  81,
] as const

const EC_CODEWORDS_TABLE = [
  7,
  10,
  13,
  17,
  10,
  16,
  22,
  28,
  15,
  26,
  36,
  44,
  20,
  36,
  52,
  64,
  26,
  48,
  72,
  88,
  36,
  64,
  96,
  112,
  40,
  72,
  108,
  130,
  48,
  88,
  132,
  156,
  60,
  110,
  160,
  192,
  72,
  130,
  192,
  224,
  80,
  150,
  224,
  264,
  96,
  176,
  260,
  308,
  104,
  198,
  288,
  352,
  120,
  216,
  320,
  384,
  132,
  240,
  360,
  432,
  144,
  280,
  408,
  480,
  168,
  308,
  448,
  532,
  180,
  338,
  504,
  588,
  196,
  364,
  546,
  650,
  224,
  416,
  600,
  700,
  224,
  442,
  644,
  750,
  252,
  476,
  690,
  816,
  270,
  504,
  750,
  900,
  300,
  560,
  810,
  960,
  312,
  588,
  870,
  1050,
  336,
  644,
  952,
  1110,
  360,
  700,
  1020,
  1200,
  390,
  728,
  1050,
  1260,
  420,
  784,
  1140,
  1350,
  450,
  812,
  1200,
  1440,
  480,
  868,
  1290,
  1530,
  510,
  924,
  1350,
  1620,
  540,
  980,
  1440,
  1710,
  570,
  1036,
  1530,
  1800,
  570,
  1064,
  1590,
  1890,
  600,
  1120,
  1680,
  1980,
  630,
  1204,
  1770,
  2100,
  660,
  1260,
  1860,
  2220,
  720,
  1316,
  1950,
  2310,
  750,
  1372,
  2040,
  2430,
] as const

const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)

initializeGaloisField()

export interface QrMatrix {
  mask: number
  modules: boolean[][]
  size: number
  version: number
}

type EcLevel = 'L' | 'M' | 'Q' | 'H'

class QrBitBuffer {
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

class QrMatrixBuffer {
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

function initializeGaloisField() {
  let value = 1
  for (let index = 0; index < 255; index += 1) {
    GF_EXP[index] = value
    GF_LOG[value] = index
    value <<= 1
    if (value & 0x100) {
      value ^= 0x11D
    }
  }

  for (let index = 255; index < 512; index += 1) {
    GF_EXP[index] = GF_EXP[index - 255] ?? 0
  }
}

function getEcLevelIndex(level: EcLevel) {
  switch (level) {
    case 'L': return 0
    case 'M': return 1
    case 'Q': return 2
    case 'H': return 3
  }
}

function getEcLevelBits(level: EcLevel) {
  switch (level) {
    case 'L': return 1
    case 'M': return 0
    case 'Q': return 3
    case 'H': return 2
  }
}

function getSymbolSize(version: number) {
  return version * 4 + 17
}

function getTotalCodewords(version: number) {
  const total = TOTAL_CODEWORDS[version]
  if (!total) {
    throw new Error(`Unsupported QR version: ${version}`)
  }
  return total
}

function getEcBlocks(version: number, level: EcLevel) {
  return requireNumber(EC_BLOCKS_TABLE[(version - 1) * 4 + getEcLevelIndex(level)], 'ec block count')
}

function getEcTotalCodewords(version: number, level: EcLevel) {
  return requireNumber(EC_CODEWORDS_TABLE[(version - 1) * 4 + getEcLevelIndex(level)], 'ec total codewords')
}

function getByteCharCountBits(version: number) {
  if (version < 10) {
    return 8
  }
  if (version < 27) {
    return 16
  }
  return 16
}

function getByteCapacity(version: number, level: EcLevel) {
  const dataBits = (getTotalCodewords(version) - getEcTotalCodewords(version, level)) * 8
  return Math.floor((dataBits - 4 - getByteCharCountBits(version)) / 8)
}

function pickVersion(byteLength: number, level: EcLevel) {
  for (let version = 1; version <= 40; version += 1) {
    if (byteLength <= getByteCapacity(version, level)) {
      return version
    }
  }
  throw new Error('QR content is too large to encode')
}

function createCodewords(data: Uint8Array, version: number, level: EcLevel) {
  const bitBuffer = new QrBitBuffer()
  bitBuffer.put(BYTE_MODE_INDICATOR, 4)
  bitBuffer.put(data.length, getByteCharCountBits(version))
  for (const byte of data) {
    bitBuffer.put(byte, 8)
  }

  const totalCodewords = getTotalCodewords(version)
  const ecTotalCodewords = getEcTotalCodewords(version, level)
  const dataBitsCapacity = (totalCodewords - ecTotalCodewords) * 8

  if (bitBuffer.length > dataBitsCapacity) {
    throw new Error('QR content does not fit in selected version')
  }

  const terminatorLength = Math.min(4, dataBitsCapacity - bitBuffer.length)
  bitBuffer.put(0, terminatorLength)

  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.putBit(false)
  }

  let padIndex = 0
  while (bitBuffer.buffer.length < totalCodewords - ecTotalCodewords) {
    bitBuffer.put(requireNumber(PAD_CODEWORDS[padIndex % PAD_CODEWORDS.length], 'pad codeword'), 8)
    padIndex += 1
  }

  return interleaveBlocks(Uint8Array.from(bitBuffer.buffer), version, level)
}

function interleaveBlocks(data: Uint8Array, version: number, level: EcLevel) {
  const totalCodewords = getTotalCodewords(version)
  const ecTotalCodewords = getEcTotalCodewords(version, level)
  const dataTotalCodewords = totalCodewords - ecTotalCodewords
  const blockCount = getEcBlocks(version, level)
  const group2Blocks = totalCodewords % blockCount
  const group1Blocks = blockCount - group2Blocks
  const totalPerBlock = Math.floor(totalCodewords / blockCount)
  const dataPerGroup1 = Math.floor(dataTotalCodewords / blockCount)
  const dataPerGroup2 = dataPerGroup1 + 1
  const ecPerBlock = totalPerBlock - dataPerGroup1

  const dataBlocks: Uint8Array[] = []
  const ecBlocks: Uint8Array[] = []
  let maxDataSize = 0
  let offset = 0

  for (let block = 0; block < blockCount; block += 1) {
    const dataSize = block < group1Blocks ? dataPerGroup1 : dataPerGroup2
    const dataBlock = data.slice(offset, offset + dataSize)
    dataBlocks.push(dataBlock)
    ecBlocks.push(generateErrorCodewords(dataBlock, ecPerBlock))
    offset += dataSize
    maxDataSize = Math.max(maxDataSize, dataSize)
  }

  const result = new Uint8Array(totalCodewords)
  let index = 0

  for (let byteIndex = 0; byteIndex < maxDataSize; byteIndex += 1) {
    for (const block of dataBlocks) {
      if (byteIndex < block.length) {
        result[index] = block[byteIndex] ?? 0
        index += 1
      }
    }
  }

  for (let byteIndex = 0; byteIndex < ecPerBlock; byteIndex += 1) {
    for (const block of ecBlocks) {
      result[index] = block[byteIndex] ?? 0
      index += 1
    }
  }

  return result
}

function generateErrorCodewords(data: Uint8Array, ecCount: number) {
  const generator = createGeneratorPolynomial(ecCount)
  const buffer = new Uint8Array(data.length + ecCount)
  buffer.set(data)

  let remainder = new Uint8Array(buffer)
  while (remainder.length >= generator.length) {
    const factor = remainder[0] ?? 0
    for (let index = 0; index < generator.length; index += 1) {
      remainder[index] = remainder[index]! ^ gfMultiply(generator[index] ?? 0, factor)
    }
    let offset = 0
    while (offset < remainder.length && remainder[offset] === 0) {
      offset += 1
    }
    remainder = remainder.slice(offset)
  }

  if (remainder.length === ecCount) {
    return remainder
  }

  const result = new Uint8Array(ecCount)
  result.set(remainder, ecCount - remainder.length)
  return result
}

function createGeneratorPolynomial(degree: number) {
  let polynomial = new Uint8Array([1])
  for (let index = 0; index < degree; index += 1) {
    polynomial = multiplyPolynomials(polynomial, new Uint8Array([1, gfExp(index)]))
  }
  return polynomial
}

function multiplyPolynomials(left: Uint8Array, right: Uint8Array) {
  const result = new Uint8Array(left.length + right.length - 1)
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const leftValue = left[leftIndex] ?? 0
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      const rightValue = right[rightIndex] ?? 0
      const targetIndex = leftIndex + rightIndex
      const current = result[targetIndex] ?? 0
      result[targetIndex] = current ^ gfMultiply(leftValue, rightValue)
    }
  }
  return result
}

function gfExp(exponent: number) {
  return GF_EXP[exponent] ?? 0
}

function gfMultiply(left: number, right: number) {
  if (left === 0 || right === 0) {
    return 0
  }
  return GF_EXP[(GF_LOG[left] ?? 0) + (GF_LOG[right] ?? 0)] ?? 0
}

function buildMatrix(codewords: Uint8Array, version: number, level: EcLevel) {
  const size = getSymbolSize(version)
  const base = new QrMatrixBuffer(size)
  setupFinderPatterns(base, version)
  setupTimingPatterns(base)
  setupAlignmentPatterns(base, version)
  setupFormatInfo(base, level, 0)

  if (version >= 7) {
    setupVersionInfo(base, version)
  }

  setupData(base, codewords)
  const mask = pickBestMask(base, level)
  applyMask(base, mask)
  setupFormatInfo(base, level, mask)

  return { buffer: base, mask }
}

function setupFinderPatterns(matrix: QrMatrixBuffer, version: number) {
  const size = getSymbolSize(version)
  const positions: Array<[number, number]> = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]

  for (const [row, col] of positions) {
    for (let dy = -1; dy <= 7; dy += 1) {
      const y = row + dy
      if (y < 0 || y >= size) {
        continue
      }
      for (let dx = -1; dx <= 7; dx += 1) {
        const x = col + dx
        if (x < 0 || x >= size) {
          continue
        }

        const isBorder = (
          (dy >= 0 && dy <= 6 && (dx === 0 || dx === 6))
          || (dx >= 0 && dx <= 6 && (dy === 0 || dy === 6))
        )
        const isCenter = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4

        matrix.set(y, x, isBorder || isCenter, true)
      }
    }
  }
}

function setupTimingPatterns(matrix: QrMatrixBuffer) {
  const size = matrix.size
  for (let index = 8; index < size - 8; index += 1) {
    const value = index % 2 === 0
    matrix.set(index, 6, value, true)
    matrix.set(6, index, value, true)
  }
}

function setupAlignmentPatterns(matrix: QrMatrixBuffer, version: number) {
  const positions = getAlignmentPatternPositions(version)
  for (const [row, col] of positions) {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        const isDark = dy === -2 || dy === 2 || dx === -2 || dx === 2 || (dy === 0 && dx === 0)
        matrix.set(row + dy, col + dx, isDark, true)
      }
    }
  }
}

function getAlignmentPatternPositions(version: number) {
  if (version === 1) {
    return [] as Array<[number, number]>
  }

  const size = getSymbolSize(version)
  const posCount = Math.floor(version / 7) + 2
  const step = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2
  const coords = [size - 7]
  for (let index = 1; index < posCount - 1; index += 1) {
    coords[index] = (coords[index - 1] ?? 0) - step
  }
  coords.push(6)
  coords.reverse()

  const positions: Array<[number, number]> = []
  const lastIndex = coords.length - 1
  for (let rowIndex = 0; rowIndex < coords.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < coords.length; colIndex += 1) {
      if (
        (rowIndex === 0 && colIndex === 0)
        || (rowIndex === 0 && colIndex === lastIndex)
        || (rowIndex === lastIndex && colIndex === 0)
      ) {
        continue
      }
      positions.push([coords[rowIndex] ?? 0, coords[colIndex] ?? 0])
    }
  }

  return positions
}

function setupVersionInfo(matrix: QrMatrixBuffer, version: number) {
  const bits = getVersionInfoBits(version)
  const size = matrix.size
  for (let index = 0; index < 18; index += 1) {
    const row = Math.floor(index / 3)
    const col = (index % 3) + size - 11
    const value = ((bits >> index) & 1) === 1
    matrix.set(row, col, value, true)
    matrix.set(col, row, value, true)
  }
}

function getVersionInfoBits(version: number) {
  let value = version << 12
  while (getBchDigit(value) - getBchDigit(VERSION_INFO_POLY) >= 0) {
    value ^= VERSION_INFO_POLY << (getBchDigit(value) - getBchDigit(VERSION_INFO_POLY))
  }
  return (version << 12) | value
}

function setupFormatInfo(matrix: QrMatrixBuffer, level: EcLevel, mask: number) {
  const bits = getFormatInfoBits(level, mask)
  const size = matrix.size
  for (let index = 0; index < 15; index += 1) {
    const value = ((bits >> index) & 1) === 1

    if (index < 6) {
      matrix.set(index, 8, value, true)
    }
    else if (index < 8) {
      matrix.set(index + 1, 8, value, true)
    }
    else {
      matrix.set(size - 15 + index, 8, value, true)
    }

    if (index < 8) {
      matrix.set(8, size - index - 1, value, true)
    }
    else if (index < 9) {
      matrix.set(8, 15 - index, value, true)
    }
    else {
      matrix.set(8, 15 - index - 1, value, true)
    }
  }

  matrix.set(size - 8, 8, true, true)
}

function getFormatInfoBits(level: EcLevel, mask: number) {
  const data = (getEcLevelBits(level) << 3) | mask
  let value = data << 10
  while (getBchDigit(value) - getBchDigit(FORMAT_INFO_POLY) >= 0) {
    value ^= FORMAT_INFO_POLY << (getBchDigit(value) - getBchDigit(FORMAT_INFO_POLY))
  }
  return ((data << 10) | value) ^ FORMAT_MASK
}

function getBchDigit(value: number) {
  let digit = 0
  let current = value
  while (current !== 0) {
    digit += 1
    current >>>= 1
  }
  return digit
}

function setupData(matrix: QrMatrixBuffer, codewords: Uint8Array) {
  const size = matrix.size
  let row = size - 1
  let direction = -1
  let byteIndex = 0
  let bitIndex = 7

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) {
      col -= 1
    }

    while (true) {
      for (let offset = 0; offset < 2; offset += 1) {
        const targetCol = col - offset
        if (matrix.isReserved(row, targetCol)) {
          continue
        }

        const codeword = codewords[byteIndex] ?? 0
        const value = ((codeword >>> bitIndex) & 1) === 1
        matrix.set(row, targetCol, value)
        bitIndex -= 1
        if (bitIndex < 0) {
          byteIndex += 1
          bitIndex = 7
        }
      }

      row += direction
      if (row < 0 || row >= size) {
        row -= direction
        direction = -direction
        break
      }
    }
  }
}

function pickBestMask(matrix: QrMatrixBuffer, level: EcLevel) {
  let bestMask = 0
  let bestPenalty = Number.POSITIVE_INFINITY

  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = matrix.clone()
    setupFormatInfo(candidate, level, mask)
    applyMask(candidate, mask)
    const penalty = getPenaltyScore(candidate)
    if (penalty < bestPenalty) {
      bestPenalty = penalty
      bestMask = mask
    }
  }

  return bestMask
}

function applyMask(matrix: QrMatrixBuffer, mask: number) {
  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (matrix.isReserved(row, col)) {
        continue
      }
      matrix.xor(row, col, getMaskBit(mask, row, col))
    }
  }
}

function getMaskBit(mask: number, row: number, col: number) {
  switch (mask) {
    case 0: return (row + col) % 2 === 0
    case 1: return row % 2 === 0
    case 2: return col % 3 === 0
    case 3: return (row + col) % 3 === 0
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0
    case 6: return ((((row * col) % 2) + ((row * col) % 3)) % 2) === 0
    case 7: return ((((row * col) % 3) + ((row + col) % 2)) % 2) === 0
    default: throw new Error(`Unsupported QR mask: ${mask}`)
  }
}

function getPenaltyScore(matrix: QrMatrixBuffer) {
  return getPenaltyN1(matrix) + getPenaltyN2(matrix) + getPenaltyN3(matrix) + getPenaltyN4(matrix)
}

function getPenaltyN1(matrix: QrMatrixBuffer) {
  let penalty = 0

  for (let index = 0; index < matrix.size; index += 1) {
    let rowRunColor = matrix.get(index, 0)
    let rowRunLength = 1
    let colRunColor = matrix.get(0, index)
    let colRunLength = 1

    for (let offset = 1; offset < matrix.size; offset += 1) {
      const rowColor = matrix.get(index, offset)
      if (rowColor === rowRunColor) {
        rowRunLength += 1
      }
      else {
        if (rowRunLength >= 5) {
          penalty += 3 + (rowRunLength - 5)
        }
        rowRunColor = rowColor
        rowRunLength = 1
      }

      const colColor = matrix.get(offset, index)
      if (colColor === colRunColor) {
        colRunLength += 1
      }
      else {
        if (colRunLength >= 5) {
          penalty += 3 + (colRunLength - 5)
        }
        colRunColor = colColor
        colRunLength = 1
      }
    }

    if (rowRunLength >= 5) {
      penalty += 3 + (rowRunLength - 5)
    }
    if (colRunLength >= 5) {
      penalty += 3 + (colRunLength - 5)
    }
  }

  return penalty
}

function getPenaltyN2(matrix: QrMatrixBuffer) {
  let penalty = 0
  for (let row = 0; row < matrix.size - 1; row += 1) {
    for (let col = 0; col < matrix.size - 1; col += 1) {
      const sum = Number(matrix.get(row, col))
        + Number(matrix.get(row + 1, col))
        + Number(matrix.get(row, col + 1))
        + Number(matrix.get(row + 1, col + 1))
      if (sum === 0 || sum === 4) {
        penalty += 3
      }
    }
  }
  return penalty
}

function getPenaltyN3(matrix: QrMatrixBuffer) {
  let penalty = 0

  for (let row = 0; row < matrix.size; row += 1) {
    let rowBits = 0
    let colBits = 0

    for (let col = 0; col < matrix.size; col += 1) {
      rowBits = ((rowBits << 1) & 0x7FF) | Number(matrix.get(row, col))
      colBits = ((colBits << 1) & 0x7FF) | Number(matrix.get(col, row))
      if (col >= 10 && (rowBits === 0x5D0 || rowBits === 0x05D)) {
        penalty += 40
      }
      if (col >= 10 && (colBits === 0x5D0 || colBits === 0x05D)) {
        penalty += 40
      }
    }
  }

  return penalty
}

function getPenaltyN4(matrix: QrMatrixBuffer) {
  let darkCount = 0
  for (const value of matrix.data) {
    darkCount += value
  }
  const ratio = (darkCount * 100) / matrix.data.length
  return Math.abs(Math.ceil(ratio / 5) - 10) * 10
}

function requireNumber(value: number | undefined, label: string) {
  if (typeof value !== 'number') {
    throw new TypeError(`Missing ${label}`)
  }
  return value
}
