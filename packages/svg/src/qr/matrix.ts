import { FORMAT_INFO_POLY, FORMAT_MASK, VERSION_INFO_POLY } from './constants'
import {
  type EcLevel,
  getEcLevelBits,
  getSymbolSize,
  QrMatrixBuffer,
} from './shared'

export function buildMatrix(codewords: Uint8Array, version: number, level: EcLevel) {
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
