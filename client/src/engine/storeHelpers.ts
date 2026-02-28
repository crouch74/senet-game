import type { GameState, OfflineMode, PlayerID } from './types'
import type { LocalRole } from './network'

export interface LastMove {
  from: number
  isCapture?: boolean
  pieceId: string
  to: number
}

export interface LocalTurnState {
  currentPlayer: PlayerID
  isConnectingToRoom: boolean
  isOnline: boolean
  isWaitingForOpponent: boolean
  localPlayer: LocalRole | null
  offlineHumanPlayer: PlayerID
  offlineMode: OfflineMode
}

export const extractGameState = (state: GameState): GameState => ({
  board: state.board,
  currentPlayer: state.currentPlayer,
  currentThrow: state.currentThrow,
  ruleset: state.ruleset,
  winner: state.winner,
  historyLog: state.historyLog,
})

export const buildSyncedGameState = (
  state: Pick<
    GameState,
    'board' | 'currentPlayer' | 'currentThrow' | 'historyLog' | 'winner'
  >,
): Partial<GameState> => ({
  board: state.board,
  currentPlayer: state.currentPlayer,
  currentThrow: state.currentThrow,
  winner: state.winner,
  historyLog: state.historyLog,
})

export const isLocalTurnState = (state: LocalTurnState) => {
  if (state.isOnline) {
    if (state.isWaitingForOpponent || state.isConnectingToRoom) return false
    return state.currentPlayer === state.localPlayer
  }

  if (state.offlineMode === 'vs_pc') {
    return state.currentPlayer === state.offlineHumanPlayer
  }

  return true
}

export const buildLastMove = (
  previousState: GameState,
  nextState: GameState,
  movedPieceId: string,
): LastMove | null => {
  const previousPiece = previousState.board.find(
    (piece) => piece.id === movedPieceId,
  )
  const nextPiece = nextState.board.find((piece) => piece.id === movedPieceId)

  if (!previousPiece || !nextPiece) return null

  const capturedPiece = nextState.board.find((piece) => {
    const previousBoardPiece = previousState.board.find(
      (previousPieceState) => previousPieceState.id === piece.id,
    )

    return (
      piece.id !== movedPieceId &&
      previousBoardPiece !== undefined &&
      previousBoardPiece.position !== piece.position
    )
  })

  return {
    pieceId: movedPieceId,
    from: previousPiece.position,
    to: nextPiece.position,
    isCapture: Boolean(capturedPiece),
  }
}
