import process from 'node:process'

export function _isUnicodeSupported() {
  if (process.platform !== 'win32') {
    return process.env.TERM !== 'linux' // Linux console (kernel)
  }

  return (
    Boolean(process.env.CI)
    || Boolean(process.env.WT_SESSION) // Windows Terminal
    || Boolean(process.env.TERMINUS_SUBLIME) // Terminus (<0.2.27)
    || process.env.ConEmuTask === '{cmd::Cmder}' // ConEmu and cmder
    || process.env.TERM_PROGRAM === 'Terminus-Sublime'
    || process.env.TERM_PROGRAM === 'vscode'
    || process.env.TERM === 'xterm-256color'
    || process.env.TERM === 'alacritty'
    || process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm'
  )
}
function _isInteractive({ stream = process.stdout } = {}) {
  return Boolean(stream && stream.isTTY && process.env.TERM !== 'dumb' && !('CI' in process.env))
}

export const isInteractive = _isInteractive()
export const isUnicodeSupported = _isUnicodeSupported()
