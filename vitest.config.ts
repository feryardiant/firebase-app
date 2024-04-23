import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    globalSetup: [
      './test/setup.ts',
    ],
    include: ['./test/*.test.ts'],
  },
})
