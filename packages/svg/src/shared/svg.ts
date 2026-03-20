export function buildGridPath(width: number, height: number, gap: number) {
  const segments: string[] = []
  for (let x = gap; x < width; x += gap) {
    segments.push(`M${x} 0V${height}`)
  }
  for (let y = gap; y < height; y += gap) {
    segments.push(`M0 ${y}H${width}`)
  }
  return segments.join('')
}

export function estimateBadgeWidth(text: string) {
  return Math.max(160, text.length * 8 + 32)
}

export function formatNumber(value: number) {
  return Number(value.toFixed(2))
}

export function escapeXml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
}

export function hashCode(input: string) {
  let hash = 0
  for (const char of input) {
    hash = (hash << 5) - hash + char.charCodeAt(0)
    hash |= 0
  }
  return hash
}
