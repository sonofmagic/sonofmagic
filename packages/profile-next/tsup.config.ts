import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  shims: true,
  format: ['esm'],
  clean: true,
  dts: true,
  outExtension() {
    return {
      js: '.mjs',
    }
  },
  // https://github.com/egoist/tsup/pull/1056
  // https://github.com/egoist/tsup/issues?q=cjsInterop
  // cjsInterop: true,
  // splitting: true,
})
