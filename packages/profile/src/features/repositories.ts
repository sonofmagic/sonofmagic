import ora from 'ora'
import { Dic, t } from '../i18n'
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
    console.warn(t(Dic.myRepositories.loading.failText))
    return
  }

  spinner.stop()

  if (!repos.length) {
    console.warn(t(Dic.myRepositories.loading.failText))
    return
  }

  await promptLoop(repos, options.isUnicodeSupported)
}

async function promptLoop(repos: RepoSummary[], isUnicodeSupported: boolean) {
  let initial = 0
  let keepPrompt = true

  while (keepPrompt) {
    await prompts(
      {
        type: 'autocomplete',
        name: 'selection',
        message: t(Dic.myRepositories.promptMsg),
        choices: repos.map((repo, idx) => ({
          title: formatRepositoryLabel(repo, isUnicodeSupported),
          description: repo.description ?? undefined,
          value: {
            url: repo.html_url,
            index: idx,
          },
        })),
        initial,
      },
      {
        async onSubmit(_prompt, selection: Selection) {
          initial = selection.index
          const mod = await import('open')
          await mod.default(selection.url)
        },
        onCancel() {
          keepPrompt = false
        },
      },
    )
  }
}

function formatRepositoryLabel(repo: RepoSummary, isUnicodeSupported: boolean) {
  const starIcon = isUnicodeSupported ? emoji.get('star') : 'star'
  const forkIcon = isUnicodeSupported ? emoji.get('fork_and_knife') : 'fork'
  return `${repo.name} (${starIcon}:${repo.stargazers_count} ${forkIcon}:${repo.forks_count})`
}

/** @internal */
export const repositoryInternal = {
  formatRepositoryLabel,
}
