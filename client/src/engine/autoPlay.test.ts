import { describe, expect, it, vi } from 'vitest';
import type { GameState, ThrowResult } from './types';
import { executeAutoPlayTurn, playImmediateAutoTurns } from './autoPlay';
import { createInitialState } from './logic';

const buildState = (overrides: Partial<GameState> = {}): GameState => ({
  ...createInitialState(),
  ...overrides,
  board: overrides.board ?? createInitialState().board,
  historyLog: overrides.historyLog ?? createInitialState().historyLog,
});

describe('autoPlay', () => {
  it('returns the same state when a winner already exists', () => {
    const state = buildState({ winner: 'anubis' });
    const result = executeAutoPlayTurn(state);

    expect(result.nextState).toBe(state);
    expect(result.movedPieceId).toBeNull();
  });

  it('generates a throw and auto-passes when there are no legal moves', () => {
    const throwResult: ThrowResult = { lightSidesUp: 0, value: 5 };
    const autoPassIfNoMoves = vi.fn((state: GameState) => ({
      ...state,
      currentPlayer: 'sphinx' as const,
      currentThrow: null,
    }));

    const result = executeAutoPlayTurn(buildState(), {
      autoPassIfNoMoves,
      getLegalMoves: vi.fn(() => []),
      getThrowResult: vi.fn(() => throwResult),
    });

    expect(result.throwResult).toEqual(throwResult);
    expect(result.movedPieceId).toBeNull();
    expect(autoPassIfNoMoves).toHaveBeenCalledWith(
      expect.objectContaining({ currentThrow: throwResult }),
    );
    expect(result.nextState.currentPlayer).toBe('sphinx');
  });

  it('selects a random legal move and returns the moved piece id', () => {
    const applyMove = vi.fn((state: GameState, pieceId: string) => ({
      ...state,
      currentThrow: null,
      historyLog: [...state.historyLog, { key: `moved:${pieceId}` }],
    }));

    const result = executeAutoPlayTurn(buildState(), {
      applyMove,
      getLegalMoves: vi.fn(() => [
        { pieceId: 'L1', targetSquare: 2 },
        { pieceId: 'L2', targetSquare: 4 },
      ]),
      getThrowResult: vi.fn(() => ({ lightSidesUp: 2, value: 2 })),
      random: () => 0.9,
    });

    expect(applyMove).toHaveBeenCalledWith(expect.any(Object), 'L2');
    expect(result.movedPieceId).toBe('L2');
  });

  it('plays immediate turns until a winner is reached', () => {
    const terminalState = buildState({ winner: 'anubis' });
    const applyMove = vi
      .fn()
      .mockReturnValueOnce(terminalState)
      .mockReturnValue(terminalState);

    const result = playImmediateAutoTurns(buildState(), 3, {
      applyMove,
      getLegalMoves: vi.fn(() => [{ pieceId: 'L1', targetSquare: 2 }]),
      getThrowResult: vi.fn(() => ({ lightSidesUp: 1, value: 1 })),
      random: () => 0,
    });

    expect(applyMove).toHaveBeenCalledTimes(1);
    expect(result.winner).toBe('anubis');
  });
});
