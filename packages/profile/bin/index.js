#!/usr/bin/env node

const process = require('node:process')
const { version } = require('../package.json')

void (async () => {
  const { runCli } = await import('../dist/index.mjs')
  await runCli({
    name: 'profile',
    version,
  })
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
