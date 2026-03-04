import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

const fixedPackages = [
  '@icebreakers/profile',
  'sonofmagic',
  'yangqiming',
]
const requiredNodeVersionRange = '^20.19.0 || >=22.12.0'
const requiredEsmMain = './dist/index.mjs'
const requiredEsmTypes = './dist/index.d.mts'

const rootDir = process.cwd()

async function readJson(relativePath) {
  const filePath = resolve(rootDir, relativePath)
  const raw = await readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

function fail(message) {
  process.stderr.write(`[check:fixed-versions] ${message}\n`)
  process.exitCode = 1
}

function getProfileWorkspaceDependency(pkgJson) {
  const dependencySets = [
    pkgJson.dependencies,
    pkgJson.devDependencies,
    pkgJson.peerDependencies,
    pkgJson.optionalDependencies,
  ]

  for (const dependencySet of dependencySets) {
    if (dependencySet && typeof dependencySet === 'object') {
      const value = dependencySet['@icebreakers/profile']
      if (typeof value === 'string') {
        return value
      }
    }
  }

  return null
}

function getRootExport(pkgJson) {
  if (!pkgJson.exports || typeof pkgJson.exports !== 'object') {
    return null
  }

  const rootExport = pkgJson.exports['.']
  if (!rootExport || typeof rootExport !== 'object') {
    return null
  }

  return rootExport
}

function hasFixedGroup(config) {
  if (!Array.isArray(config.fixed)) {
    return false
  }

  return config.fixed.some((group) => {
    if (!Array.isArray(group)) {
      return false
    }
    return fixedPackages.every(pkgName => group.includes(pkgName))
  })
}

async function main() {
  const [changesetConfig, profilePkg, profileNextPkg, sonofmagicPkg, yangqimingPkg] = await Promise.all([
    readJson('.changeset/config.json'),
    readJson('packages/profile/package.json'),
    readJson('packages/profile-next/package.json'),
    readJson('packages/sonofmagic/package.json'),
    readJson('packages/yangqiming/package.json'),
  ])

  if (!hasFixedGroup(changesetConfig)) {
    fail(`missing fixed group in .changeset/config.json for: ${fixedPackages.join(', ')}`)
    return
  }

  const versions = [
    ['@icebreakers/profile', profilePkg.version],
    ['sonofmagic', sonofmagicPkg.version],
    ['yangqiming', yangqimingPkg.version],
  ]

  const uniqueVersions = new Set(versions.map(([, version]) => version))
  if (uniqueVersions.size > 1) {
    const details = versions.map(([name, version]) => `${name}@${version}`).join(', ')
    fail(`version mismatch detected: ${details}`)
    return
  }

  const sharedVersion = versions[0][1]
  const profileDependencySpecs = [
    ['sonofmagic', getProfileWorkspaceDependency(sonofmagicPkg)],
    ['yangqiming', getProfileWorkspaceDependency(yangqimingPkg)],
  ]
  const nodeEnginePackages = [
    ['@icebreakers/profile', profilePkg],
    ['@icebreakers/profile-next', profileNextPkg],
    ['sonofmagic', sonofmagicPkg],
    ['yangqiming', yangqimingPkg],
  ]
  const esmPackages = [
    ['@icebreakers/profile', profilePkg],
    ['@icebreakers/profile-next', profileNextPkg],
    ['sonofmagic', sonofmagicPkg],
    ['yangqiming', yangqimingPkg],
  ]

  let hasErrors = false
  for (const [pkgName, dependencySpec] of profileDependencySpecs) {
    if (dependencySpec !== 'workspace:*') {
      fail(`${pkgName} must depend on @icebreakers/profile as workspace:* (received ${String(dependencySpec)})`)
      hasErrors = true
    }
  }

  for (const [pkgName, pkgJson] of nodeEnginePackages) {
    const actualNodeVersionRange = pkgJson.engines?.node
    if (actualNodeVersionRange !== requiredNodeVersionRange) {
      fail(`${pkgName} engines.node must be ${requiredNodeVersionRange} (received ${String(actualNodeVersionRange)})`)
      hasErrors = true
    }
  }

  for (const [pkgName, pkgJson] of esmPackages) {
    if (pkgJson.type !== 'module') {
      fail(`${pkgName} must set type to module (received ${String(pkgJson.type)})`)
      hasErrors = true
    }

    if (pkgJson.main !== requiredEsmMain) {
      fail(`${pkgName} main must be ${requiredEsmMain} (received ${String(pkgJson.main)})`)
      hasErrors = true
    }

    if (pkgJson.module !== requiredEsmMain) {
      fail(`${pkgName} module must be ${requiredEsmMain} (received ${String(pkgJson.module)})`)
      hasErrors = true
    }

    if (pkgJson.types !== requiredEsmTypes) {
      fail(`${pkgName} types must be ${requiredEsmTypes} (received ${String(pkgJson.types)})`)
      hasErrors = true
    }

    const rootExport = getRootExport(pkgJson)
    if (!rootExport) {
      fail(`${pkgName} must define exports["."] with ESM entrypoints`)
      hasErrors = true
      continue
    }

    if (rootExport.import !== requiredEsmMain) {
      fail(`${pkgName} exports["."].import must be ${requiredEsmMain} (received ${String(rootExport.import)})`)
      hasErrors = true
    }

    if (rootExport.default !== requiredEsmMain) {
      fail(`${pkgName} exports["."].default must be ${requiredEsmMain} (received ${String(rootExport.default)})`)
      hasErrors = true
    }

    if (rootExport.types !== requiredEsmTypes) {
      fail(`${pkgName} exports["."].types must be ${requiredEsmTypes} (received ${String(rootExport.types)})`)
      hasErrors = true
    }

    if ('require' in rootExport) {
      fail(`${pkgName} exports["."] must not include require (CJS is disabled)`)
      hasErrors = true
    }
  }

  if (hasErrors) {
    return
  }

  process.stdout.write(`[check:fixed-versions] ok (${sharedVersion})\n`)
}

await main()
