#!/usr/bin/env node

import process from 'node:process'
import { runCli } from '@icebreakers/profile'

async function main() {
  await runCli({
    name: 'sonofmagic',
  })
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
