import { defineProject } from 'vitest/config'

export default defineProject({
  root: __dirname,
  test: {
    name: 'scripts',
    include: [
      '*.test.ts',
    ],
    testTimeout: 60_000,
  },
})
