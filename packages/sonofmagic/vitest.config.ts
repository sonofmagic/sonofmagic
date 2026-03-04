import path from 'node:path'
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: '@icebreakers/profile',
        replacement: path.resolve(__dirname, '../profile/src/index.ts'),
      },
    ],
    globals: true,
    testTimeout: 60_000,
  },
})
