export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
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
