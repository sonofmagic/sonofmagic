#!/usr/bin/env node

import process from 'node:process'
import { runCli } from '../dist/index.mjs'

async function main() {
  await runCli({
    name: 'profile',
  })
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
