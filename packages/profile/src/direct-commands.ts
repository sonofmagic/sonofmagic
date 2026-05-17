import type { ProfileLinkKey } from './constants'
import type { SupportedLanguage } from './i18n'
import { writeFile } from 'node:fs/promises'
import process from 'node:process'
import { getProfileExperienceYears, profileData, profileLinks } from './constants'
import { Dic, getSupportedLanguages, init, t } from './i18n'
import { consoleLog as log } from './logger'
import { buildTimelineEntries, renderProfileMarkdown } from './profile-content'
import { getFallbackRepoList, getRepositorySpotlight, getRepositorySpotlights } from './repos'

const linkAliasMap: Record<string, ProfileLinkKey> = {
  gh: 'github',
  repo: 'repositories',
  repos: 'repositories',
  repository: 'repositories',
  site: 'website',
  web: 'website',
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase().replaceAll('_', '-')
}

function resolveLinkTarget(value: unknown): ProfileLinkKey {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing URL target. Available targets: ${Object.keys(profileLinks).join(', ')}`)
  }

  const normalized = normalizeToken(value)
  const aliasMatched = linkAliasMap[normalized]
  if (aliasMatched) {
    return aliasMatched
  }

  const directMatched = Object.keys(profileLinks).find(linkKey => linkKey === normalized)
  if (!directMatched) {
    throw new Error(`Unknown URL target "${value}". Available targets: ${Object.keys(profileLinks).join(', ')}`)
  }

  return directMatched as ProfileLinkKey
}

function buildLinkLines() {
  return Object.entries(profileLinks).map(([label, link]) => `${label}: ${link}`)
}

async function buildSummaryLines(language?: SupportedLanguage) {
  await init(language)
  const experienceYears = getProfileExperienceYears()
  return [
    `name: ${profileData.name}`,
    `nickname: ${profileData.nickname}`,
    `position: ${t(Dic.profile.position)}`,
    `startWorkDay: ${profileData.startWorkDay}`,
    `experienceYears: ${experienceYears}`,
  ]
}

function assertNoExtraArgs(commandName: string, args: readonly string[]) {
  if (args.length > 0) {
    throw new Error(`Unknown argument for command "${commandName}": ${args[0]}`)
  }
}

function resolveSpotlightContent(repoName: string) {
  const spotlight = getRepositorySpotlight(repoName)
  if (!spotlight) {
    return null
  }

  const keyMap = {
    'weapp-tailwindcss': Dic.myRepositories.spotlights.weappTailwindcss,
    'weapp-vite': Dic.myRepositories.spotlights.weappVite,
    'mokup': Dic.myRepositories.spotlights.mokup,
  } as const
  const keys = keyMap[spotlight.name as keyof typeof keyMap]
  if (!keys) {
    return null
  }

  return {
    name: spotlight.name,
    tagline: t(keys.tagline),
    bestFor: String(t(keys.bestFor)).split(',').map(item => item.trim()).filter(Boolean),
  }
}

function buildProjectLines() {
  return getFallbackRepoList().flatMap((repo, index) => {
    const spotlight = resolveSpotlightContent(repo.name)
    const lines = [
      `${index + 1}. ${repo.name}`,
      `   URL: ${repo.html_url}`,
      `   About: ${repo.description}`,
    ]

    if (spotlight) {
      lines.push(`   In one line: ${spotlight.tagline}`)
      lines.push(`   Useful for: ${spotlight.bestFor.join(', ')}`)
    }

    return lines
  })
}

function buildTimelineLines() {
  return buildTimelineEntries().map(entry => `${entry.year}: ${entry.title} - ${entry.detail}`)
}

export interface RunDirectCommandOptions {
  command: string
  args: readonly string[]
  language?: SupportedLanguage
  json?: boolean
  output?: string
}

function buildProjectRecords() {
  return getFallbackRepoList().map((repo) => {
    const spotlight = resolveSpotlightContent(repo.name)
    return {
      ...repo,
      ...(spotlight ? { spotlight } : {}),
    }
  })
}

async function writeOutputFile(outputPath: string, content: string) {
  await writeFile(outputPath, content, 'utf8')
}

async function buildHealthLines(language?: SupportedLanguage) {
  await init(language)

  const lines: string[] = []
  const issues: string[] = []
  const pushCheck = (passed: boolean, label: string, detail: string) => {
    lines.push(`${passed ? 'ok' : 'warn'} ${label}: ${detail}`)
    if (!passed) {
      issues.push(label)
    }
  }

  const links = Object.entries(profileLinks)
  const invalidLinks = links.filter(([, url]) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol !== 'https:' && parsed.protocol !== 'http:'
    }
    catch {
      return true
    }
  })
  pushCheck(invalidLinks.length === 0, 'links', `${links.length} configured`)

  const fallbackRepos = getFallbackRepoList()
  const fallbackRepoNames = new Set(fallbackRepos.map(repo => repo.name))
  pushCheck(fallbackRepos.length > 0, 'fallbackRepositories', `${fallbackRepos.length} configured`)
  pushCheck(
    fallbackRepoNames.size === fallbackRepos.length,
    'fallbackRepositoryNames',
    `${fallbackRepoNames.size} unique`,
  )

  const spotlights = getRepositorySpotlights()
  const missingSpotlights = fallbackRepos.filter(repo => !spotlights.some(spotlight => spotlight.name === repo.name))
  pushCheck(missingSpotlights.length === 0, 'repositorySpotlights', `${spotlights.length} configured`)

  const languages = getSupportedLanguages()
  pushCheck(languages.length > 0, 'languages', languages.join(', '))
  pushCheck(Boolean(t(Dic.profile.title)), 'i18n', `profile.title=${t(Dic.profile.title)}`)
  pushCheck(Boolean(renderProfileMarkdown()), 'markdownExport', 'rendered')

  return {
    lines,
    ok: issues.length === 0,
    checks: lines.map((line) => {
      const [status, rest] = line.split(' ', 2)
      const separatorIndex = rest?.indexOf(':') ?? -1
      return {
        status,
        label: separatorIndex >= 0 ? rest!.slice(0, separatorIndex) : rest,
        detail: separatorIndex >= 0 ? rest!.slice(separatorIndex + 1).trim() : '',
      }
    }),
  }
}

export async function runDirectCommand({ command, args, language, json, output }: RunDirectCommandOptions) {
  const normalizedCommand = normalizeToken(command)

  if (normalizedCommand === 'links' || normalizedCommand === 'contact') {
    assertNoExtraArgs(normalizedCommand, args)
    for (const line of buildLinkLines()) {
      log(line)
    }
    return
  }

  if (normalizedCommand === 'projects') {
    assertNoExtraArgs(normalizedCommand, args)
    if (output) {
      throw new Error('The --output option is only supported by the "export" command.')
    }
    await init(language)
    if (json) {
      log(JSON.stringify(buildProjectRecords(), null, 2))
      return
    }
    for (const line of buildProjectLines()) {
      log(line)
    }
    return
  }

  if (normalizedCommand === 'summary') {
    assertNoExtraArgs(normalizedCommand, args)
    const lines = await buildSummaryLines(language)
    for (const line of lines) {
      log(line)
    }
    return
  }

  if (normalizedCommand === 'timeline') {
    assertNoExtraArgs(normalizedCommand, args)
    if (output) {
      throw new Error('The --output option is only supported by the "export" command.')
    }
    await init(language)
    if (json) {
      log(JSON.stringify(buildTimelineEntries(), null, 2))
      return
    }
    for (const line of buildTimelineLines()) {
      log(line)
    }
    return
  }

  if (normalizedCommand === 'health') {
    assertNoExtraArgs(normalizedCommand, args)
    if (output) {
      throw new Error('The --output option is only supported by the "export" command.')
    }
    const health = await buildHealthLines(language)
    if (json) {
      log(JSON.stringify({ ok: health.ok, checks: health.checks }, null, 2))
      if (!health.ok) {
        process.exitCode = 1
      }
      return
    }
    for (const line of health.lines) {
      log(line)
    }
    if (!health.ok) {
      process.exitCode = 1
    }
    return
  }

  if (normalizedCommand === 'export') {
    assertNoExtraArgs(normalizedCommand, args)
    if (json) {
      throw new Error('The --json option is only supported by the "projects" command.')
    }
    await init(language)
    const markdown = renderProfileMarkdown()
    if (output) {
      await writeOutputFile(output, markdown)
      log(`Wrote the profile to ${output}`)
      return
    }
    log(markdown)
    return
  }

  if (normalizedCommand === 'url') {
    if (args.length === 0) {
      throw new Error(`Missing URL target. Available targets: ${Object.keys(profileLinks).join(', ')}`)
    }
    if (args.length > 1) {
      throw new Error(`Unknown argument for command "url": ${args[1]}`)
    }
    const target = resolveLinkTarget(args[0])
    log(profileLinks[target])
    return
  }

  const rest = args.length > 0 ? ` ${args.join(' ')}` : ''
  throw new Error(`Unknown command: ${command}${rest}`)
}

/** @internal */
export const directCommandInternal = {
  resolveLinkTarget,
  buildLinkLines,
  buildProjectLines,
  buildProjectRecords,
  buildHealthLines,
  buildTimelineLines,
  resolveSpotlightContent,
}
