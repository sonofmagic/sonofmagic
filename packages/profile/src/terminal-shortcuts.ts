import type { Buffer } from 'node:buffer'
import type { SupportedLanguage } from './i18n'
import process from 'node:process'
import readline from 'node:readline'
import { changeLanguage, Dic, getCurrentLanguage, getSupportedLanguages, t } from './i18n'
import { padEndDisplay, profileTheme, prompts, stripAnsi, terminalDisplayWidth, truncateDisplay } from './util'

export interface ShortcutChoice<TValue> {
  title: string
  description?: string
  value: TValue
}

type ShortcutAction = 'up' | 'down' | 'left' | 'right' | 'submit' | 'language' | 'back'

const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  zh: '中文',
}
const minShortcutLineWidth = 60
const shortcutLineMargin = 4

export function getNextLanguage(language: SupportedLanguage = getCurrentLanguage()): SupportedLanguage {
  const languages = getSupportedLanguages()
  const currentIndex = languages.findIndex(item => item === language)
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % languages.length
  return languages[nextIndex] ?? languages[0] ?? 'zh'
}

export async function switchToNextLanguage() {
  return changeLanguage(getNextLanguage())
}

export function getLanguageShortcutHint() {
  const currentLanguage = getCurrentLanguage()
  const nextLanguage = getNextLanguage(currentLanguage)
  return t(Dic.changeLanguage.shortcutHint, {
    language: languageLabels[currentLanguage],
    nextLanguage: languageLabels[nextLanguage],
  }) as string
}

export function getShortcutBarText() {
  return `${t(Dic.promptHint)} · ${getLanguageShortcutHint()}`
}

function resolveValue<TValue>(value: TValue[] | (() => TValue[])): TValue[] {
  return typeof value === 'function' ? (value as () => TValue[])() : value
}

export function parseShortcutInput(input: Buffer | string): ShortcutAction | null {
  const value = input.toString()
  const lower = value.toLowerCase()
  if (value.includes('\u001B[A') || lower === 'k') {
    return 'up'
  }
  if (value.includes('\u001B[B') || lower === 'j') {
    return 'down'
  }
  if (value.includes('\u001B[D') || lower === 'h') {
    return 'left'
  }
  if (value.includes('\u001B[C') || lower === 'n') {
    return 'right'
  }
  if (value.includes('\r') || value.includes('\n')) {
    return 'submit'
  }
  if (lower === 'l') {
    return 'language'
  }
  if (value.includes('\u0003') || value.includes('\u001B') || lower === 'q') {
    return 'back'
  }
  return null
}

export function renderShortcutSelect<TValue>(
  message: string,
  choices: Array<ShortcutChoice<TValue>>,
  selectedIndex: number,
  columns = process.stdout.columns,
  footer?: string,
) {
  const maxLineWidth = Math.max(minShortcutLineWidth, (columns || 100) - shortcutLineMargin)
  const hasDescription = choices.some(item => item.description)
  const titleColumnWidth = Math.max(
    0,
    ...choices
      .filter(item => item.description)
      .map(item => terminalDisplayWidth(item.title)),
  )
  const cappedTitleColumnWidth = Math.min(titleColumnWidth, Math.max(12, Math.floor(maxLineWidth * 0.45)))
  const descriptionPrefixWidth = 3
  const descriptionColumnWidth = Math.max(
    12,
    maxLineWidth - 2 - cappedTitleColumnWidth - descriptionPrefixWidth,
  )
  const lines = [
    profileTheme.colors.prompt(truncateDisplay(message, maxLineWidth)),
    '',
    ...choices.map((item, index) => {
      const selected = index === selectedIndex
      const prefix = selected ? profileTheme.colors.primary('>') : ' '
      const paddedTitle = hasDescription
        ? padEndDisplay(truncateDisplay(item.title, cappedTitleColumnWidth), cappedTitleColumnWidth)
        : truncateDisplay(item.title, maxLineWidth - 2)
      const title = selected ? profileTheme.colors.primaryStrong(paddedTitle) : paddedTitle
      const description = item.description
        ? profileTheme.colors.secondary(` - ${truncateDisplay(stripAnsi(item.description), descriptionColumnWidth)}`)
        : ''
      return `${prefix} ${title}${description}`
    }),
    '',
    ...(footer ? [profileTheme.colors.secondary(truncateDisplay(footer, maxLineWidth))] : []),
    profileTheme.colors.secondary(getShortcutBarText()),
  ]

  return `\u001B[?25l${lines.map(line => `${line}\u001B[K`).join('\n')}\u001B[J`
}

function clearRenderedBlock(stream: NodeJS.WriteStream, renderedLineCount: number) {
  if (renderedLineCount <= 0) {
    return
  }
  readline.moveCursor(stream, 0, -renderedLineCount)
  readline.cursorTo(stream, 0)
  readline.clearScreenDown(stream)
}

function restoreInput(stream: NodeJS.ReadStream, wasRaw: boolean) {
  stream.setRawMode(Boolean(wasRaw))
  stream.pause()
}

export async function selectWithShortcuts<TValue>(options: {
  message: string | (() => string)
  choices: Array<ShortcutChoice<TValue>> | (() => Array<ShortcutChoice<TValue>>)
  initial?: number
  footer?: string | (() => string)
  onLeft?: () => boolean | void
  onRight?: () => boolean | void
}): Promise<{ value: TValue, index: number } | null> {
  const stdin = process.stdin
  const stdout = process.stdout
  const canUseRawMode = Boolean(stdin.isTTY && typeof stdin.setRawMode === 'function')
  let choices = resolveValue(options.choices)
  let selectedIndex = Math.min(Math.max(0, options.initial ?? 0), Math.max(0, choices.length - 1))

  if (!canUseRawMode) {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: typeof options.message === 'function' ? options.message() : options.message,
      choices,
      initial: selectedIndex,
    })
    const value = response?.value as TValue | undefined
    const index = choices.findIndex(item => item.value === value)
    return value !== undefined && index >= 0 ? { value, index } : null
  }

  return new Promise((resolve, reject) => {
    const wasRaw = stdin.isRaw
    let renderedLineCount = 0
    let closed = false
    let onData: ((input: Buffer) => void) | undefined

    const close = (result: { value: TValue, index: number } | null) => {
      if (closed) {
        return
      }
      closed = true
      if (onData) {
        stdin.off('data', onData)
      }
      restoreInput(stdin, Boolean(wasRaw))
      clearRenderedBlock(stdout, renderedLineCount)
      stdout.write('\u001B[?25h')
      resolve(result)
    }

    const fail = (error: unknown) => {
      if (closed) {
        return
      }
      closed = true
      if (onData) {
        stdin.off('data', onData)
      }
      restoreInput(stdin, Boolean(wasRaw))
      clearRenderedBlock(stdout, renderedLineCount)
      stdout.write('\u001B[?25h')
      reject(error)
    }

    const render = () => {
      choices = resolveValue(options.choices)
      selectedIndex = Math.min(selectedIndex, Math.max(0, choices.length - 1))
      if (renderedLineCount > 0) {
        clearRenderedBlock(stdout, renderedLineCount)
      }
      const message = typeof options.message === 'function' ? options.message() : options.message
      const footer = typeof options.footer === 'function' ? options.footer() : options.footer
      const frame = renderShortcutSelect(message, choices, selectedIndex, process.stdout.columns, footer)
      renderedLineCount = frame.split('\n').length
      stdout.write(`${frame}\n`)
    }

    onData = (input: Buffer) => {
      const action = parseShortcutInput(input)
      if (!action) {
        return
      }
      if (action === 'back') {
        close(null)
        return
      }
      if (action === 'language') {
        void switchToNextLanguage().then(render).catch(fail)
        return
      }
      if (action === 'submit') {
        const selected = choices[selectedIndex]
        close(selected ? { value: selected.value, index: selectedIndex } : null)
        return
      }
      if (action === 'left') {
        const handled = options.onLeft?.()
        if (handled !== false) {
          selectedIndex = 0
          render()
          return
        }
      }
      if (action === 'right') {
        const handled = options.onRight?.()
        if (handled !== false) {
          selectedIndex = 0
          render()
          return
        }
      }
      if (action === 'up') {
        selectedIndex = selectedIndex === 0 ? choices.length - 1 : selectedIndex - 1
      }
      else if (action === 'down') {
        selectedIndex = selectedIndex === choices.length - 1 ? 0 : selectedIndex + 1
      }
      render()
    }

    stdin.setRawMode(true)
    stdin.resume()
    stdin.on('data', onData)
    render()
  })
}

/** @internal */
export const terminalShortcutsInternal = {
  parseShortcutInput,
  clearRenderedBlock,
  renderShortcutSelect,
  restoreInput,
}
