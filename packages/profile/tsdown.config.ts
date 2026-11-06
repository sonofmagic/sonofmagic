import { createEsmNodeConfig } from '../../tsdown.shared.mjs'

export default createEsmNodeConfig({
  entry: ['src/index.ts'],
  deps: {
    onlyBundle: false,
    resolveDepSubpath: true,
    // Keep the CLI self-contained while preserving the public CommonJS types.
    alwaysBundle: ['dayjs', 'prompts'],
    dts: {
      alwaysBundle: [],
      neverBundle: ['dayjs', 'prompts'],
    },
  },
  inputOptions: {
    onLog(level, log, defaultHandler) {
      if (
        log.code === 'MISSING_EXPORT'
        && typeof log.id === 'string'
        && log.id.includes('node_modules')
      ) {
        return
      }

      defaultHandler(level, log)
    },
  },
})
