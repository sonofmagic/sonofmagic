import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

const fixedPackages = [
  '@icebreakers/profile',
  'sonofmagic',
  'yangqiming',
]

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
  const [changesetConfig, profilePkg, sonofmagicPkg, yangqimingPkg] = await Promise.all([
    readJson('.changeset/config.json'),
    readJson('packages/profile/package.json'),
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
  process.stdout.write(`[check:fixed-versions] ok (${sharedVersion})\n`)
}

await main()
