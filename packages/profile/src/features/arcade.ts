import type { Buffer } from 'node:buffer'
import process from 'node:process'
import { Dic, t } from '../i18n'
import { consoleLog as log } from '../logger'
import { boxen, profileTheme } from '../util'

type MoveDirection = 'up' | 'down' | 'left' | 'right'

interface TileMoveResult {
  line: number[]
  score: number
}

interface BoardMoveResult {
  board: number[][]
  score: number
  moved: boolean
}

interface Game2048State {
  board: number[][]
  score: number
  moves: number
  bestScore: number
  won: boolean
  message: string
  previous?: Pick<Game2048State, 'board' | 'score' | 'moves' | 'won'>
}

const boardSize = 4
const winningTile = 2048
const topTiles = new Set([128, 256, 512, 1024, 2048])

function cloneBoard(board: number[][]) {
  return board.map(row => [...row])
}

function collapseLine(line: number[]): TileMoveResult {
  const compacted = line.filter(value => value > 0)
  const merged: number[] = []
  let score = 0

  for (let index = 0; index < compacted.length; index++) {
    const current = compacted[index] ?? 0
    const next = compacted[index + 1]
    if (current === next) {
      const value = current * 2
      merged.push(value)
      score += value
      index++
    }
    else {
      merged.push(current)
    }
  }

  while (merged.length < line.length) {
    merged.push(0)
  }

  return { line: merged, score }
}

function transposeBoard(board: number[][]) {
  return board[0]!.map((_, columnIndex) => board.map(row => row[columnIndex]!))
}

function reverseRows(board: number[][]) {
  return board.map(row => [...row].reverse())
}

function boardsEqual(left: number[][], right: number[][]) {
  return left.every((row, rowIndex) => row.every((cell, columnIndex) => cell === right[rowIndex]?.[columnIndex]))
}

function moveBoard(board: number[][], direction: MoveDirection): BoardMoveResult {
  let working = board.map(row => [...row])

  if (direction === 'right') {
    working = reverseRows(working)
  }
  else if (direction === 'up') {
    working = transposeBoard(working)
  }
  else if (direction === 'down') {
    working = reverseRows(transposeBoard(working))
  }

  let score = 0
  const movedBoard = working.map((row) => {
    const result = collapseLine(row)
    score += result.score
    return result.line
  })

  let normalized = movedBoard
  if (direction === 'right') {
    normalized = reverseRows(normalized)
  }
  else if (direction === 'up') {
    normalized = transposeBoard(normalized)
  }
  else if (direction === 'down') {
    normalized = transposeBoard(reverseRows(normalized))
  }

  return {
    board: normalized,
    score,
    moved: !boardsEqual(board, normalized),
  }
}

function getEmptyCells(board: number[][]) {
  const cells: Array<{ row: number, column: number }> = []
  for (let row = 0; row < board.length; row++) {
    for (let column = 0; column < board[row]!.length; column++) {
      if (board[row]![column] === 0) {
        cells.push({ row, column })
      }
    }
  }
  return cells
}

function addRandomTile(board: number[][], random = Math.random) {
  const nextBoard = cloneBoard(board)
  const cells = getEmptyCells(nextBoard)
  if (cells.length === 0) {
    return nextBoard
  }

  const target = cells[Math.floor(random() * cells.length)]!
  nextBoard[target.row]![target.column] = random() < 0.9 ? 2 : 4
  return nextBoard
}

function createInitial2048Board(random = Math.random) {
  const board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }).fill(0) as number[])
  return addRandomTile(addRandomTile(board, random), random)
}

function canMove(board: number[][]) {
  if (getEmptyCells(board).length > 0) {
    return true
  }

  for (const direction of ['up', 'down', 'left', 'right'] as const) {
    if (moveBoard(board, direction).moved) {
      return true
    }
  }
  return false
}

function getMaxTile(board: number[][]) {
  return Math.max(...board.flat())
}

function parse2048Input(input: Buffer | string): MoveDirection | 'quit' | 'restart' | 'undo' | null {
  const value = input.toString()
  if (value.includes('\u001B[A') || value.toLowerCase().includes('w')) {
    return 'up'
  }
  if (value.includes('\u001B[B') || value.toLowerCase().includes('s')) {
    return 'down'
  }
  if (value.includes('\u001B[D') || value.toLowerCase().includes('a')) {
    return 'left'
  }
  if (value.includes('\u001B[C') || value.toLowerCase().includes('d')) {
    return 'right'
  }
  if (value.includes('\u0003') || value.toLowerCase().includes('q') || value.includes('\u001B')) {
    return 'quit'
  }
  if (value.toLowerCase().includes('r')) {
    return 'restart'
  }
  if (value.toLowerCase().includes('u')) {
    return 'undo'
  }
  return null
}

function createInitial2048State(random = Math.random, bestScore = 0): Game2048State {
  return {
    board: createInitial2048Board(random),
    score: 0,
    moves: 0,
    bestScore,
    won: false,
    message: '',
  }
}

function apply2048Move(state: Game2048State, direction: MoveDirection, random = Math.random): Game2048State {
  const result = moveBoard(state.board, direction)
  if (!result.moved) {
    return {
      ...state,
      board: cloneBoard(state.board),
      message: t(Dic.arcade.games.game2048.noMove) as string,
    }
  }

  const board = addRandomTile(result.board, random)
  const score = state.score + result.score
  const maxTile = getMaxTile(board)
  const won = state.won || maxTile >= winningTile

  return {
    board,
    score,
    moves: state.moves + 1,
    bestScore: Math.max(state.bestScore, score),
    won,
    message: !state.won && won ? t(Dic.arcade.games.game2048.win) as string : '',
    previous: {
      board: cloneBoard(state.board),
      score: state.score,
      moves: state.moves,
      won: state.won,
    },
  }
}

function undo2048Move(state: Game2048State): Game2048State {
  if (!state.previous) {
    return {
      ...state,
      board: cloneBoard(state.board),
      message: t(Dic.arcade.games.game2048.noUndo) as string,
    }
  }

  const { previous: _previous, ...rest } = state

  return {
    ...rest,
    board: cloneBoard(state.previous.board),
    score: state.previous.score,
    moves: state.previous.moves,
    won: state.previous.won,
    message: t(Dic.arcade.games.game2048.undo) as string,
  }
}

function colorTileValue(value: string, tile: number) {
  if (tile === 0) {
    return profileTheme.colors.secondary(value)
  }
  if (tile <= 4) {
    return profileTheme.colors.primaryStrong(value)
  }
  if (tile <= 32) {
    return profileTheme.colors.accentStrong(value)
  }
  if (topTiles.has(tile)) {
    return profileTheme.colors.successStrong(value)
  }
  if (tile <= 128) {
    return profileTheme.colors.secondaryStrong(value)
  }
  return profileTheme.colors.successStrong(value)
}

function renderTile(tile: number, cellWidth: number) {
  const value = tile === 0 ? '·' : String(tile)
  const padded = ` ${value.padStart(Math.floor((cellWidth - 2 + value.length) / 2)).padEnd(cellWidth - 2)} `
  return colorTileValue(padded, tile)
}

function render2048Board(state: Game2048State) {
  const cellWidth = 8
  const horizontal = profileTheme.colors.secondary(`${'─'.repeat(cellWidth * boardSize + boardSize + 1)}`)
  const rows = state.board.map((row) => {
    const cells = row.map(cell => renderTile(cell, cellWidth)).join(profileTheme.colors.secondary('│'))
    return `${profileTheme.colors.secondary('│')}${cells}${profileTheme.colors.secondary('│')}`
  })
  const boardRows = rows.flatMap(row => [horizontal, row])
  boardRows.push(horizontal)
  const statusLine = [
    `${t(Dic.arcade.score)} ${profileTheme.colors.primaryStrong(String(state.score))}`,
    `${t(Dic.arcade.games.game2048.bestScore)} ${profileTheme.colors.accentStrong(String(state.bestScore))}`,
    `${t(Dic.arcade.games.game2048.moves)} ${profileTheme.colors.secondaryStrong(String(state.moves))}`,
    `${t(Dic.arcade.games.game2048.bestTile)} ${profileTheme.colors.successStrong(String(getMaxTile(state.board)))}`,
  ].join(profileTheme.colors.secondary('  ·  '))
  const message = state.message
    ? ['', profileTheme.colors.accentStrong(state.message)]
    : getMaxTile(state.board) >= winningTile
      ? ['', profileTheme.colors.successStrong(t(Dic.arcade.games.game2048.keepGoing) as string)]
      : []

  return boxen([
    profileTheme.colors.heading(t(Dic.arcade.games.game2048.title) as string),
    '',
    statusLine,
    '',
    ...boardRows,
    ...message,
  ].join('\n'), {
    borderStyle: 'round',
    borderColor: 'cyan',
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
  })
}

async function run2048Game() {
  const stdin = process.stdin
  const stdout = process.stdout
  const canUseRawMode = Boolean(stdin.isTTY && typeof stdin.setRawMode === 'function')

  if (!canUseRawMode) {
    log(profileTheme.colors.accentStrong(t(Dic.arcade.games.game2048.rawModeUnavailable) as string))
    return
  }

  await new Promise<void>((resolve) => {
    let state = createInitial2048State()
    let stopped = false
    const wasRaw = stdin.isRaw
    const restoreHandlers: Array<() => void> = []
    let stopGame = () => {}

    const renderFrame = () => {
      stdout.write([
        '\u001B[H',
        render2048Board(state),
        '\n',
        profileTheme.colors.secondary(t(Dic.arcade.games.game2048.controls) as string),
        '\u001B[J',
      ].join(''))
    }

    const handleSignal = () => {
      stopGame()
    }
    process.once('SIGINT', handleSignal)
    process.once('SIGTERM', handleSignal)
    restoreHandlers.push(() => {
      process.off('SIGINT', handleSignal)
      process.off('SIGTERM', handleSignal)
    })

    const onData = (input: Buffer) => {
      const action = parse2048Input(input)
      if (action === 'quit') {
        stopGame()
        return
      }
      if (!action) {
        return
      }
      if (action === 'restart') {
        state = createInitial2048State(undefined, state.bestScore)
        state.message = t(Dic.arcade.games.game2048.restart) as string
        renderFrame()
        return
      }
      if (action === 'undo') {
        state = undo2048Move(state)
        renderFrame()
        return
      }

      state = apply2048Move(state, action)
      renderFrame()
      if (!canMove(state.board)) {
        state.message = t(Dic.arcade.games.game2048.noMoves) as string
        renderFrame()
        stopGame()
      }
    }

    stopGame = () => {
      if (stopped) {
        return
      }
      stopped = true
      stdin.off('data', onData)
      stdin.setRawMode(Boolean(wasRaw))
      for (const restoreHandler of restoreHandlers) {
        restoreHandler()
      }
      stdout.write('\u001B[?25h\u001B[?1049l')
      log(profileTheme.colors.success(t(Dic.arcade.gameOver, { score: state.score }) as string))
      resolve()
    }

    stdout.write('\u001B[?1049h\u001B[?25l\u001B[2J\u001B[H')
    stdin.setRawMode(true)
    stdin.resume()
    stdin.on('data', onData)
    renderFrame()
  })
}

export async function showArcade() {
  await run2048Game()
}

/** @internal */
export const arcadeInternal = {
  addRandomTile,
  apply2048Move,
  canMove,
  collapseLine,
  colorTileValue,
  createInitial2048State,
  createInitial2048Board,
  getMaxTile,
  moveBoard,
  parse2048Input,
  render2048Board,
  renderTile,
  undo2048Move,
}
