/* eslint-disable no-console */

export const logger = {
  log: (...args: unknown[]) => {
    console.log(...args)
  },
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}

export const { log: consoleLog, warn: consoleWarn, error: consoleError } = logger
