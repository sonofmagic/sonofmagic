import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'], // , 'src/cli.ts'],
  shims: true,
  format: ['esm'],
  clean: true,
  dts: true,
  splitting: true,
  outExtension() {
    return {
      js: '.mjs',
    }
  },
})
