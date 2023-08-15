import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {test} from '@jest/globals'

test('test runs', () => {
  // process.env['INPUT_GITHUB_TOKEN'] = ''
  // process.env['INPUT_REPO'] = ''
  // process.env['INPUT_CURRENT_TAG'] = ''
  // process.env['INPUT_PREVIOUS_TAG'] = ''

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  console.log(cp.execFileSync(np, [ip], options).toString())
})
