import { defineWorkspace } from 'vitest/config'

export default defineWorkspace(
  [
    'packages/*',
    'apps/*',
    'scripts/vitest.config.ts',
  ],
)
