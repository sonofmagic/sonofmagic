import ora from 'ora'
import { Dic, t } from '../i18n'
import { consoleWarn as warn } from '../logger'
import { getRepoList } from '../repos'
import { emoji, prompts } from '../util'

interface RepositoryPromptOptions {
  isUnicodeSupported: boolean
}

type RepoSummary = Awaited<ReturnType<typeof getRepoList>>[number]

interface Selection {
  index: number
  url: string
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
      url: repo.html_url,
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
          await openRepository(selection.url)
        },
        onCancel() {
          keepPrompt = false
        },
      },
    )
  }
}

export async function showRepositoryPrompt(options: RepositoryPromptOptions) {
  const spinner = ora({
    spinner: 'soccerHeader',
    text: t(Dic.myRepositories.loading.text),
  }).start()

  let repos: Awaited<ReturnType<typeof getRepoList>> = []
  try {
    repos = await getRepoList()
  }
  catch {
    spinner.stop()
    warn(t(Dic.myRepositories.loading.failText))
    return
  }

  spinner.stop()

  if (!repos.length) {
    warn(t(Dic.myRepositories.loading.failText))
    return
  }

  await promptLoop(repos, options.isUnicodeSupported)
}

/** @internal */
export const repositoryInternal = {
  formatRepositoryLabel,
}
