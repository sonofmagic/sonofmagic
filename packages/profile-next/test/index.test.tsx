import packageJson from '../package.json'
import config from '../tsdown.config'

describe('index', () => {
  it('foo bar', () => {
    expect(1).toBe(1)
  })
})

describe('build configuration', () => {
  const requiredNodeRange = '^20.19.0 || >=22.12.0'

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
    expect(config.entry).toEqual(['src/index.tsx'])
    expect(config.outExtensions?.({ format: 'esm' } as never).js).toBe('.mjs')
  })
})
