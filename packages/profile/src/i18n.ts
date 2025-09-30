import type { i18n as I18nInstance, TFunction } from 'i18next'
import process from 'node:process'
import { createInstance } from 'i18next'
import resources from './resources'
import Dic from './resources/dic'

const supportedLanguages = ['zh', 'en'] as const
export type SupportedLanguage = typeof supportedLanguages[number]

const defaultLanguage: SupportedLanguage = 'zh'

let cachedInstance: I18nInstance | null = null
let initializationPromise: Promise<void> | null = null
let translateFn: TFunction | null = null

function matchSupportedLanguage(tag?: string | null): SupportedLanguage | undefined {
  if (!tag) {
    return undefined
  }
  const lower = tag.toLowerCase()
  return supportedLanguages.find(language => lower === language || lower.startsWith(`${language}-`))
}

function resolveLanguage(tag?: string | null): SupportedLanguage {
  return matchSupportedLanguage(tag) ?? defaultLanguage
}

const localeEnvKeys = ['LC_ALL', 'LC_MESSAGES', 'LANG', 'LANGUAGE'] as const

function sanitizeLocaleTag(tag?: string | null): string | undefined {
  if (!tag) {
    return undefined
  }
  const trimmed = tag.trim()
  if (!trimmed) {
    return undefined
  }
  const withoutEncoding = trimmed.split('.')[0] ?? trimmed
  const withoutModifiers = withoutEncoding.split('@')[0] ?? withoutEncoding
  const normalized = withoutModifiers.replace(/_/g, '-').toLowerCase()
  return normalized || undefined
}

function detectFromEnv(): SupportedLanguage | undefined {
  for (const key of localeEnvKeys) {
    const locale = sanitizeLocaleTag(process.env[key])
    const matched = matchSupportedLanguage(locale)
    if (matched) {
      return matched
    }
  }
  return undefined
}

function detectFromIntl(): SupportedLanguage | undefined {
  try {
    const locale = sanitizeLocaleTag(Intl.DateTimeFormat().resolvedOptions().locale)
    return matchSupportedLanguage(locale)
  }
  catch {
    return undefined
  }
}

async function detectLanguage(): Promise<SupportedLanguage> {
  return (
    detectFromEnv()
    ?? detectFromIntl()
    ?? defaultLanguage
  )
}

async function ensureInitialized(language?: SupportedLanguage) {
  if (!cachedInstance) {
    if (!initializationPromise) {
      initializationPromise = (async () => {
        const instance = createInstance()
        const initialLanguage = language ?? await detectLanguage()

        await instance.init({
          lng: initialLanguage,
          fallbackLng: defaultLanguage,
          supportedLngs: supportedLanguages,
          returnNull: false,
          resources,
          interpolation: {
            escapeValue: false,
          },
        })

        cachedInstance = instance
        translateFn = instance.t.bind(instance)
      })()
    }

    await initializationPromise
  }

  if (!cachedInstance) {
    throw new Error('Failed to initialize i18n')
  }

  if (language && cachedInstance.language !== language) {
    await cachedInstance.changeLanguage(language)
  }
}

export async function init(language?: string) {
  const targetLanguage = language ? resolveLanguage(language) : undefined
  await ensureInitialized(targetLanguage)
  return cachedInstance!
}

export async function changeLanguage(language: string | SupportedLanguage) {
  const targetLanguage = resolveLanguage(language)
  await ensureInitialized(targetLanguage)
  return cachedInstance!.language as SupportedLanguage
}

export function getSupportedLanguages(): SupportedLanguage[] {
  return [...supportedLanguages]
}

export function getCurrentLanguage(): SupportedLanguage {
  const language = cachedInstance?.language
  return resolveLanguage(language)
}

export function t(...args: Parameters<TFunction>) {
  if (!translateFn) {
    throw new Error('i18n has not been initialized. Call init() before requesting translations.')
  }

  return translateFn(...args)
}

export { Dic }

export function getI18nInstance() {
  if (!cachedInstance) {
    throw new Error('i18n has not been initialized. Call init() first.')
  }
  return cachedInstance
}
