#!/usr/bin/env node

import process from 'node:process'
import { runCli } from '@icebreakers/profile'

async function main() {
  await runCli({
    name: 'sonofmagic',
  })
}

void main().catch((error) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
