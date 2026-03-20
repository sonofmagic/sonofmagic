import { BYTE_MODE_INDICATOR, PAD_CODEWORDS } from './constants'
import { generateErrorCodewords } from './galois'
import {
  type EcLevel,
  getByteCapacity,
  getByteCharCountBits,
  getEcBlocks,
  getEcTotalCodewords,
  getTotalCodewords,
  QrBitBuffer,
  requireNumber,
} from './shared'

export function pickVersion(byteLength: number, level: EcLevel) {
  for (let version = 1; version <= 40; version += 1) {
    if (byteLength <= getByteCapacity(version, level)) {
      return version
    }
  }
  throw new Error('QR content is too large to encode')
}

export function createCodewords(data: Uint8Array, version: number, level: EcLevel) {
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
