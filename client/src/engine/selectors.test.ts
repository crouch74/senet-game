import { describe, expect, it } from 'vitest';
import {
  afterlifeSelector,
  appStoreSelector,
  boardStoreSelector,
  gameOverSelector,
  hudStoreSelector,
  lobbyStoreSelector,
  localTurnStateSelector,
  throwSticksStoreSelector,
} from './selectors';
import { useSenetStore } from './store';

describe('selectors', () => {
  it('returns the expected slices for every exported selector', () => {
    const state = useSenetStore.getState();

    expect(appStoreSelector(state)).toEqual(
      expect.objectContaining({
        roomId: state.roomId,
        winner: state.winner,
        ruleset: state.ruleset,
      }),
    );
    expect(lobbyStoreSelector(state)).toEqual(
      expect.objectContaining({
        roomJoinError: state.roomJoinError,
        joinRoom: state.joinRoom,
      }),
    );
    expect(hudStoreSelector(state)).toEqual(
      expect.objectContaining({
        currentPlayer: state.currentPlayer,
        playRandomTurns: state.playRandomTurns,
      }),
    );
    expect(throwSticksStoreSelector(state)).toEqual(
      expect.objectContaining({
        currentThrow: state.currentThrow,
        throwSticks: state.throwSticks,
        isOnline: state.isOnline,
      }),
    );
    expect(boardStoreSelector(state)).toEqual(
      expect.objectContaining({
        board: state.board,
        ruleset: state.ruleset,
        movePiece: state.movePiece,
      }),
    );
    expect(afterlifeSelector(state)).toEqual({
      board: state.board,
      boardSize: state.boardSize,
      gameType: state.gameType,
      houndsAndJackalsConfig: state.houndsAndJackalsConfig,
    });
    expect(gameOverSelector(state)).toEqual(
      expect.objectContaining({
        winner: state.winner,
        resetGame: state.resetGame,
      }),
    );
    expect(localTurnStateSelector(state)).toEqual({
      currentPlayer: state.currentPlayer,
      isConnectingToRoom: state.isConnectingToRoom,
      isOnline: state.isOnline,
      isWaitingForOpponent: state.isWaitingForOpponent,
      localPlayer: state.localPlayer,
      offlineHumanPlayer: state.offlineHumanPlayer,
      offlineMode: state.offlineMode,
    });
  });
});
