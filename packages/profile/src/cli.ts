import type { SupportedLanguage } from './i18n'
import process from 'node:process'
import { cac } from 'cac'
import packageJson from '../package.json'
import { runDirectCommand } from './direct-commands'
import { getSupportedLanguages } from './i18n'
import { consoleError as errorLog } from './logger'
import { main } from './program'

type CliOptionsRecord = Record<string, unknown>

export interface RunCliOptions {
  argv?: string[]
  name?: string
  version?: string
}

function formatOptionKey(optionKey: string) {
  return optionKey.length === 1 ? `-${optionKey}` : `--${optionKey}`
}

function findUnknownOptionKeys(options: CliOptionsRecord, allowedOptionKeys: Set<string>) {
  return Object.keys(options).filter(optionKey => optionKey !== '--' && !allowedOptionKeys.has(optionKey))
}

function resolveCliLanguage(value: unknown): SupportedLanguage | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new TypeError('Invalid language option. Expected a string value.')
  }

  const normalized = value.trim().toLowerCase().replaceAll('_', '-')
  if (!normalized) {
    return undefined
  }

  const supportedLanguages = getSupportedLanguages()
  const matched = supportedLanguages.find(
    language => normalized === language || normalized.startsWith(`${language}-`),
  )

  if (!matched) {
    throw new Error(`Unsupported language "${value}". Supported languages: ${supportedLanguages.join(', ')}`)
  }

  return matched
}

export async function runCli(runOptions: RunCliOptions = {}) {
  const argv = runOptions.argv ?? process.argv
  const cliName = runOptions.name ?? 'profile'
  const cliVersion = runOptions.version ?? packageJson.version

  const cli = cac(cliName)
  cli.usage('[command] [options]')
  cli.command('summary', 'Print profile summary and exit')
  cli.command('links', 'Print all public links and exit')
  cli.command('contact', 'Print contact links and exit')
  cli.command('url <target>', 'Print a single public url and exit')
  cli.option('-l, --lang <language>', `Specify language (${getSupportedLanguages().join('|')})`)
  cli.help()
  if (cliVersion) {
    cli.version(cliVersion)
  }
  cli.example(bin => `$ ${bin} summary --lang en`)
  cli.example(bin => `$ ${bin} links`)
  cli.example(bin => `$ ${bin} url github`)
  cli.example(bin => `$ ${bin} --lang en`)
  cli.example(bin => `$ ${bin} --lang zh`)

  const allowedOptionKeys = new Set<string>(['lang', 'l', 'help', 'h'])
  if (cliVersion) {
    allowedOptionKeys.add('version')
    allowedOptionKeys.add('v')
  }

  let shouldOutputHelp = false

  try {
    const parsed = cli.parse(argv, { run: false })
    if (parsed.options['help'] || parsed.options['version']) {
      return
    }

    const unknownOptionKeys = findUnknownOptionKeys(parsed.options, allowedOptionKeys)
    if (unknownOptionKeys.length > 0) {
      shouldOutputHelp = true
      throw new Error(`Unknown option: ${formatOptionKey(unknownOptionKeys[0]!)}`)
    }

    const language = resolveCliLanguage(parsed.options['lang'])
    const matchedCommandName = cli.matchedCommand?.name
    if (matchedCommandName) {
      shouldOutputHelp = true
      await runDirectCommand({
        command: matchedCommandName,
        args: parsed.args,
        language,
      })
      return
    }

    if (parsed.args.length > 0) {
      shouldOutputHelp = true
      throw new Error(`Unknown command: ${parsed.args.join(' ')}`)
    }

    await main(language ? { language } : undefined)
  }
  catch (error) {
    errorLog(error instanceof Error ? error.message : error)
    if (shouldOutputHelp) {
      cli.outputHelp()
    }
    process.exitCode = 1
  }
}

/** @internal */
export const cliInternal = {
  formatOptionKey,
  findUnknownOptionKeys,
  resolveCliLanguage,
}
