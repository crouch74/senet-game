import { describe, expect, it } from 'vitest'
import {
  applyMove,
  autoPassIfNoMoves,
  getLegalMoves,
  initializeGame,
  isValidMove,
} from './logic'

describe('hounds and jackals logic', () => {
  it('initializes ten pegs in reserve', () => {
    const state = initializeGame()

    expect(state.gameType).toBe('hounds-and-jackals')
    expect(state.board).toHaveLength(10)
    expect(state.board.every((piece) => piece.position === 0)).toBe(true)
    expect(state.winner).toBeNull()
  })

  it('allows any reserve peg to enter on any roll', () => {
    const state = initializeGame()
    const moves = getLegalMoves(
      { ...state, currentThrow: { lightSidesUp: 2, value: 2 } },
      'anubis',
      2,
    )

    expect(moves).toHaveLength(5)
    expect(moves.every((move) => move.targetSquare === 1)).toBe(true)
  })

  it('rejects moves whose linked destination is occupied by your own peg', () => {
    const state = initializeGame()
    state.board.find((piece) => piece.id === 'anubis-peg-1')!.position = 6
    state.board.find((piece) => piece.id === 'anubis-peg-2')!.position = 20

    expect(isValidMove(state, 'anubis-peg-1', 7)).toEqual({
      valid: false,
      reason: 'Linked destination occupied by your own peg',
    })
  })

  it('applies good jumps and logs them', () => {
    const state = initializeGame()
    state.board.find((piece) => piece.id === 'anubis-peg-1')!.position = 5
    state.currentThrow = { lightSidesUp: 1, value: 1 }

    const nextState = applyMove(state, 'anubis-peg-1')

    expect(nextState.board.find((piece) => piece.id === 'anubis-peg-1')?.position).toBe(15)
    expect(nextState.historyLog.slice(-2).map((entry) => entry.eventType)).toEqual([
      'MOVE',
      'GOOD_JUMP',
    ])
  })

  it('applies bad jumps and logs them', () => {
    const state = initializeGame()
    state.board.find((piece) => piece.id === 'anubis-peg-1')!.position = 7
    state.currentThrow = { lightSidesUp: 1, value: 1 }

    const nextState = applyMove(state, 'anubis-peg-1')

    expect(nextState.board.find((piece) => piece.id === 'anubis-peg-1')?.position).toBe(4)
    expect(nextState.historyLog.slice(-2).map((entry) => entry.eventType)).toEqual([
      'MOVE',
      'BAD_JUMP',
    ])
  })

  it('rejects overshoots because exact finish is required', () => {
    const state = initializeGame()
    state.board.find((piece) => piece.id === 'anubis-peg-1')!.position = 29

    expect(isValidMove(state, 'anubis-peg-1', 2)).toEqual({
      valid: false,
      reason: 'Requires exact throw to finish',
    })
  })

  it('auto-passes when no legal move exists', () => {
    const state = initializeGame()
    state.currentThrow = { lightSidesUp: 2, value: 2 }
    state.board.filter((piece) => piece.player === 'anubis').forEach((piece) => {
      piece.position = 29
    })

    const nextState = autoPassIfNoMoves(state)

    expect(nextState.currentPlayer).toBe('sphinx')
    expect(nextState.currentThrow).toBeNull()
    expect(nextState.historyLog.at(-1)?.eventType).toBe('BLOCKED')
  })

  it('wins when all pegs reach the shen goal', () => {
    const state = initializeGame()
    state.board
      .filter((piece) => piece.player === 'anubis')
      .forEach((piece) => {
        piece.position = 30
      })
    state.board.find((piece) => piece.id === 'anubis-peg-1')!.position = 29
    state.currentThrow = { lightSidesUp: 1, value: 1 }

    const nextState = applyMove(state, 'anubis-peg-1')

    expect(nextState.winner).toBe('anubis')
    expect(nextState.historyLog.at(-1)?.eventType).toBe('WIN')
  })
})
