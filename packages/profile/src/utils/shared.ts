export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// eslint-disable-next-line no-control-regex
const ansiPattern = /\u001B\[[0-9;]*[A-Z]/gi

export function stripAnsi(input: string) {
  return input.replace(ansiPattern, '')
}

function isZeroWidthCodePoint(codePoint: number) {
  return (
    codePoint === 0x200D
    || codePoint === 0xFE0E
    || codePoint === 0xFE0F
    || (codePoint >= 0x0300 && codePoint <= 0x036F)
    || (codePoint >= 0x1AB0 && codePoint <= 0x1AFF)
    || (codePoint >= 0x1DC0 && codePoint <= 0x1DFF)
    || (codePoint >= 0x20D0 && codePoint <= 0x20FF)
    || (codePoint >= 0xFE20 && codePoint <= 0xFE2F)
  )
}

function isDefaultEmojiCodePoint(codePoint: number) {
  return (
    (codePoint >= 0x231A && codePoint <= 0x231B)
    || (codePoint >= 0x23E9 && codePoint <= 0x23EC)
    || codePoint === 0x23F0
    || codePoint === 0x23F3
    || (codePoint >= 0x25FD && codePoint <= 0x25FE)
    || (codePoint >= 0x2614 && codePoint <= 0x2615)
    || (codePoint >= 0x2648 && codePoint <= 0x2653)
    || codePoint === 0x267F
    || codePoint === 0x2693
    || codePoint === 0x26A1
    || (codePoint >= 0x26AA && codePoint <= 0x26AB)
    || (codePoint >= 0x26BD && codePoint <= 0x26BE)
    || (codePoint >= 0x26C4 && codePoint <= 0x26C5)
    || codePoint === 0x26CE
    || codePoint === 0x26D4
    || codePoint === 0x26EA
    || (codePoint >= 0x26F2 && codePoint <= 0x26F3)
    || codePoint === 0x26F5
    || codePoint === 0x26FA
    || codePoint === 0x26FD
    || codePoint === 0x2705
    || (codePoint >= 0x270A && codePoint <= 0x270B)
    || codePoint === 0x2728
    || codePoint === 0x274C
    || codePoint === 0x274E
    || (codePoint >= 0x2753 && codePoint <= 0x2755)
    || codePoint === 0x2757
    || (codePoint >= 0x2795 && codePoint <= 0x2797)
    || codePoint === 0x27B0
    || codePoint === 0x27BF
    || (codePoint >= 0x2B1B && codePoint <= 0x2B1C)
    || codePoint === 0x2B50
    || codePoint === 0x2B55
  )
}

function isWideCodePoint(codePoint: number, hasEmojiVariation: boolean) {
  if (hasEmojiVariation || isDefaultEmojiCodePoint(codePoint)) {
    return true
  }

  return (
    (codePoint >= 0x1100 && codePoint <= 0x115F)
    || codePoint === 0x2329
    || codePoint === 0x232A
    || (codePoint >= 0x2E80 && codePoint <= 0xA4CF)
    || (codePoint >= 0xAC00 && codePoint <= 0xD7A3)
    || (codePoint >= 0xF900 && codePoint <= 0xFAFF)
    || (codePoint >= 0xFE10 && codePoint <= 0xFE19)
    || (codePoint >= 0xFE30 && codePoint <= 0xFE6F)
    || (codePoint >= 0xFF00 && codePoint <= 0xFF60)
    || (codePoint >= 0xFFE0 && codePoint <= 0xFFE6)
    || (codePoint >= 0x1F300 && codePoint <= 0x1FAFF)
  )
}

export function terminalDisplayWidth(input: string) {
  const chars = Array.from(stripAnsi(input))
  return chars.reduce((width, char, index) => {
    const codePoint = char.codePointAt(0)
    if (!codePoint || codePoint < 0x20 || isZeroWidthCodePoint(codePoint)) {
      return width
    }
    return width + (isWideCodePoint(codePoint, chars[index + 1]?.codePointAt(0) === 0xFE0F) ? 2 : 1)
  }, 0)
}

export function padEndDisplay(input: string, targetWidth: number) {
  const padding = Math.max(0, targetWidth - terminalDisplayWidth(input))
  return `${input}${' '.repeat(padding)}`
}

export function truncateDisplay(input: string, maxWidth: number) {
  if (maxWidth <= 0) {
    return ''
  }
  if (terminalDisplayWidth(input) <= maxWidth) {
    return input
  }
  if (maxWidth <= 1) {
    return '…'
  }

  const targetWidth = maxWidth - 1
  const chars = Array.from(stripAnsi(input))
  let width = 0
  let result = ''

  for (let index = 0; index < chars.length; index++) {
    const char = chars[index]!
    const codePoint = char.codePointAt(0)
    if (!codePoint || codePoint < 0x20 || isZeroWidthCodePoint(codePoint)) {
      continue
    }
    const charWidth = isWideCodePoint(codePoint, chars[index + 1]?.codePointAt(0) === 0xFE0F) ? 2 : 1
    if (width + charWidth > targetWidth) {
      break
    }
    result += char
    width += charWidth
  }

  return `${result}…`
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

export function splitParagraphByLines(text: string, linesPerGroup = 5) {
  // 先把段落按行切分
  const lines = text.split('\n')
  const result = []

  for (let i = 0; i < lines.length; i += linesPerGroup) {
    // 每5行合并成一个字符串
    const group = lines.slice(i, i + linesPerGroup).join('\n')
    result.push(group)
  }

  return result
}
