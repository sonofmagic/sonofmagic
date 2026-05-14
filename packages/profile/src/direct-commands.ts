import type { ProfileLinkKey } from './constants'
import type { SupportedLanguage } from './i18n'
import { writeFile } from 'node:fs/promises'
import { profileData, profileLinks } from './constants'
import { Dic, init, t } from './i18n'
import { consoleLog as log } from './logger'
import { renderProfileMarkdown } from './profile-content'
import { getFallbackRepoList, getRepositorySpotlight } from './repos'
import { dayjs } from './util'

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
    throw new Error(`Missing url target. Available targets: ${Object.keys(profileLinks).join(', ')}`)
  }

  const normalized = normalizeToken(value)
  const aliasMatched = linkAliasMap[normalized]
  if (aliasMatched) {
    return aliasMatched
  }

  const directMatched = Object.keys(profileLinks).find(linkKey => linkKey === normalized)
  if (!directMatched) {
    throw new Error(`Unknown url target "${value}". Available targets: ${Object.keys(profileLinks).join(', ')}`)
  }

  return directMatched as ProfileLinkKey
}

function buildLinkLines() {
  return Object.entries(profileLinks).map(([label, link]) => `${label}: ${link}`)
}

async function buildSummaryLines(language?: SupportedLanguage) {
  await init(language)
  const experienceYears = Math.max(0, dayjs().diff(profileData.whenToStartWork, 'year'))
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

function buildProjectLines() {
  return getFallbackRepoList().flatMap((repo, index) => {
    const spotlight = getRepositorySpotlight(repo.name)
    const lines = [
      `${index + 1}. ${repo.name}`,
      `   url: ${repo.html_url}`,
      `   description: ${repo.description}`,
    ]

    if (spotlight) {
      lines.push(`   spotlight: ${spotlight.tagline}`)
      lines.push(`   bestFor: ${spotlight.bestFor.join(', ')}`)
    }

    return lines
  })
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
    const spotlight = getRepositorySpotlight(repo.name)
    return {
      ...repo,
      ...(spotlight ? { spotlight } : {}),
    }
  })
}

async function writeOutputFile(outputPath: string, content: string) {
  await writeFile(outputPath, content, 'utf8')
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

  if (normalizedCommand === 'export') {
    assertNoExtraArgs(normalizedCommand, args)
    if (json) {
      throw new Error('The --json option is only supported by the "projects" command.')
    }
    await init(language)
    const markdown = renderProfileMarkdown()
    if (output) {
      await writeOutputFile(output, markdown)
      log(`Wrote profile export to ${output}`)
      return
    }
    log(markdown)
    return
  }

  if (normalizedCommand === 'url') {
    if (args.length === 0) {
      throw new Error(`Missing url target. Available targets: ${Object.keys(profileLinks).join(', ')}`)
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
}
