import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test, expect} from '@jest/globals'
import * as dotenv from 'dotenv'

dotenv.config({path: '.env.test'})

test('test runs', () => {
  expect(process.env['INPUT_GITHUB_TOKEN']).not.toBeUndefined()
  expect(process.env['INPUT_REPO']).not.toBeUndefined()

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  console.log(cp.execFileSync(np, [ip], options).toString())
})
