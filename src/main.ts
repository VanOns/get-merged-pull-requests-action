import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/core'
// eslint-disable-next-line import/no-unresolved
import {components} from '@octokit/openapi-types'
// eslint-disable-next-line import/no-unresolved
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types'
import {PullRequestDefault, Repo} from './interfaces'

const ALLOWED_RETURN_TYPES: string[] = ['title_only', 'all']
const DEFAULT_RETURN_TYPE = 'title_only'

const getRepo = (): Repo => {
  const repo = core.getInput('repo')
  if (repo && repo.includes('/')) {
    return {
      owner: repo.split('/')[0],
      repo: repo.split('/')[1]
    }
  }

  try {
    return {
      owner: github.context?.repo?.owner,
      repo: github.context?.repo?.repo
    }
  } catch (e) {
    return {
      owner: '',
      repo: ''
    }
  }
}

const getCurrentTag = (): string => {
  return (
    core.getInput('current_tag') ||
    github.context?.ref?.replace('refs/tags/', '') ||
    'HEAD'
  )
}

const getPreviousTag = async (
  client: Octokit & Api,
  repo: Repo,
  currentTag: string
): Promise<string | null> => {
  const previousTag: string = core.getInput('previous_tag')
  if (previousTag) {
    return previousTag
  }

  const tags = await client.rest.repos.listTags({
    owner: repo.owner,
    repo: repo.repo
  })

  const index: number = tags.data.findIndex(tag => tag.name === currentTag)

  if (typeof tags.data[index + 1] === 'undefined') {
    return null
  }

  return tags.data[index + 1].name
}

const getReturnType = (): string => {
  const returnType = core.getInput('return_type')
  if (returnType && ALLOWED_RETURN_TYPES.includes(returnType)) {
    return returnType
  }

  return DEFAULT_RETURN_TYPE
}

const getCommits = async (
  client: Octokit & Api,
  repo: Repo,
  currentTag: string,
  previousTag: string
): Promise<components['schemas']['commit'][] | null> => {
  const commits = await client.rest.repos.compareCommitsWithBasehead({
    owner: repo.owner,
    repo: repo.repo,
    basehead: `${previousTag}...${currentTag}`
  })

  // The regex to use to determine if a commit is a pull request merge commit.
  const commitIsPullRequestRegex = new RegExp(
    core.getInput('commit_is_pull_request_regex') || /^Merge pull request.*/
  )

  return commits.data.commits.filter(commit =>
    commitIsPullRequestRegex.test(commit.commit.message)
  )
}

const getPullRequests = async (
  client: Octokit & Api,
  repo: Repo,
  currentTag: string,
  previousTag: string
): Promise<
  | PullRequestDefault[]
  | components['schemas']['issue-search-result-item'][]
  | []
> => {
  const commits = await getCommits(client, repo, currentTag, previousTag)

  if (!commits) {
    return []
  }

  let items: components['schemas']['issue-search-result-item'][] = []
  let hashes: string[] = []

  for (let i = 0; i < commits.length; i++) {
    hashes.push(commits[i].sha)

    if (i % 5 === 0 || i === commits.length - 1) {
      const newItems = (
        await client.rest.search.issuesAndPullRequests({
          q: `repo:${repo.owner}/${repo.repo}+SHA:${hashes.join(',')}`
        })
      ).data.items

      items = items.concat(newItems)
      hashes = []

      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Sort from newest to oldest.
  items = items.reverse()

  // If a regex is set, only return the PRs that match it.
  const pullRequestRegex: string = core.getInput('pull_request_regex')
  if (pullRequestRegex) {
    const regex = new RegExp(pullRequestRegex)

    items = items.filter(item => regex.test(item.title))
  }

  switch (getReturnType()) {
    case 'all':
      return items
    default:
      return items.map(item => ({
        title: item.title
      }))
  }
}

const run = async (): Promise<void> => {
  const githubToken: string = core.getInput('github_token')

  if (!githubToken) {
    core.setFailed('Missing required GitHub token')
    return
  }

  const client: Octokit & Api = github.getOctokit(githubToken)

  const repo = getRepo()

  core.debug(`Owner: ${repo.owner}`)
  core.debug(`Repo: ${repo.repo}`)

  if (!repo.owner || !repo.repo) {
    core.setFailed('Unable to determine owner and/or repo')
    return
  }

  const currentTag = getCurrentTag()

  core.debug(`Current tag: ${currentTag}`)

  if (!currentTag) {
    core.setFailed('Unable to determine current tag')
    return
  }

  const previousTag = await getPreviousTag(client, repo, currentTag)

  core.debug(`Previous tag: ${previousTag}`)

  if (!previousTag) {
    core.setFailed('Unable to determine previous tag')
    return
  }

  const pullRequests = await getPullRequests(
    client,
    repo,
    currentTag,
    previousTag
  )

  core.debug(`Pull requests found: ${pullRequests.length}`)

  if (!pullRequests.length) {
    core.info('No pull requests found')
    return
  }

  core.info('The following PRs were found:')

  for (const pullRequest of pullRequests) {
    core.info(`${pullRequest.title}`)
  }

  core.setOutput('pull_requests', pullRequests)
}

run()
