import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const SCRIPT_PATH = resolve(__dirname, './check-fixed-package-versions.mjs')
const REQUIRED_NODE_RANGE = '^20.19.0 || >=22.12.0'

interface FixtureOptions {
  profileVersion?: string
  sonofmagicVersion?: string
  yangqimingVersion?: string
  profileDependencySpec?: string
  includeFixedGroup?: boolean
  nodeRange?: string
  profileNextNodeRange?: string
  profileMain?: string
  includeRequireExport?: boolean
}

async function writeJsonFile(filePath: string, data: unknown) {
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

async function createFixture(options: FixtureOptions = {}) {
  const baseDir = await mkdtemp(join(tmpdir(), 'sonofmagic-fixed-version-'))
  const includeFixedGroup = options.includeFixedGroup ?? true

  const profileVersion = options.profileVersion ?? '3.0.4'
  const sonofmagicVersion = options.sonofmagicVersion ?? '3.0.4'
  const yangqimingVersion = options.yangqimingVersion ?? '3.0.4'
  const nodeRange = options.nodeRange ?? REQUIRED_NODE_RANGE
  const profileNextNodeRange = options.profileNextNodeRange ?? nodeRange
  const profileDependencySpec = options.profileDependencySpec ?? 'workspace:*'
  const profileMain = options.profileMain ?? './dist/index.mjs'
  const includeRequireExport = options.includeRequireExport ?? false

  const rootExport = {
    types: './dist/index.d.mts',
    import: './dist/index.mjs',
    default: './dist/index.mjs',
    ...(includeRequireExport ? { require: './dist/index.cjs' } : {}),
  }

  await writeJsonFile(join(baseDir, '.changeset', 'config.json'), {
    fixed: includeFixedGroup
      ? [['@icebreakers/profile', 'sonofmagic', 'yangqiming']]
      : [],
  })

  await writeJsonFile(join(baseDir, 'packages', 'profile', 'package.json'), {
    name: '@icebreakers/profile',
    version: profileVersion,
    type: 'module',
    main: profileMain,
    module: './dist/index.mjs',
    types: './dist/index.d.mts',
    exports: {
      '.': rootExport,
    },
    engines: {
      node: nodeRange,
    },
  })

  await writeJsonFile(join(baseDir, 'packages', 'profile-next', 'package.json'), {
    name: '@icebreakers/profile-next',
    version: '0.0.0',
    private: true,
    type: 'module',
    main: './dist/index.mjs',
    module: './dist/index.mjs',
    types: './dist/index.d.mts',
    exports: {
      '.': rootExport,
    },
    engines: {
      node: profileNextNodeRange,
    },
  })

  await writeJsonFile(join(baseDir, 'packages', 'sonofmagic', 'package.json'), {
    name: 'sonofmagic',
    version: sonofmagicVersion,
    type: 'module',
    main: './dist/index.mjs',
    module: './dist/index.mjs',
    types: './dist/index.d.mts',
    exports: {
      '.': rootExport,
    },
    dependencies: {
      '@icebreakers/profile': profileDependencySpec,
    },
    engines: {
      node: nodeRange,
    },
  })

  await writeJsonFile(join(baseDir, 'packages', 'yangqiming', 'package.json'), {
    name: 'yangqiming',
    version: yangqimingVersion,
    type: 'module',
    main: './dist/index.mjs',
    module: './dist/index.mjs',
    types: './dist/index.d.mts',
    exports: {
      '.': rootExport,
    },
    dependencies: {
      '@icebreakers/profile': profileDependencySpec,
    },
    engines: {
      node: nodeRange,
    },
  })

  return baseDir
}

async function runCheck(cwd: string) {
  try {
    const result = await execFileAsync(process.execPath, [SCRIPT_PATH], { cwd })
    return {
      status: 0,
      stdout: result.stdout,
      stderr: result.stderr,
    }
  }
  catch (error) {
    const processError = error as NodeJS.ErrnoException & {
      code?: number
      stdout?: string
      stderr?: string
    }
    return {
      status: typeof processError.code === 'number' ? processError.code : 1,
      stdout: processError.stdout ?? '',
      stderr: processError.stderr ?? '',
    }
  }
}

describe('check-fixed-package-versions script', () => {
  it('returns success when versions and metadata are aligned', async () => {
    const fixtureDir = await createFixture()

    try {
      const result = await runCheck(fixtureDir)
      expect(result.status).toBe(0)
      expect(result.stdout).toContain('[check:fixed-versions] ok (3.0.4)')
      expect(result.stderr).toBe('')
    }
    finally {
      await rm(fixtureDir, { recursive: true, force: true })
    }
  })

  it('fails when fixed package versions are inconsistent', async () => {
    const fixtureDir = await createFixture({
      yangqimingVersion: '3.0.5',
    })

    try {
      const result = await runCheck(fixtureDir)
      expect(result.status).toBe(1)
      expect(result.stderr).toContain('version mismatch detected')
      expect(result.stderr).toContain('yangqiming@3.0.5')
    }
    finally {
      await rm(fixtureDir, { recursive: true, force: true })
    }
  })

  it('fails when package metadata regresses to non-esm shape', async () => {
    const fixtureDir = await createFixture({
      includeRequireExport: true,
      profileMain: './dist/index.js',
    })

    try {
      const result = await runCheck(fixtureDir)
      expect(result.status).toBe(1)
      expect(result.stderr).toContain('main must be ./dist/index.mjs')
      expect(result.stderr).toContain('must not include require')
    }
    finally {
      await rm(fixtureDir, { recursive: true, force: true })
    }
  })
})
