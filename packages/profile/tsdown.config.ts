import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  shims: true,
  inlineOnly: false,
  format: ['esm'],
  clean: true,
  dts: true,
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
  outExtensions() {
    return {
      js: '.mjs',
    }
  },
})
