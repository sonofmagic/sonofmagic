#!/usr/bin/env node

import process from 'node:process'
import { runCli } from '../dist/index.mjs'

async function main() {
  await runCli({
    name: 'profile',
  })
}

void main().catch((error) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
