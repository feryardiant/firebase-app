import type { Options } from '@wdio/types'

import vitestConfig from './vitest.config.js'

export const config: Options.Testrunner = {
  specs: [
    './test/**/*.test.ts',
  ],

  runner: [
    'browser',
    {
      viteConfig: vitestConfig
    }
  ],

  capabilities: [
    {
      browserName: 'chrome',
    }
  ]
}
