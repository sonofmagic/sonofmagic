import { createEsmNodeConfig } from '../../tsdown.shared.mjs'

export default createEsmNodeConfig({
  entry: ['src/index.ts'],
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
