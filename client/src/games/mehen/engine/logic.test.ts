import { describe, expect, it } from 'vitest'
import type { GameState, MehenConfig } from '../../../engine/types'
import {
  DEFAULT_MEHEN_CONFIG,
  applyMove,
  autoPassIfNoMoves,
  getLegalMoves,
  initializeGame,
  isGameOver,
  isProtected,
  isValidMove,
  rollDice,
} from './logic'

const setupState = (
  config: Partial<MehenConfig> = {},
  players: GameState['players'] = ['anubis', 'sphinx'],
) => initializeGame(config, players)

describe('mehen logic', () => {
  it('initializes a configurable 2-6 player game', () => {
    const state = setupState({ ballsPerPlayer: 3, boardSize: 40 }, [
      'anubis',
      'sphinx',
      'horus',
      'seth',
    ])

    expect(state.players).toEqual(['anubis', 'sphinx', 'horus', 'seth'])
    expect(state.board).toHaveLength(16)
    expect(state.boardSize).toBe(40)
    expect(state.currentPlayer).toBe('anubis')
  })

  it('uses a deterministic dice roll for a given seed', () => {
    expect(rollDice(42)).toEqual(rollDice(42))
    expect(rollDice(42).value).toBeGreaterThanOrEqual(1)
    expect(rollDice(42).value).toBeLessThanOrEqual(5)
  })

  it('returns legal moves for the active player and roll', () => {
    const state = setupState()
    const moves = getLegalMoves(state, 'anubis', 3)

    expect(moves).toHaveLength(6)
    expect(moves.every((move) => move.player === 'anubis')).toBe(true)
    expect(moves.every((move) => move.destination === 1)).toBe(true)
  })

  it('enters a piece onto the start space before normal forward movement', () => {
    const state = setupState()
    state.currentThrow = { value: 4, lightSidesUp: 4 }

    const entered = applyMove(state, 'anubis-ball-1')
    expect(entered.board.find((piece) => piece.id === 'anubis-ball-1')?.position).toBe(1)

    const advanced = applyMove(
      {
        ...entered,
        currentPlayer: 'anubis',
        currentThrow: { value: 3, lightSidesUp: 3 },
      },
      'anubis-ball-1',
    )
    expect(advanced.board.find((piece) => piece.id === 'anubis-ball-1')?.position).toBe(4)
  })

  it('blocks overshoots when exact finish is required', () => {
    const state = setupState()
    const piece = state.board.find((candidate) => candidate.id === 'anubis-ball-1')!
    piece.position = 58

    expect(isValidMove(state, piece.id, 3)).toEqual({
      valid: false,
      reason: 'Requires exact roll to finish',
    })
    expect(isValidMove(state, piece.id, 2)).toEqual({
      valid: true,
      targetSquare: 60,
    })
  })

  it('bounces back when the bounce variant is enabled', () => {
    const state = setupState({ exactFinish: false, allowBounce: true })
    const piece = state.board.find((candidate) => candidate.id === 'anubis-ball-1')!
    piece.position = 59

    expect(isValidMove(state, piece.id, 3)).toEqual({
      valid: true,
      targetSquare: 58,
    })
  })

  it('captures opponent balls and logs the move deterministically', () => {
    const state = setupState()
    const lion = state.board.find((piece) => piece.id === 'anubis-lion')!
    const target = state.board.find((piece) => piece.id === 'sphinx-ball-1')!
    lion.position = 2
    target.position = 5
    state.currentThrow = { value: 3, lightSidesUp: 3 }

    const nextState = applyMove(state, 'anubis-lion')

    expect(nextState.board.find((piece) => piece.id === 'anubis-lion')?.position).toBe(5)
    expect(nextState.board.find((piece) => piece.id === 'sphinx-ball-1')?.position).toBe(0)
    expect(nextState.historyLog.slice(-2).map((entry) => entry.eventType)).toEqual([
      'MOVE',
      'CAPTURE',
    ])
  })

  it('supports swap capture mode', () => {
    const state = setupState({ captureMode: 'SWAP_POSITIONS' })
    const lion = state.board.find((piece) => piece.id === 'anubis-lion')!
    const target = state.board.find((piece) => piece.id === 'sphinx-ball-1')!
    lion.position = 2
    target.position = 5

    const nextState = applyMove(state, {
      pieceId: lion.id,
      player: 'anubis',
      roll: 3,
      destination: 5,
      targetSquare: 5,
    })

    expect(nextState.board.find((piece) => piece.id === 'anubis-lion')?.position).toBe(5)
    expect(nextState.board.find((piece) => piece.id === 'sphinx-ball-1')?.position).toBe(2)
  })

  it('rejects move objects for players whose turn it is not', () => {
    const state = setupState()
    const originalState = structuredClone(state)

    const nextState = applyMove(state, {
      pieceId: 'sphinx-ball-1',
      player: 'sphinx',
      roll: 2,
      destination: 2,
      targetSquare: 2,
    })

    expect(nextState).toEqual(originalState)
  })

  it('treats safe and lion-adjacent balls as protected', () => {
    const state = setupState()
    const ownBall = state.board.find((piece) => piece.id === 'anubis-ball-1')!
    const enemyBall = state.board.find((piece) => piece.id === 'sphinx-ball-1')!
    const enemyLion = state.board.find((piece) => piece.id === 'sphinx-lion')!

    enemyBall.position = 10
    expect(isProtected(state, enemyBall)).toBe(true)

    enemyBall.position = 4
    enemyLion.position = 5
    ownBall.position = 1
    expect(isProtected(state, enemyBall)).toBe(true)
    expect(isValidMove(state, 'anubis-ball-1', 3)).toEqual({
      valid: false,
      reason: 'Opponent piece is protected',
    })
  })

  it('enforces single occupancy even on safe cells', () => {
    const state = setupState()
    const ownBall = state.board.find((piece) => piece.id === 'anubis-ball-1')!
    const otherOwnBall = state.board.find((piece) => piece.id === 'anubis-ball-2')!
    ownBall.position = 10
    otherOwnBall.position = 7

    expect(isValidMove(state, otherOwnBall.id, 3)).toEqual({
      valid: false,
      reason: 'Target occupied by your own piece',
    })
  })

  it('prevents opponent balls from passing a blocking lion', () => {
    const state = setupState()
    const ownBall = state.board.find((piece) => piece.id === 'anubis-ball-1')!
    const ownLion = state.board.find((piece) => piece.id === 'anubis-lion')!
    const enemyLion = state.board.find((piece) => piece.id === 'sphinx-lion')!
    ownBall.position = 1
    ownLion.position = 1
    enemyLion.position = 3

    expect(isValidMove(state, 'anubis-ball-1', 4)).toEqual({
      valid: false,
      reason: 'Path blocked by opponent lion at 3',
    })
    expect(isValidMove(state, 'anubis-lion', 4)).toEqual({
      valid: true,
      targetSquare: 5,
    })
  })

  it('rotates turns across more than two players and grants extra turns', () => {
    const state = setupState({}, ['anubis', 'sphinx', 'horus'])

    const extraTurnState = applyMove(
      { ...state, currentThrow: { value: 5, lightSidesUp: 0 } },
      'anubis-ball-1',
    )
    expect(extraTurnState.currentPlayer).toBe('anubis')

    const rotatedState = applyMove(
      { ...extraTurnState, currentThrow: { value: 3, lightSidesUp: 3 } },
      'anubis-ball-1',
    )
    expect(rotatedState.currentPlayer).toBe('sphinx')

    const sphinxTurn = applyMove(
      { ...rotatedState, currentThrow: { value: 2, lightSidesUp: 2 } },
      'sphinx-ball-1',
    )
    expect(sphinxTurn.currentPlayer).toBe('horus')
  })

  it('auto-passes blocked turns', () => {
    const state = setupState()
    const enemyLion = state.board.find((piece) => piece.id === 'sphinx-lion')!
    enemyLion.position = 1
    state.currentThrow = { value: 1, lightSidesUp: 1 }

    const blocked = autoPassIfNoMoves(state)

    expect(blocked.currentPlayer).toBe('sphinx')
    expect(blocked.currentThrow).toBeNull()
    expect(blocked.historyLog.at(-1)?.eventType).toBe('BLOCKED')
  })

  it('detects configured win conditions', () => {
    const state = setupState({ winCondition: 'BALLS_ONLY' })
    const balls = state.board.filter((piece) => piece.player === 'anubis' && piece.type === 'ball')
    balls.forEach((piece) => {
      piece.position = 60
    })
    balls[0].position = 59
    state.currentThrow = { value: 1, lightSidesUp: 1 }

    const won = applyMove(state, balls[0].id)

    expect(won.winner).toBe('anubis')
    expect(isGameOver(won)).toBe(true)
    expect(won.historyLog.at(-1)?.eventType).toBe('WIN')
  })

  it('can replay a full simulated match from deterministic seeds', () => {
    let state = setupState()
    let seed = 11
    let turns = 0

    while (!state.winner && turns < 400) {
      const roll = rollDice(seed)
      seed += 1
      state = { ...state, currentThrow: roll }
      const legalMoves = getLegalMoves(state, state.currentPlayer, roll.value)

      if (legalMoves.length === 0) {
        state = autoPassIfNoMoves(state)
      } else {
        state = applyMove(state, legalMoves[0])
      }

      turns += 1
    }

    expect(turns).toBeGreaterThan(0)
    expect(
      state.historyLog.every(
        (entry) =>
          entry.eventType === undefined ||
          entry.turn !== undefined ||
          entry.eventType === 'BLOCKED',
      ),
    ).toBe(true)
  })
})
