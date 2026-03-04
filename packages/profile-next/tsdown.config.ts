import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx'],
  shims: true,
  format: ['esm'],
  clean: true,
  dts: true,
  outExtensions() {
    return {
      js: '.mjs',
    }
  },
})
