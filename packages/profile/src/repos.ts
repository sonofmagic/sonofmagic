import axios from 'axios'
import { orderBy } from 'es-toolkit'

interface HighlightedRepository {
  name: string
  owners: string[]
}

const highlightedRepositories: HighlightedRepository[] = [
  { name: 'weapp-tailwindcss', owners: ['sonofmagic'] },
  { name: 'weapp-vite', owners: ['weapp-vite', 'sonofmagic'] },
  { name: 'mokup', owners: ['sonofmagic'] },
]

interface GitHubRepository {
  stargazers_count: number
  html_url: string
  description: string
  forks_count: number
  language: string | null
  name: string
}

interface RepositorySummary {
  stargazers_count: number
  html_url: string
  description: string
  forks_count: number
  language: string | null
  name: string
}

function mapGitHubRepository(repo: GitHubRepository): RepositorySummary {
  return {
    stargazers_count: repo.stargazers_count,
    html_url: repo.html_url,
    description: repo.description,
    forks_count: repo.forks_count,
    language: repo.language,
    name: repo.name,
  }
}

async function fetchUserRepositories(username: string): Promise<RepositorySummary[]> {
  const { data } = await axios.get<GitHubRepository[]>(`https://api.github.com/users/${username}/repos`, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
    params: {
      sort: 'updated',
      per_page: 100,
    },
  })

  return orderBy(data, ['stargazers_count'], ['desc']).map(mapGitHubRepository)
}

async function fetchRepository(owner: string, repo: string): Promise<RepositorySummary | null> {
  try {
    const { data } = await axios.get<GitHubRepository>(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })
    return mapGitHubRepository(data)
  }
  catch {
    return null
  }
}

async function resolveHighlightedRepository(
  target: HighlightedRepository,
  rankedByStars: RepositorySummary[],
): Promise<RepositorySummary | null> {
  const existing = rankedByStars.find(repo => repo.name === target.name)
  if (existing) {
    return existing
  }

  for (const owner of target.owners) {
    const repo = await fetchRepository(owner, target.name)
    if (repo) {
      return repo
    }
  }

  return null
}

// https://github.com/angus-c/just
export async function getRepoList() {
  const rankedByStars = await fetchUserRepositories('sonofmagic')
  const highlightedResolved = await Promise.all(
    highlightedRepositories.map(target => resolveHighlightedRepository(target, rankedByStars)),
  )
  const highlighted = highlightedResolved.filter((repo): repo is RepositorySummary => Boolean(repo))
  const highlightedSet = new Set<string>(highlighted.map(repo => repo.name))
  const rest = rankedByStars.filter(repo => !highlightedSet.has(repo.name))

  return [...highlighted, ...rest]
}
