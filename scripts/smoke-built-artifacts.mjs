import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const env = { ...process.env, CI: '1', FORCE_COLOR: '0', TERM: 'dumb' }
delete env.NO_COLOR
delete env.NODE_PATH

function runNode(args, cwd = root) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    env,
    encoding: 'utf8',
    timeout: 10_000,
  })
  assert.ifError(result.error)
  assert.equal(result.status, 0, `${args.join(' ')} failed:\n${result.stderr}\n${result.stdout}`)
  return result.stdout
}

async function readPackage(name) {
  return JSON.parse(await readFile(join(root, 'packages', name, 'package.json'), 'utf8'))
}

async function verifyPublicTypes(sandbox) {
  const installed = new Map()

  async function copyDependency(name, sourcePackage, consumerPackage) {
    const sourceRequire = createRequire(join(sourcePackage, 'package.json'))
    const source = await realpath(dirname(sourceRequire.resolve(`${name}/package.json`)))
    const pkg = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'))
    const existing = installed.get(name)
    if (existing?.version === pkg.version) {
      return
    }
    const destination = existing
      ? join(consumerPackage, 'node_modules', name)
      : join(sandbox, 'node_modules', name)
    if (!existing) {
      installed.set(name, { version: pkg.version })
    }
    await cp(source, destination, {
      recursive: true,
      filter: path => basename(path) !== 'node_modules',
    })
    for (const dependency of Object.keys(pkg.dependencies ?? {})) {
      await copyDependency(dependency, source, destination)
    }
  }

  for (const name of ['profile', 'sonofmagic', 'yangqiming', 'ascii', 'svg']) {
    const pkg = await readPackage(name)
    for (const [dependency, specifier] of Object.entries(pkg.dependencies ?? {})) {
      if (!specifier.startsWith('workspace:')) {
        await copyDependency(dependency, join(root, 'packages', name), join(sandbox, 'node_modules', pkg.name))
      }
    }
  }

  await writeFile(join(sandbox, 'consumer.mts'), `
    import { boxen, dayjs, getProfileExperienceYears, prompts, runCli } from '@icebreakers/profile'
    import { bar as sonofmagic } from 'sonofmagic'
    import { bar as yangqiming } from 'yangqiming'
    import { buildProfileBanner } from '@icebreakers/ascii'
    import { createHeroSvg } from '@icebreakers/svg'
    const years: number = getProfileExperienceYears(dayjs())
    const banner: string = boxen(buildProfileBanner(String(years)))
    const svg: string = createHeroSvg({ title: banner })
    const response: Promise<{ name: unknown }> = prompts({ type: 'text', name: 'name' })
    const wrappers: [string, string] = [sonofmagic(), yangqiming()]
    void [runCli, wrappers, svg, response]
  `)
  await writeFile(join(sandbox, 'consumer.cts'), `
    import { buildProfileBanner } from '@icebreakers/ascii'
    import { createHeroSvg } from '@icebreakers/svg'
    const banner: string = buildProfileBanner('2026-11-06')
    const svg: string = createHeroSvg({ title: banner })
    void svg
  `)
  await writeFile(join(sandbox, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      noEmit: true,
      strict: true,
      skipLibCheck: false,
      module: 'NodeNext',
      target: 'ESNext',
      types: ['node'],
    },
    include: ['consumer.mts', 'consumer.cts'],
  }))
  runNode([require.resolve('typescript/bin/tsc'), '--pretty', 'false', '--project', join(sandbox, 'tsconfig.json')], sandbox)
  console.log('[smoke] Types: isolated ESM/CJS consumers compiled with production dependencies only')
}

async function verifyPublishedArtifacts() {
  const sandbox = await mkdtemp(join(tmpdir(), 'sonofmagic-built-smoke-'))

  try {
    for (const name of ['profile', 'sonofmagic', 'yangqiming', 'ascii', 'svg']) {
      const pkg = await readPackage(name)
      const source = join(root, 'packages', name)
      const destination = join(sandbox, 'node_modules', pkg.name)
      await mkdir(destination, { recursive: true })
      for (const entry of ['package.json', ...pkg.files]) {
        await cp(join(source, entry), join(destination, entry), { recursive: true })
      }
    }

    for (const name of ['profile', 'sonofmagic', 'yangqiming']) {
      const pkg = await readPackage(name)
      const pkgRoot = join(sandbox, 'node_modules', pkg.name)
      const bin = join(pkgRoot, 'bin/index.js')
      assert.ok(runNode([bin, '--help'], sandbox).includes(`${name}/${pkg.version}`))
      assert.ok(runNode([bin, '--version'], sandbox).includes(`${name}/${pkg.version}`))
      assert.match(runNode([bin, 'summary', '--lang', 'en'], sandbox), /position: Full-stack Architect \/ Technical Lead/)
      assert.match(runNode([bin, 'summary', '--lang', 'zh'], sandbox), /position: 全栈架构工程师 \/ 技术负责人/)
      assert.ok(runNode([bin, 'links'], sandbox).includes('https://github.com/sonofmagic'))
      const health = JSON.parse(runNode([bin, 'health', '--json'], sandbox))
      assert.equal(health.ok, true)
      assert.ok(health.checks.length > 0)
      assert.ok(health.checks.every(check => check.status === 'ok'))
      const qr = runNode([bin, 'qr', 'website'], sandbox)
      assert.ok(qr.length > 100 && qr.split('\n').length > 10, `${name} did not render a QR code`)
      for (const entry of [pkg.main, pkg.types, pkg.exports['.'].types]) {
        assert.ok((await readFile(join(pkgRoot, entry), 'utf8')).length > 0)
      }
      console.log(`[smoke] ${name}: help, version, languages, links, health and QR passed`)
    }

    for (const name of ['ascii', 'svg']) {
      const pkg = await readPackage(name)
      const pkgRoot = join(sandbox, 'node_modules', pkg.name)
      const rootExport = pkg.exports['.']
      const esm = await import(pathToFileURL(join(pkgRoot, rootExport.import.default)).href)
      const cjs = require(join(pkgRoot, rootExport.require.default))
      if (name === 'ascii') {
        assert.equal(esm.buildProfileBanner('2026-11-06'), cjs.buildProfileBanner('2026-11-06'))
        assert.ok(esm.buildProfileBanner('2026-11-06').includes('updated 2026-11-06'))
      }
      else {
        assert.equal(esm.createHeroSvg(), cjs.createHeroSvg())
        assert.equal(esm.createQrCodeSvg('https://example.com'), cjs.createQrCodeSvg('https://example.com'))
        assert.ok(esm.createHeroSvg().startsWith('<svg'))
      }
      for (const declaration of [rootExport.import.types, rootExport.require.types]) {
        assert.match(await readFile(join(pkgRoot, declaration), 'utf8'), /export/)
      }
      console.log(`[smoke] ${name}: ESM, CJS and declarations passed`)
    }

    const profile = await import(pathToFileURL(join(sandbox, 'node_modules/@icebreakers/profile/dist/index.mjs')).href)
    const narrowBox = profile.boxen('窄终端 English words '.repeat(4), { width: 30, padding: 1, borderStyle: 'round' })
    assert.match(narrowBox, /[╭╮╰╯]/)
    assert.ok(narrowBox.split('\n').every(line => profile.terminalDisplayWidth(line) <= 30))
    const qrBox = profile.renderQrcodeBox('█ ▄ ▀\n▀ █ ▄', { width: 30, margin: 0 })
    assert.match(qrBox, /[╭╮╰╯]/)
    assert.ok(qrBox.split('\n').every(line => profile.terminalDisplayWidth(line) <= 30))
    console.log('[smoke] Boxen: narrow terminal, Unicode borders and QR box passed')
    await verifyPublicTypes(sandbox)
  }
  finally {
    await rm(sandbox, { recursive: true, force: true })
  }
}

await verifyPublishedArtifacts()

const inkResult = runNode(['--input-type=module', '--eval', `
  import assert from 'node:assert/strict'
  import { createRequire } from 'node:module'
  import { PassThrough } from 'node:stream'
  import { pathToFileURL } from 'node:url'
  const require = createRequire(${JSON.stringify(join(root, 'packages/profile-next/package.json'))})
  const React = require('react')
  const { render } = await import(pathToFileURL(require.resolve('ink')).href)
  const { Counter } = await import(${JSON.stringify(pathToFileURL(join(root, 'packages/profile-next/dist/index.mjs')).href)})
  const stream = new PassThrough()
  let output = ''
  stream.on('data', chunk => { output += chunk.toString() })
  const app = render(React.createElement(Counter), {
    stdout: stream,
    stderr: stream,
    debug: true,
    patchConsole: false,
    exitOnCtrlC: false,
  })
  const deadline = Date.now() + 3_000
  while (!/[1-9]\\d* tests passed/.test(output)) {
    assert.ok(Date.now() < deadline, 'Ink did not update the counter')
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  app.unmount()
  app.cleanup()
  process.stdout.write('ink-rendered-and-unmounted\\n')
`])
assert.ok(inkResult.includes('ink-rendered-and-unmounted'))
console.log('[smoke] Ink: rendered updates, unmounted and exited without active timer handles')
