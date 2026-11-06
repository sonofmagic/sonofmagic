import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import packageJson from '../package.json'
import { Counter } from '../src/index'
import config from '../tsdown.config'

describe('index', () => {
  it('renders and updates the counter with the real Ink renderer', async () => {
    const instance = render(<Counter />)

    try {
      await vi.waitFor(() => {
        expect(instance.lastFrame()).toMatch(/\b[1-9]\d* tests passed/)
      }, { timeout: 3_000 })
    }
    finally {
      instance.unmount()
      instance.cleanup()
    }
  })
})

describe('build configuration', () => {
  const requiredNodeRange = '>=26.13.0'

  it('uses tsdown scripts and esm metadata', () => {
    expect(packageJson.type).toBe('module')
    expect(packageJson.scripts.build).toContain('tsdown')
    expect(packageJson.scripts.dev).toContain('tsdown')
    expect(packageJson.scripts.build).not.toContain('tsup')
    expect(packageJson.scripts.dev).not.toContain('tsup')
    expect(packageJson.engines.node).toBe(requiredNodeRange)
    expect(packageJson.types).toBe('./dist/index.d.mts')
    expect(packageJson.exports['.'].types).toBe('./dist/index.d.mts')
  })

  it('builds esm output with mjs extension', () => {
    expect(config.format).toEqual(['esm'])
    expect(config.entry).toEqual(['src/index.tsx', 'src/cli.tsx'])
    const outputExtensions = config.outExtensions?.({ format: 'esm' } as never)
    expect(outputExtensions).toBeDefined()
    expect(outputExtensions?.js).toBe('.mjs')
  })
})
