import { createSpinner } from 'nanospinner'
import { Dic, t } from '../i18n'
import { consoleLog as log, consoleWarn as warn } from '../logger'
import { getFallbackRepoList, getRepoList, getRepositorySpotlight } from '../repos'
import { boxen, emoji, profileTheme, prompts, typeWriterLines } from '../util'

interface RepositoryPromptOptions {
  isUnicodeSupported: boolean
}

type RepoSummary = Awaited<ReturnType<typeof getRepoList>>[number]

interface Selection {
  index: number
  repo: RepoSummary
}

interface RepoChoice {
  title: string
  description?: string
  value: Selection
}

const iconCache = new Map<boolean, {
  starIcon: string
  forkIcon: string
}>()
let openModulePromise: Promise<typeof import('open')> | null = null

function getRepositoryIcons(isUnicodeSupported: boolean) {
  const cached = iconCache.get(isUnicodeSupported)
  if (cached) {
    return cached
  }

  const icons = isUnicodeSupported
    ? {
        starIcon: emoji.get('star') ?? '★',
        forkIcon: emoji.get('fork_and_knife') ?? '🍴',
      }
    : {
        starIcon: 'star',
        forkIcon: 'fork',
      }

  iconCache.set(isUnicodeSupported, icons)
  return icons
}

function formatRepositoryLabel(repo: RepoSummary, isUnicodeSupported: boolean) {
  const { starIcon, forkIcon } = getRepositoryIcons(isUnicodeSupported)
  return `${repo.name} (${starIcon}:${repo.stargazers_count} ${forkIcon}:${repo.forks_count})`
}

function buildRepoChoices(repos: RepoSummary[], isUnicodeSupported: boolean): RepoChoice[] {
  return repos.map((repo, index) => ({
    title: formatRepositoryLabel(repo, isUnicodeSupported),
    description: repo.description ?? undefined,
    value: {
      repo,
      index,
    },
  }))
}

async function openRepository(url: string) {
  if (!openModulePromise) {
    openModulePromise = import('open')
  }
  const mod = await openModulePromise
  await mod.default(url)
}

async function renderRepositoryDetails(repo: RepoSummary) {
  const spotlight = getRepositorySpotlight(repo.name)
  const lines = [
    profileTheme.colors.primaryStrong(repo.name),
    '',
    repo.description || t(Dic.myRepositories.detail.noDescription),
    '',
    `${t(Dic.myRepositories.detail.language)}: ${repo.language ?? 'n/a'}`,
    `${t(Dic.myRepositories.detail.stars)}: ${repo.stargazers_count}`,
    `${t(Dic.myRepositories.detail.forks)}: ${repo.forks_count}`,
    `${t(Dic.myRepositories.detail.url)}: ${profileTheme.colors.link(repo.html_url)}`,
  ]

  if (spotlight) {
    lines.push('')
    lines.push(`${t(Dic.myRepositories.detail.spotlight)}: ${spotlight.tagline}`)
    lines.push(`${t(Dic.myRepositories.detail.bestFor)}:`)
    lines.push(...spotlight.bestFor.map(item => `- ${item}`))
  }

  log('')
  const card = boxen(lines.join('\n'), {
    borderStyle: 'round',
    borderColor: 'cyan',
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
  })
  await typeWriterLines(card.split('\n'), 4, 0, 1)
}

async function handleRepositorySelection(selection: Selection) {
  const { action } = await prompts({
    type: 'select',
    name: 'action',
    message: selection.repo.name,
    choices: [
      { title: t(Dic.myRepositories.actions.open), value: 'open' },
      { title: t(Dic.myRepositories.actions.details), value: 'details' },
      { title: t(Dic.myRepositories.actions.back), value: 'back' },
    ],
    initial: 0,
  })

  if (action === 'open') {
    await openRepository(selection.repo.html_url)
  }

  if (action === 'details') {
    await renderRepositoryDetails(selection.repo)
  }
}

async function promptLoop(repos: RepoSummary[], isUnicodeSupported: boolean) {
  let initial = 0
  let keepPrompt = true
  const baseChoices = buildRepoChoices(repos, isUnicodeSupported)

  while (keepPrompt) {
    await prompts(
      {
        type: 'autocomplete',
        name: 'selection',
        message: t(Dic.myRepositories.promptMsg),
        choices: baseChoices.map(choice => ({ ...choice })),
        initial,
      },
      {
        async onSubmit(_prompt, selection: Selection) {
          initial = selection.index
          await handleRepositorySelection(selection)
        },
        onCancel() {
          keepPrompt = false
        },
      },
    )
  }
}

export async function showRepositoryPrompt(options: RepositoryPromptOptions) {
  const spinner = createSpinner(t(Dic.myRepositories.loading.text)).start()

  let repos: Awaited<ReturnType<typeof getRepoList>> = []
  try {
    repos = await getRepoList()
  }
  catch {
    spinner.stop()
    warn(t(Dic.myRepositories.loading.fallbackText))
    repos = getFallbackRepoList()
  }

  spinner.stop()

  if (!repos.length) {
    warn(t(Dic.myRepositories.loading.fallbackText))
    repos = getFallbackRepoList()
    if (!repos.length) {
      warn(t(Dic.myRepositories.loading.failText))
      return
    }
  }

  await promptLoop(repos, options.isUnicodeSupported)
}

/** @internal */
export const repositoryInternal = {
  formatRepositoryLabel,
  renderRepositoryDetails,
}
