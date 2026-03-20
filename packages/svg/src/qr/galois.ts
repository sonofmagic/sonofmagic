const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)

initializeGaloisField()

export function generateErrorCodewords(data: Uint8Array, ecCount: number) {
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
