#!/usr/bin/env node

const process = require('node:process')
const { name, version } = require('../package.json')

void (async () => {
  const { runCli } = await import('@icebreakers/profile')
  await runCli({
    name,
    version,
  })
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
