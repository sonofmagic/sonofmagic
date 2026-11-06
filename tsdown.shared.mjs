import { defineConfig } from 'tsdown'

export function createEsmNodeConfig(overrides = {}) {
  return defineConfig({
    shims: true,
    target: 'node26',
    deps: {
      onlyBundle: false,
      resolveDepSubpath: true,
    },
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
