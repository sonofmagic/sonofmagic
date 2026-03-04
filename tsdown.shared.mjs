import { defineConfig } from 'tsdown'

export function createEsmNodeConfig(overrides = {}) {
  return defineConfig({
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
    ...overrides,
  })
}
