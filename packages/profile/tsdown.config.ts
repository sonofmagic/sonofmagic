import { createEsmNodeConfig } from '../../tsdown.shared.mjs'

export default createEsmNodeConfig({
  entry: ['src/index.ts'],
  inputOptions: {
    onLog(
      level: unknown,
      log: { code?: string, id?: unknown },
      defaultHandler: (level: unknown, log: { code?: string, id?: unknown }) => void,
    ) {
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
