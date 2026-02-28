import { describe, expect, it, vi } from 'vitest';
import type { GameState, Piece } from '../../../engine/types';
import {
  INITIAL_BOARD,
  applyMove,
  autoPassIfNoMoves,
  createInitialState,
  getThrowResult,
  isValidMove,
} from './logic';

const piece = (id: string, player: 'anubis' | 'sphinx', position: number): Piece => ({
  id,
  player,
  position,
  type: 'senet_piece',
});

const buildState = (overrides: Partial<GameState> = {}): GameState => {
  const state = createInitialState();
  return {
    ...state,
    ...overrides,
    board: overrides.board ?? structuredClone(state.board),
    historyLog: overrides.historyLog ?? [...state.historyLog],
  };
};

describe('logic', () => {
  it('creates an independent initial state board', () => {
    const initialState = createInitialState();

    expect(initialState.board).toEqual(INITIAL_BOARD);
    expect(initialState.board).not.toBe(INITIAL_BOARD);
  });

  it('scores stick throws including the zero-light-sides case', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.1);

    expect(getThrowResult()).toEqual({ lightSidesUp: 2, value: 2 });

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4);

    expect(getThrowResult()).toEqual({ lightSidesUp: 0, value: 5 });
  });

  it('rejects moving onto your own piece', () => {
    const result = isValidMove(buildState(), 'L1', 2);
    expect(result).toEqual({
      valid: false,
      reason: 'Target square occupied by own piece',
    });
  });

  it('rejects movement through an opposing blockade', () => {
    const result = isValidMove(
      buildState({
        board: [
          piece('L1', 'anubis', 1),
          piece('D1', 'sphinx', 2),
          piece('D2', 'sphinx', 3),
          piece('D3', 'sphinx', 4),
        ],
      }),
      'L1',
      4,
    );

    expect(result).toEqual({
      valid: false,
      reason: "Blocked by an opponent's blockade",
    });
  });

  it('prevents bypassing the House of Beauty', () => {
    const result = isValidMove(
      buildState({
        board: [piece('L1', 'anubis', 25)],
      }),
      'L1',
      2,
    );

    expect(result).toEqual({
      valid: false,
      reason: 'Cannot bypass the House of Beauty (Square 26)',
    });
  });

  it('blocks captures against safe houses and protected enemies', () => {
    const safeHouseResult = isValidMove(
      buildState({
        board: [piece('L1', 'anubis', 14), piece('D1', 'sphinx', 15)],
      }),
      'L1',
      1,
    );
    expect(safeHouseResult).toEqual({
      valid: false,
      reason: 'Target piece is in a safe house',
    });

    const protectedResult = isValidMove(
      buildState({
        board: [
          piece('L1', 'anubis', 1),
          piece('D1', 'sphinx', 5),
          piece('D2', 'sphinx', 6),
        ],
      }),
      'L1',
      4,
    );
    expect(protectedResult).toEqual({
      valid: false,
      reason: 'Target piece is protected',
    });
  });

  it('requires exact throws on the final houses and for exact bearing off', () => {
    const requireThrowResult = isValidMove(
      buildState({
        board: [piece('L1', 'anubis', 28)],
      }),
      'L1',
      2,
    );
    expect(requireThrowResult).toEqual({
      valid: false,
      reason: 'Requires exactly a throw of 3 to bear off. Cannot move between the last 3 houses.',
    });

    const exactBearOffResult = isValidMove(
      buildState({
        board: [piece('L1', 'anubis', 26)],
      }),
      'L1',
      6,
    );
    expect(exactBearOffResult).toEqual({
      valid: false,
      reason: 'Requires exact throw to bear off',
    });
  });

  it('swaps captured pieces and grants extra throws when appropriate', () => {
    const state = buildState({
      board: [piece('L1', 'anubis', 1), piece('D1', 'sphinx', 2)],
      currentThrow: { lightSidesUp: 1, value: 1 },
    });

    const nextState = applyMove(state, 'L1');

    expect(nextState.board.find((entry) => entry.id === 'L1')?.position).toBe(2);
    expect(nextState.board.find((entry) => entry.id === 'D1')?.position).toBe(1);
    expect(nextState.currentPlayer).toBe('anubis');
    expect(nextState.historyLog).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'history.captured_swapped' }),
        expect.objectContaining({ key: 'history.extra_throw' }),
      ]),
    );
  });

  it('ignores non-serializable store fields when cloning move state', () => {
    const stateWithStoreFields = {
      ...buildState({
        board: [piece('L1', 'anubis', 1), piece('D1', 'sphinx', 4)],
        currentThrow: { lightSidesUp: 2, value: 2 },
      }),
      setHoveredPieceId: () => undefined,
    } as GameState;

    const nextState = applyMove(stateWithStoreFields, 'L1');

    expect(nextState.board.find((entry) => entry.id === 'L1')?.position).toBe(3);
    expect(nextState.board.find((entry) => entry.id === 'D1')?.position).toBe(4);
  });

  it('washes pieces back from the House of Water and finds a fallback square', () => {
    const nextState = applyMove(
      buildState({
        board: [
          piece('L1', 'anubis', 26),
          piece('L2', 'anubis', 15),
          piece('D1', 'sphinx', 13),
        ],
        currentThrow: { lightSidesUp: 1, value: 1 },
      }),
      'L1',
    );

    expect(nextState.board.find((entry) => entry.id === 'L1')?.position).toBe(14);
    expect(nextState.historyLog).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: 'history.washed_back' })]),
    );
  });

  it('declares a winner when the last piece bears off', () => {
    const state = buildState({
      board: [
        piece('L1', 'anubis', 30),
        piece('L2', 'anubis', 31),
        piece('L3', 'anubis', 31),
        piece('L4', 'anubis', 31),
        piece('L5', 'anubis', 31),
      ],
      currentThrow: { lightSidesUp: 1, value: 1 },
    });

    const nextState = applyMove(state, 'L1');

    expect(nextState.winner).toBe('anubis');
    expect(nextState.historyLog.at(-1)).toEqual(
      expect.objectContaining({ key: 'history.wins', player: 'anubis' }),
    );
  });

  it('passes the turn automatically when there are no legal moves', () => {
    const state = buildState({
      board: [piece('L1', 'anubis', 30)],
      currentThrow: { lightSidesUp: 2, value: 2 },
    });

    const nextState = autoPassIfNoMoves(state);

    expect(nextState.currentPlayer).toBe('sphinx');
    expect(nextState.currentThrow).toBeNull();
    expect(nextState.historyLog.at(-1)).toEqual(
      expect.objectContaining({ key: 'history.no_moves' }),
    );
  });
});
