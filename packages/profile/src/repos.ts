import axios from 'axios'
import { orderBy } from 'es-toolkit'

// https://github.com/angus-c/just
export async function getRepoList() {
  const { data } = await axios.get<
    {
      stargazers_count: number
      html_url: string
      description: string
      forks_count: number
      language: string | null
      name: string
    }[]
  >('https://api.github.com/users/sonofmagic/repos', {
    headers: {
      Accept: 'application/vnd.github+json',
    },
    params: {
      sort: 'updated',
      per_page: 100,
    },
  })
  const result = orderBy(data, ['stargazers_count'], ['desc']).map((x) => {
    return {
      stargazers_count: x.stargazers_count,
      html_url: x.html_url,
      description: x.description,
      forks_count: x.forks_count,
      language: x.language,
      name: x.name,
      // full_name: x.full_name
    }
  })
  return result
}
