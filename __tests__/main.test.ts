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

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: env
  }

  console.log(cp.execFileSync(np, [ip], options).toString())
}

test('runs with default parameters', () => {
  const env = {...process.env}

  run(env)
})

test('runs with pr regex', () => {
  const env: Env = {
    ...process.env,
    INPUT_PULL_REQUEST_REGEX: '/^[TEST].*/'
  }

  expect(env['INPUT_PULL_REQUEST_REGEX']).not.toBeUndefined()
  run(env)
})
