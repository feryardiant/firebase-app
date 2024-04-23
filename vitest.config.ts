import { defineConfig } from 'vitest/config'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    topLevelAwait(),
  ],
  test: {
    browser: {
      enabled: true,
      name: 'chrome',
      headless: true,
    },
    globals: true,
    globalSetup: [
      './test/setup.ts',
    ],
    include: ['./test/*.test.ts'],
  },
})
