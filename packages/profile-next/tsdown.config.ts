import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx'],
  shims: true,
  inlineOnly: false,
  format: ['esm'],
  clean: true,
  dts: true,
  outExtensions() {
    return {
      js: '.mjs',
    }
  },
})
