import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  shims: true,
  format: ['esm'],
  clean: true,
  dts: true,
  banner: {
    js: 'import { createRequire as __createRequire } from \'node:module\';const require = __createRequire(import.meta.url);',
  },
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
