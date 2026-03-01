import { describe, expect, it, vi } from 'vitest'
import {
  applyMove,
  autoPassIfNoMoves,
  createInitialState,
  getLegalMoves,
  getThrowResult,
  isValidMove,
} from './logic'

describe('ur logic', () => {
  it('initializes fourteen reserve tokens and ur config', () => {
    const state = createInitialState()

    expect(state.gameType).toBe('ur')
    expect(state.board).toHaveLength(14)
    expect(state.board.every((piece) => piece.position === 0)).toBe(true)
    expect(state.urConfig?.piecesPerPlayer).toBe(7)
  })

  it('returns binary dice throws from 0 to 4', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.2)

    expect(getThrowResult()).toEqual({
      binaryDice: [true, false, true, false],
      lightSidesUp: 2,
      value: 2,
    })

    vi.restoreAllMocks()
  })

  it('allows reserve entry when the opening court is clear', () => {
    const state = createInitialState()
    const moves = getLegalMoves(
      { ...state, currentThrow: { value: 3, lightSidesUp: 3, binaryDice: [true, true, true, false] } },
      'anubis',
      3,
    )

    expect(moves).toHaveLength(7)
    expect(moves.every((move) => move.targetSquare === 1)).toBe(true)
  })

  it('blocks reserve entry when your opening court is occupied', () => {
    const state = createInitialState()
    state.board.find((piece) => piece.id === 'anubis-ur_token-1')!.position = 1

    expect(isValidMove(state, 'anubis-ur_token-2', 2)).toEqual({
      valid: false,
      reason: 'no_piece_can_enter',
    })
  })

  it('blocks landing on your own piece', () => {
    const state = createInitialState()
    state.board.find((piece) => piece.id === 'anubis-ur_token-1')!.position = 4
    state.board.find((piece) => piece.id === 'anubis-ur_token-2')!.position = 6

    expect(isValidMove(state, 'anubis-ur_token-1', 2)).toEqual({
      valid: false,
      reason: 'target_occupied_by_own_piece',
    })
  })

  it('captures an opposing token on the shared road', () => {
    const state = createInitialState()
    state.board.find((piece) => piece.id === 'anubis-ur_token-1')!.position = 6
    state.board.find((piece) => piece.id === 'sphinx-ur_token-1')!.position = 7
    state.currentThrow = { value: 1, lightSidesUp: 1, binaryDice: [true, false, false, false] }

    const nextState = applyMove(state, 'anubis-ur_token-1')

    expect(nextState.board.find((piece) => piece.id === 'anubis-ur_token-1')?.position).toBe(7)
    expect(nextState.board.find((piece) => piece.id === 'sphinx-ur_token-1')?.position).toBe(0)
    expect(nextState.historyLog.at(-2)?.eventType).toBe('CAPTURE')
  })

  it('prevents landing on an occupied rosette', () => {
    const state = createInitialState()
    state.board.find((piece) => piece.id === 'anubis-ur_token-1')!.position = 6
    state.board.find((piece) => piece.id === 'sphinx-ur_token-1')!.position = 8

    expect(isValidMove(state, 'anubis-ur_token-1', 2)).toEqual({
      valid: false,
      reason: 'rosette_occupied',
    })
  })

  it('grants an extra turn for landing on a rosette', () => {
    const state = createInitialState()
    state.board.find((piece) => piece.id === 'anubis-ur_token-1')!.position = 6
    state.currentThrow = { value: 2, lightSidesUp: 2, binaryDice: [true, true, false, false] }

    const nextState = applyMove(state, 'anubis-ur_token-1')

    expect(nextState.currentPlayer).toBe('anubis')
    expect(nextState.historyLog.at(-1)?.eventType).toBe('EXTRA_TURN')
  })

  it('auto-passes rolls of zero', () => {
    const state = createInitialState()
    state.currentThrow = { value: 0, lightSidesUp: 0, binaryDice: [false, false, false, false] }

    const nextState = autoPassIfNoMoves(state)

    expect(nextState.currentPlayer).toBe('sphinx')
    expect(nextState.currentThrow).toBeNull()
    expect(nextState.historyLog.at(-1)?.eventType).toBe('BLOCKED')
  })

  it('requires an exact bear-off roll', () => {
    const state = createInitialState()
    state.board.find((piece) => piece.id === 'anubis-ur_token-1')!.position = 13

    expect(isValidMove(state, 'anubis-ur_token-1', 3)).toEqual({
      valid: false,
      reason: 'requires_exact_bear_off',
    })
    expect(isValidMove(state, 'anubis-ur_token-1', 2)).toEqual({
      valid: true,
      targetSquare: 15,
    })
  })

  it('wins when the seventh token bears off', () => {
    const state = createInitialState()
    state.board
      .filter((piece) => piece.player === 'anubis')
      .forEach((piece) => {
        piece.position = 15
      })
    state.board.find((piece) => piece.id === 'anubis-ur_token-1')!.position = 14
    state.currentThrow = { value: 1, lightSidesUp: 1, binaryDice: [true, false, false, false] }

    const nextState = applyMove(state, 'anubis-ur_token-1')

    expect(nextState.winner).toBe('anubis')
    expect(nextState.historyLog.at(-1)?.eventType).toBe('WIN')
  })

  it('can simulate a deterministic match without invalid state', () => {
    let state = createInitialState()
    let index = 0
    const rolls = [1, 2, 3, 0, 4, 1, 2, 3, 1, 4, 0, 2, 1, 3, 2, 4]

    while (!state.winner && index < 300) {
      const value = rolls[index % rolls.length]
      state.currentThrow = {
        value,
        lightSidesUp: value,
        binaryDice: Array.from({ length: 4 }, (_, dieIndex) => dieIndex < value),
      }
      const legalMoves = getLegalMoves(state, state.currentPlayer, value)

      state =
        legalMoves.length === 0
          ? autoPassIfNoMoves(state)
          : applyMove(state, legalMoves[0].pieceId)

      expect(
        state.board.every((piece) => piece.position >= 0 && piece.position <= 15),
      ).toBe(true)

      index += 1
    }

    expect(index).toBeGreaterThan(0)
  })
})
