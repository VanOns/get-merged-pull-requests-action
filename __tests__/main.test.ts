import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test, expect} from '@jest/globals'
import * as dotenv from 'dotenv'
import * as github from '@actions/github'

dotenv.config({path: '.env.test'})

interface Env {
  [key: string]: string | undefined
}

const run = (env: Env): void => {
  expect(env['INPUT_GITHUB_TOKEN']).not.toBeUndefined()

  if (env['GITHUB_ACTIONS']) {
    expect(github.context.repo).not.toBeUndefined()
  } else {
    expect(env['INPUT_REPO']).not.toBeUndefined()
  }

  const script = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: env,
    encoding: 'utf-8'
  }

  const command = cp.spawnSync(process.execPath, [script], options)

  if (
    command.stderr
      .toString()
      .includes('RequestError [HttpError]: API rate limit exceeded')
  ) {
    console.log('API rate limit exceeded, skipping test')
    return
  }

  console.log(command.stdout.toString())
}

test('Retrieves all PRs between the latest tag and now', () => {
  run(process.env)
})

test('Retrieves all PRs between v1.0.0 and now', () => {
  const env: Env = {
    INPUT_PREVIOUS_TAG: 'v1.0.0',
    ...process.env
  }

  run(env)
})

test('Retrieves all PRs between v1.0.0 and now that start with "[Feat]"', () => {
  const env: Env = {
    INPUT_PREVIOUS_TAG: 'v1.0.0',
    INPUT_PULL_REQUEST_REGEX: '^\\[Feat].*',
    ...process.env
  }

  run(env)
})
