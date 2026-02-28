import type { GameState, OfflineMode, PlayerID } from './types'
import type { LocalRole } from './network'

export interface LastMove {
  from: number
  isCapture?: boolean
  pieceId: string
  roll?: number
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
  gameType: state.gameType,
  board: state.board,
  boardSize: state.boardSize,
  currentPlayer: state.currentPlayer,
  currentThrow: state.currentThrow,
  houndsAndJackalsConfig: state.houndsAndJackalsConfig,
  lastRoll: state.lastRoll,
  ruleset: state.ruleset,
  mehenConfig: state.mehenConfig,
  players: state.players,
  safeCells: state.safeCells,
  turnIndex: state.turnIndex,
  winner: state.winner,
  historyLog: state.historyLog,
})

export const buildSyncedGameState = (
  state: Pick<
    GameState,
    | 'board'
    | 'boardSize'
    | 'currentPlayer'
    | 'currentThrow'
    | 'houndsAndJackalsConfig'
    | 'historyLog'
    | 'lastRoll'
    | 'mehenConfig'
    | 'players'
    | 'safeCells'
    | 'turnIndex'
    | 'winner'
    | 'gameType'
  >,
): Partial<GameState> => ({
  gameType: state.gameType,
  board: state.board,
  boardSize: state.boardSize,
  currentPlayer: state.currentPlayer,
  currentThrow: state.currentThrow,
  houndsAndJackalsConfig: state.houndsAndJackalsConfig,
  lastRoll: state.lastRoll,
  winner: state.winner,
  historyLog: state.historyLog,
  mehenConfig: state.mehenConfig,
  players: state.players,
  safeCells: state.safeCells,
  turnIndex: state.turnIndex,
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

  const latestMoveEvent = [...nextState.historyLog]
    .reverse()
    .find(
      (event) =>
        event.eventType === 'MOVE' &&
        (event.pieceId === movedPieceId || event.piece === movedPieceId),
    )

  return {
    pieceId: movedPieceId,
    from: previousPiece.position,
    to: nextPiece.position,
    isCapture: Boolean(capturedPiece),
    roll: latestMoveEvent?.roll,
  }
}
