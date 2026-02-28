import { useShallow } from 'zustand/react/shallow'
import type { SenetStore } from './store'
import type { LocalTurnState } from './storeHelpers'

export const useShallowSelector = useShallow

export const appStoreSelector = (state: SenetStore) => ({
  clearRoomJoinError: state.clearRoomJoinError,
  currentPlayer: state.currentPlayer,
  gameType: state.gameType,
  historyLog: state.historyLog,
  isAutoPlaying: state.isAutoPlaying,
  isAutoRolling: state.isAutoRolling,
  isConnectingToRoom: state.isConnectingToRoom,
  isOnline: state.isOnline,
  isWaitingForOpponent: state.isWaitingForOpponent,
  joinRoom: state.joinRoom,
  leaveRoom: state.leaveRoom,
  localPlayer: state.localPlayer,
  offlineMode: state.offlineMode,
  playRandomTurns: state.playRandomTurns,
  resetGame: state.resetGame,
  roomId: state.roomId,
  roomJoinError: state.roomJoinError,
  mehenConfig: state.mehenConfig,
  ruleset: state.ruleset,
  setOfflineMode: state.setOfflineMode,
  setShowGuide: state.setShowGuide,
  setGameType: state.setGameType,
  showGuide: state.showGuide,
  winner: state.winner,
})

export const lobbyStoreSelector = (state: SenetStore) => ({
  clearRoomJoinError: state.clearRoomJoinError,
  joinRoom: state.joinRoom,
  roomJoinError: state.roomJoinError,
})

export const hudStoreSelector = (state: SenetStore) => ({
  currentPlayer: state.currentPlayer,
  gameType: state.gameType,
  isAutoPlaying: state.isAutoPlaying,
  isOnline: state.isOnline,
  playRandomTurns: state.playRandomTurns,
  resetGame: state.resetGame,
  ruleset: state.ruleset,
  setShowGuide: state.setShowGuide,
  winner: state.winner,
})

export const throwSticksStoreSelector = (state: SenetStore) => ({
  currentPlayer: state.currentPlayer,
  currentThrow: state.currentThrow,
  isAutoPlaying: state.isAutoPlaying,
  isAutoRolling: state.isAutoRolling,
  isOnline: state.isOnline,
  localPlayer: state.localPlayer,
  offlineHumanPlayer: state.offlineHumanPlayer,
  offlineMode: state.offlineMode,
  throwSticks: state.throwSticks,
  winner: state.winner,
  ruleset: state.ruleset,
})

export const boardStoreSelector = (state: SenetStore) => ({
  board: state.board,
  boardSize: state.boardSize,
  currentPlayer: state.currentPlayer,
  currentThrow: state.currentThrow,
  hoveredPieceId: state.hoveredPieceId,
  isConnectingToRoom: state.isConnectingToRoom,
  isOnline: state.isOnline,
  isWaitingForOpponent: state.isWaitingForOpponent,
  lastMove: state.lastMove,
  legalMoves: state.legalMoves,
  localPlayer: state.localPlayer,
  movePiece: state.movePiece,
  offlineHumanPlayer: state.offlineHumanPlayer,
  offlineMode: state.offlineMode,
  ruleset: state.ruleset,
  setHoveredPieceId: state.setHoveredPieceId,
})

export const afterlifeSelector = (state: SenetStore) => ({
  board: state.board,
  boardSize: state.boardSize,
  gameType: state.gameType,
})

export const gameOverSelector = (state: SenetStore) => ({
  isOnline: state.isOnline,
  localPlayer: state.localPlayer,
  offlineHumanPlayer: state.offlineHumanPlayer,
  offlineMode: state.offlineMode,
  resetGame: state.resetGame,
  winner: state.winner,
})

export const localTurnStateSelector = (state: SenetStore): LocalTurnState => ({
  currentPlayer: state.currentPlayer,
  isConnectingToRoom: state.isConnectingToRoom,
  isOnline: state.isOnline,
  isWaitingForOpponent: state.isWaitingForOpponent,
  localPlayer: state.localPlayer,
  offlineHumanPlayer: state.offlineHumanPlayer,
  offlineMode: state.offlineMode,
})
