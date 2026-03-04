import packageJson from '../package.json'
import config from '../tsdown.config'

describe('build configuration', () => {
  it('uses tsdown scripts and esm package metadata', () => {
    expect(packageJson.type).toBe('module')
    expect(packageJson.scripts.build).toContain('tsdown')
    expect(packageJson.scripts.dev).toContain('tsdown')
    expect(packageJson.scripts.build).not.toContain('tsup')
    expect(packageJson.scripts.dev).not.toContain('tsup')
    expect(packageJson.types).toBe('./dist/index.d.mts')
    expect(packageJson.exports['.'].types).toBe('./dist/index.d.mts')
  })

  it('keeps esm-only output and mjs extension', () => {
    expect(config.format).toEqual(['esm'])
    expect(config.dts).toBe(true)
    expect(config.clean).toBe(true)
    expect(config.entry).toEqual(['src/index.ts'])
    expect(config.outExtensions?.({ format: 'esm' } as never).js).toBe('.mjs')
  })
})
