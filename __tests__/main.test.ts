import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test, expect} from '@jest/globals'
import * as dotenv from 'dotenv'
import * as github from '@actions/github'

dotenv.config({path: '.env.test'})

test('test runs', () => {
  expect(process.env['INPUT_GITHUB_TOKEN']).not.toBeUndefined()

  if (process.env['GITHUB_ACTIONS']) {
    expect(github.context.repo).not.toBeUndefined()
  } else {
    expect(process.env['INPUT_REPO']).not.toBeUndefined()
  }

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  console.log(cp.execFileSync(np, [ip], options).toString())
})
