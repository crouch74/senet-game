import { describe, expect, it, vi } from 'vitest';
import type { GameState, Piece } from './types';
import { createSenetStore } from './store';

const piece = (id: string, player: 'anubis' | 'sphinx', position: number): Piece => ({
  id,
  player,
  position,
});

describe('store', () => {
  it('normalizes room joins and applies websocket lifecycle events', () => {
    let handlers: Record<string, (...args: unknown[]) => void> | undefined;
    const manager = {
      connect: vi.fn((_roomId: string, nextHandlers: Record<string, (...args: unknown[]) => void>) => {
        handlers = nextHandlers;
      }),
      disconnect: vi.fn(),
      syncState: vi.fn(),
    };

    const store = createSenetStore({
      createConnectionManager: () => manager,
      log: { error: vi.fn(), log: vi.fn() },
    });

    store.getState().joinRoom(' ABC-DEF-GHI ');

    expect(manager.connect).toHaveBeenCalledWith(
      'abc-def-ghi',
      expect.any(Object),
    );
    expect(store.getState().isConnectingToRoom).toBe(true);

    handlers?.onInit('anubis');
    expect(store.getState()).toEqual(
      expect.objectContaining({
        isConnectingToRoom: false,
        isOnline: true,
        isWaitingForOpponent: true,
        localPlayer: 'anubis',
        roomId: 'abc-def-ghi',
      }),
    );

    handlers?.onGameStart({
      openingPlayer: 'sphinx',
      openingRolls: { anubis: 2, sphinx: 4 },
    });
    expect(store.getState().currentPlayer).toBe('sphinx');
    expect(store.getState().isWaitingForOpponent).toBe(false);

    store.setState({ legalMoves: [{ pieceId: 'L1', targetSquare: 3 }] });
    handlers?.onSync({ currentPlayer: 'anubis' });
    expect(store.getState().currentPlayer).toBe('anubis');
    expect(store.getState().legalMoves).toEqual([]);
  });

  it('maps websocket errors and clears room identity when the socket closes', () => {
    let handlers: Record<string, (...args: unknown[]) => void> | undefined;
    const manager = {
      connect: vi.fn((_roomId: string, nextHandlers: Record<string, (...args: unknown[]) => void>) => {
        handlers = nextHandlers;
      }),
      disconnect: vi.fn(),
      syncState: vi.fn(),
    };

    const store = createSenetStore({
      createConnectionManager: () => manager,
      log: { error: vi.fn(), log: vi.fn() },
    });

    store.getState().joinRoom('abc-def-ghi');
    handlers?.onError('Room is full');

    expect(store.getState()).toEqual(
      expect.objectContaining({
        isConnectingToRoom: false,
        roomJoinError: 'full',
        roomId: 'abc-def-ghi',
      }),
    );

    handlers?.onClose();
    expect(store.getState()).toEqual(
      expect.objectContaining({
        isOnline: false,
        isWaitingForOpponent: false,
        localPlayer: null,
        roomId: null,
      }),
    );
  });

  it('ignores blank room joins and clears room errors on request', () => {
    const manager = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      syncState: vi.fn(),
    };
    const store = createSenetStore({
      createConnectionManager: () => manager,
      log: { error: vi.fn(), log: vi.fn() },
    });

    store.setState({ roomJoinError: 'full' });
    store.getState().joinRoom('   ');
    store.getState().clearRoomJoinError();

    expect(manager.connect).not.toHaveBeenCalled();
    expect(store.getState().roomJoinError).toBeNull();
  });

  it('blocks local actions when it is not the local turn and syncs throws when it is', () => {
    const syncState = vi.fn();
    const store = createSenetStore({
      createConnectionManager: () => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        syncState,
      }),
      getLegalMoves: vi.fn(() => [{ pieceId: 'L1', targetSquare: 3 }]),
      getThrowResult: vi.fn(() => ({ lightSidesUp: 2, value: 2 })),
      log: { error: vi.fn(), log: vi.fn() },
    });

    store.setState({
      currentPlayer: 'sphinx',
      isOnline: false,
      offlineHumanPlayer: 'anubis',
      offlineMode: 'vs_pc',
    });
    store.getState().throwSticks();
    expect(store.getState().currentThrow).toBeNull();

    store.setState({
      currentPlayer: 'anubis',
      isOnline: true,
      isWaitingForOpponent: false,
      localPlayer: 'anubis',
    });
    store.getState().throwSticks();

    expect(store.getState().currentThrow).toEqual({ lightSidesUp: 2, value: 2 });
    expect(store.getState().legalMoves).toEqual([{ pieceId: 'L1', targetSquare: 3 }]);
    expect(syncState).toHaveBeenCalledWith({ currentThrow: { lightSidesUp: 2, value: 2 } });
  });

  it('auto-passes after a delay when a throw produces no legal moves', async () => {
    vi.useFakeTimers();
    const syncState = vi.fn();
    const autoPassIfNoMoves = vi.fn((state: GameState) => ({
      ...state,
      currentPlayer: 'sphinx' as const,
      currentThrow: null,
      historyLog: [...state.historyLog, { key: 'history.no_moves' }],
      winner: null,
    }));

    const store = createSenetStore({
      autoPassIfNoMoves,
      createConnectionManager: () => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        syncState,
      }),
      getLegalMoves: vi.fn(() => []),
      getThrowResult: vi.fn(() => ({ lightSidesUp: 3, value: 3 })),
      log: { error: vi.fn(), log: vi.fn() },
    });

    store.setState({
      isOnline: true,
      isWaitingForOpponent: false,
      localPlayer: 'anubis',
    });

    store.getState().throwSticks();
    expect(store.getState().currentThrow).toEqual({ lightSidesUp: 3, value: 3 });

    await vi.advanceTimersByTimeAsync(1500);

    expect(autoPassIfNoMoves).toHaveBeenCalled();
    expect(store.getState().currentPlayer).toBe('sphinx');
    expect(store.getState().currentThrow).toBeNull();
    expect(syncState).toHaveBeenLastCalledWith(
      expect.objectContaining({ currentPlayer: 'sphinx', currentThrow: null }),
    );
  });

  it('tracks capture metadata when moving pieces and clears lastMove after a timeout', async () => {
    vi.useFakeTimers();
    const syncState = vi.fn();
    const applyMove = vi.fn((state: GameState) => ({
      ...state,
      board: [
        piece('L1', 'anubis', 4),
        piece('D1', 'sphinx', 1),
      ],
      currentThrow: null,
      historyLog: [...state.historyLog, { key: 'history.moved_to' }],
    }));

    const store = createSenetStore({
      applyMove,
      createConnectionManager: () => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        syncState,
      }),
      log: { error: vi.fn(), log: vi.fn() },
    });

    store.setState({
      board: [piece('L1', 'anubis', 1), piece('D1', 'sphinx', 4)],
      currentThrow: { lightSidesUp: 3, value: 3 },
      currentPlayer: 'anubis',
      isOnline: true,
      isWaitingForOpponent: false,
      legalMoves: [{ pieceId: 'L1', targetSquare: 4 }],
      localPlayer: 'anubis',
    });

    store.getState().movePiece('L1');

    expect(applyMove).toHaveBeenCalled();
    expect(store.getState().lastMove).toEqual({
      pieceId: 'L1',
      from: 1,
      to: 4,
      isCapture: true,
    });
    expect(syncState).toHaveBeenCalledWith(
      expect.objectContaining({ currentThrow: null }),
    );

    await vi.advanceTimersByTimeAsync(2000);
    expect(store.getState().lastMove).toBeNull();
  });

  it('passes pure game-state snapshots into engine mutation helpers', () => {
    const applyMove = vi.fn((state: GameState) => ({
      ...state,
      board: [piece('L1', 'anubis', 3), piece('D1', 'sphinx', 4)],
      currentThrow: null,
    }));
    const autoPassIfNoMoves = vi.fn((state: GameState) => ({
      ...state,
      currentPlayer: 'sphinx',
      currentThrow: null,
    }));

    const store = createSenetStore({
      applyMove,
      autoPassIfNoMoves,
      createConnectionManager: () => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        syncState: vi.fn(),
      }),
      log: { error: vi.fn(), log: vi.fn() },
    });

    store.setState({
      board: [piece('L1', 'anubis', 1), piece('D1', 'sphinx', 4)],
      currentThrow: { lightSidesUp: 2, value: 2 },
      currentPlayer: 'anubis',
      isOnline: false,
    });

    store.getState().movePiece('L1');
    const moveArg = applyMove.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(moveArg).toEqual(
      expect.objectContaining({
        board: [piece('L1', 'anubis', 1), piece('D1', 'sphinx', 4)],
        currentPlayer: 'anubis',
        currentThrow: { lightSidesUp: 2, value: 2 },
      }),
    );
    expect(moveArg).not.toHaveProperty('setHoveredPieceId');

    store.setState({
      board: [piece('L1', 'anubis', 30)],
      currentThrow: { lightSidesUp: 2, value: 2 },
      currentPlayer: 'anubis',
      historyLog: [],
    });

    store.getState().passTurn();
    const passArg = autoPassIfNoMoves.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(passArg).toEqual(
      expect.objectContaining({
        board: [piece('L1', 'anubis', 30)],
        currentPlayer: 'anubis',
        currentThrow: { lightSidesUp: 2, value: 2 },
      }),
    );
    expect(passArg).not.toHaveProperty('movePiece');
  });

  it('resets room metadata on leaveRoom and can play immediate autoplay turns', async () => {
    const disconnect = vi.fn();
    const store = createSenetStore({
      applyMove: vi.fn((state: GameState) => ({
        ...state,
        board: [piece('L1', 'anubis', 31)],
        currentThrow: null,
        winner: 'anubis',
      })),
      createConnectionManager: () => ({
        connect: vi.fn(),
        disconnect,
        syncState: vi.fn(),
      }),
      getLegalMoves: vi.fn(() => [{ pieceId: 'L1', targetSquare: 31 }]),
      getThrowResult: vi.fn(() => ({ lightSidesUp: 1, value: 1 })),
      log: { error: vi.fn(), log: vi.fn() },
      random: () => 0,
    });

    store.setState({
      isConnectingToRoom: true,
      isOnline: true,
      roomId: 'abc-def-ghi',
    });
    store.getState().leaveRoom();

    expect(disconnect).toHaveBeenCalled();
    expect(store.getState()).toEqual(
      expect.objectContaining({
        isConnectingToRoom: false,
        isOnline: false,
        roomId: null,
        roomJoinError: null,
      }),
    );

    store.setState({
      board: [piece('L1', 'anubis', 30)],
      currentPlayer: 'anubis',
      historyLog: [],
      isOnline: false,
      winner: null,
    });
    await store.getState().playRandomTurns(1, 'immediate');

    expect(store.getState().winner).toBe('anubis');
    expect(store.getState().isAutoPlaying).toBe(false);
  });

  it('cancels animated autoplay when the run is interrupted', async () => {
    vi.useFakeTimers();
    const store = createSenetStore({
      applyMove: vi.fn((state: GameState) => ({
        ...state,
        board: [piece('L1', 'anubis', 2)],
        currentThrow: null,
      })),
      createConnectionManager: () => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        syncState: vi.fn(),
      }),
      getLegalMoves: vi.fn(() => [{ pieceId: 'L1', targetSquare: 2 }]),
      getThrowResult: vi.fn(() => ({ lightSidesUp: 1, value: 1 })),
      log: { error: vi.fn(), log: vi.fn() },
      random: () => 0,
    });

    store.setState({
      board: [piece('L1', 'anubis', 1)],
      currentPlayer: 'anubis',
      historyLog: [],
    });

    const autoplayPromise = store.getState().playRandomTurns(1, 'human');
    expect(store.getState().isAutoRolling).toBe(true);

    store.getState().leaveRoom();
    await vi.runAllTimersAsync();
    await autoplayPromise;

    expect(store.getState().isAutoPlaying).toBe(false);
    expect(store.getState().isAutoRolling).toBe(false);
  });

  it('handles spectator init, opponent disconnects, and successful resetGame calls', () => {
    let handlers: Record<string, (...args: unknown[]) => void> | undefined;
    const store = createSenetStore({
      createConnectionManager: () => ({
        connect: vi.fn((_roomId: string, nextHandlers: Record<string, (...args: unknown[]) => void>) => {
          handlers = nextHandlers;
        }),
        disconnect: vi.fn(),
        syncState: vi.fn(),
      }),
      log: { error: vi.fn(), log: vi.fn() },
    });

    store.getState().joinRoom('abc-def-ghi');
    handlers?.onInit('spectator');
    handlers?.onOpponentDisconnected();

    expect(store.getState()).toEqual(
      expect.objectContaining({
        isOnline: true,
        isWaitingForOpponent: true,
        localPlayer: 'spectator',
      }),
    );

    store.setState({
      board: [piece('L1', 'anubis', 5)],
      currentPlayer: 'sphinx',
      isOnline: false,
      winner: 'anubis',
    });
    store.getState().resetGame();

    expect(store.getState()).toEqual(
      expect.objectContaining({
        currentPlayer: 'anubis',
        winner: null,
      }),
    );
  });

  it('commits animated autoplay turns and respects guarded no-op branches', async () => {
    vi.useFakeTimers();
    const syncState = vi.fn();
    const store = createSenetStore({
      applyMove: vi.fn((state: GameState) => ({
        ...state,
        board: [piece('L1', 'anubis', 2)],
        currentThrow: null,
      })),
      autoPassIfNoMoves: vi.fn((state: GameState) => ({
        ...state,
        currentPlayer: 'sphinx',
        currentThrow: null,
      })),
      createConnectionManager: () => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        syncState,
      }),
      getLegalMoves: vi
        .fn()
        .mockReturnValueOnce([{ pieceId: 'L1', targetSquare: 2 }])
        .mockReturnValueOnce([{ pieceId: 'L1', targetSquare: 2 }])
        .mockReturnValue([]),
      getThrowResult: vi.fn(() => ({ lightSidesUp: 1, value: 1 })),
      log: { error: vi.fn(), log: vi.fn() },
      random: () => 0,
    });

    store.setState({
      board: [piece('L1', 'anubis', 1)],
      currentPlayer: 'anubis',
      currentThrow: null,
      isAutoPlaying: true,
      isAutoRolling: true,
      isOnline: true,
      isWaitingForOpponent: false,
      localPlayer: 'anubis',
      winner: 'anubis',
    });

    store.getState().throwSticks();
    store.getState().movePiece('L1');
    store.getState().passTurn();
    await store.getState().playRandomTurns(1, 'immediate');
    expect(syncState).not.toHaveBeenCalled();

    store.setState({
      board: [piece('L1', 'anubis', 1)],
      currentPlayer: 'anubis',
      currentThrow: null,
      historyLog: [],
      isAutoPlaying: false,
      isAutoRolling: false,
      isWaitingForOpponent: false,
      isOnline: false,
      localPlayer: null,
      winner: null,
    });

    const autoplayPromise = store.getState().playRandomTurns(1, 'quick');
    await vi.runAllTimersAsync();
    await autoplayPromise;

    expect(store.getState().board[0].position).toBe(2);
    expect(store.getState().isAutoPlaying).toBe(false);
    expect(store.getState().isAutoRolling).toBe(false);
  });
});
