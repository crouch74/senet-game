import { create } from 'zustand'
import type { GameState, OfflineMode, PlayerID, GameType } from './types'
import * as senetLogic from '../games/senet/engine/logic'
import * as mehenLogic from '../games/mehen/engine/logic'

import {
  AUTO_PLAY_TIMINGS,
  executeAutoPlayTurn,
  playImmediateAutoTurns,
  sleep,
  type AutoPlayDependencies,
  type AutoPlaySpeed,
} from './autoPlay'
import {
  createMatchConnectionManager,
  mapRoomJoinError,
  normalizeRoomId,
  type LocalRole,
  type RoomJoinError,
} from './network'
import {
  buildLastMove,
  buildSyncedGameState,
  extractGameState,
  type LastMove,
  isLocalTurnState,
} from './storeHelpers'
import { createLogger } from '../services/logger'

interface SenetStoreDependencies extends Partial<AutoPlayDependencies> {
  clearTimeoutFn?: typeof window.clearTimeout
  createConnectionManager?: typeof createMatchConnectionManager
  log?: Pick<Console, 'error' | 'log' | 'warn'>
  setTimeoutFn?: typeof window.setTimeout
}

export interface SenetStore extends GameState {
  clearRoomJoinError: () => void
  hoveredPieceId: string | null
  isAutoPlaying: boolean
  isAutoRolling: boolean
  isConnectingToRoom: boolean
  isOnline: boolean
  isWaitingForOpponent: boolean
  joinRoom: (roomId: string) => void
  lastMove: LastMove | null
  legalMoves: { pieceId: string; targetSquare: number }[]
  leaveRoom: () => void
  localPlayer: LocalRole | null
  movePiece: (pieceId: string) => void
  offlineHumanPlayer: PlayerID
  offlineMode: OfflineMode
  passTurn: () => void
  playRandomTurns: (turnsCount: number, speed?: AutoPlaySpeed) => void
  resetGame: () => void
  roomId: string | null
  roomJoinError: RoomJoinError | null
  setHoveredPieceId: (pieceId: string | null) => void
  setOfflineMode: (mode: OfflineMode) => void
  setShowGuide: (show: boolean) => void
  setGameType: (type: GameType) => void
  showGuide: boolean
  syncState: (state: Partial<GameState>) => void
  throwSticks: () => void
}

const getGameLogic = (gameType: GameType) => {
  if (gameType === 'mehen') return mehenLogic
  return senetLogic
}

export const createSenetStore = (
  dependencies: SenetStoreDependencies = {},
) => {
  const logger = createLogger('Store', dependencies.log ?? console)
  const setTimeoutFn =
    dependencies.setTimeoutFn ?? window.setTimeout.bind(window)
  const clearTimeoutFn =
    dependencies.clearTimeoutFn ?? window.clearTimeout.bind(window)

  const getThrowResult = (gameType: GameType) => getGameLogic(gameType).getThrowResult()
  const getLegalMoves = (state: GameState) => getGameLogic(state.gameType).getLegalMoves(state)
  const applyMove = (state: GameState, pieceId: string) => getGameLogic(state.gameType).applyMove(state, pieceId)
  const autoPassIfNoMoves = (state: GameState) => getGameLogic(state.gameType).autoPassIfNoMoves(state)

  const connectionManager =
    (dependencies.createConnectionManager ?? createMatchConnectionManager)()

  let autoplayRunId = 0
  let autoPassTimer: ReturnType<typeof setTimeout> | null = null
  let clearLastMoveTimer: ReturnType<typeof setTimeout> | null = null

  const clearAutoPassTimer = () => {
    if (autoPassTimer === null) return
    clearTimeoutFn(autoPassTimer)
    autoPassTimer = null
  }

  const clearLastMoveTimeout = () => {
    if (clearLastMoveTimer === null) return
    clearTimeoutFn(clearLastMoveTimer)
    clearLastMoveTimer = null
  }

  const cancelAutoplay = () => {
    autoplayRunId += 1
  }

  return create<SenetStore>((set, get) => ({
    ...senetLogic.createInitialState(),
    hoveredPieceId: null,
    isAutoPlaying: false,
    isAutoRolling: false,
    isConnectingToRoom: false,
    isOnline: false,
    isWaitingForOpponent: false,
    lastMove: null,
    legalMoves: [],
    localPlayer: null,
    offlineHumanPlayer: 'anubis',
    offlineMode: 'play_and_pass',
    roomId: null,
    roomJoinError: null,
    showGuide: false,

    clearRoomJoinError: () => set({ roomJoinError: null }),

    joinRoom: (roomId) => {
      const normalizedRoomId = normalizeRoomId(roomId)
      if (!normalizedRoomId) return

      cancelAutoplay()
      clearAutoPassTimer()
      clearLastMoveTimeout()
      connectionManager.disconnect()

      set({
        isOnline: false,
        isConnectingToRoom: true,
        isWaitingForOpponent: true,
        roomId: normalizedRoomId,
        localPlayer: null,
        roomJoinError: null,
      })

      connectionManager.connect(normalizedRoomId, get().gameType, {
        onOpen: (joinedRoomId) => {
          logger.info(`Connected to room ${joinedRoomId}`)
        },
        onInit: (role) => {
          const isSpectator = role === 'spectator'
          set({
            isOnline: true,
            isConnectingToRoom: false,
            isWaitingForOpponent: !isSpectator,
            roomId: normalizedRoomId,
            localPlayer: role,
            roomJoinError: null,
          })

          if (isSpectator) {
            logger.info('Joined as spectator')
          } else {
            logger.info(`Playing as ${role} and waiting for the opponent`)
          }
        },
        onGameStart: ({ openingPlayer, openingRolls }) => {
          set((state) => ({
            isConnectingToRoom: false,
            isWaitingForOpponent: false,
            currentPlayer: openingPlayer ?? state.currentPlayer,
          }))

          if (openingPlayer && openingRolls) {
            logger.info(
              `Opening roll-off decided the starter: anubis=${openingRolls.anubis}, sphinx=${openingRolls.sphinx}, starter=${openingPlayer}`,
            )
          } else {
            logger.info('Both players connected and the game resumed')
          }
        },
        onSync: (state) => {
          set({ ...state, legalMoves: [] })
        },
        onOpponentDisconnected: () => {
          set({ isWaitingForOpponent: true })
          logger.warn('Opponent disconnected and gameplay is paused')
        },
        onError: (message) => {
          logger.error('WebSocket error received', message)
          set({
            roomJoinError: mapRoomJoinError(message),
            isConnectingToRoom: false,
          })
        },
        onClose: () => {
          set({
            isOnline: false,
            isConnectingToRoom: false,
            isWaitingForOpponent: false,
            roomId: null,
            localPlayer: null,
          })
        },
      })
    },

    leaveRoom: () => {
      cancelAutoplay()
      clearAutoPassTimer()
      clearLastMoveTimeout()
      connectionManager.disconnect()
      set({
        isOnline: false,
        isConnectingToRoom: false,
        isWaitingForOpponent: false,
        roomId: null,
        localPlayer: null,
        roomJoinError: null,
      })
    },

    movePiece: (pieceId) => {
      const state = get()
      if (!state.currentThrow || state.isAutoPlaying || state.isAutoRolling) return
      if (!isLocalTurnState(state)) return

      clearAutoPassTimer()

      const nextState = applyMove(extractGameState(state), pieceId)
      const partialState = buildSyncedGameState(nextState)

      set({
        ...partialState,
        legalMoves: [],
        lastMove: buildLastMove(state, nextState, pieceId),
      })
      get().syncState(partialState)

      clearLastMoveTimeout()
      clearLastMoveTimer = setTimeoutFn(() => {
        clearLastMoveTimer = null
        set({ lastMove: null })
      }, 2000)
    },

    passTurn: () => {
      const state = get()
      if (state.isAutoPlaying || state.isAutoRolling) return
      if (!isLocalTurnState(state)) return

      clearAutoPassTimer()

      const nextState = autoPassIfNoMoves(extractGameState(state))
      const partialState = buildSyncedGameState(nextState)

      set({ ...partialState, legalMoves: [] })
      get().syncState(partialState)
    },

    playRandomTurns: async (turnsCount, speed = 'immediate') => {
      const storeState = get()
      if (
        storeState.isOnline ||
        storeState.winner ||
        storeState.isAutoPlaying ||
        storeState.isAutoRolling
      ) {
        return
      }

      const timings = AUTO_PLAY_TIMINGS[speed]
      const runId = ++autoplayRunId

      set({ isAutoPlaying: true, isAutoRolling: false })
      logger.info(`Playing ${turnsCount} random turns at "${speed}" speed`)

      const isCancelled = () => runId !== autoplayRunId
      const currentState = extractGameState(storeState)

      const commitState = (
        state: GameState,
        movedPieceId: string | null = null,
      ) => {
        const previousState = get()
        const partialState = buildSyncedGameState(state)

        set({
          ...partialState,
          legalMoves: state.currentThrow ? getLegalMoves(state) : [],
          lastMove:
            movedPieceId === null
              ? null
              : buildLastMove(previousState, state, movedPieceId),
        })
        get().syncState(partialState)
      }

      if (
        timings.rollAnimationMs === 0 &&
        timings.afterMoveMs === 0 &&
        timings.afterThrowMs === 0
      ) {
        const nextState = playImmediateAutoTurns(currentState, turnsCount, {
          applyMove,
          autoPassIfNoMoves,
          getLegalMoves,
          getThrowResult: () => getThrowResult(currentState.gameType),
          random: dependencies.random,
        })

        if (isCancelled()) return
        commitState(nextState)
        set({ isAutoPlaying: false, isAutoRolling: false })
        logger.info(`Finished autoplay. Winner: ${nextState.winner || 'None'}`)
        return
      }

      let nextState = currentState

      for (let index = 0; index < turnsCount; index += 1) {
        if (nextState.winner || isCancelled()) break

        if (!nextState.currentThrow) {
          set({ isAutoRolling: true, currentThrow: null, legalMoves: [] })
          await sleep(timings.rollAnimationMs)
          if (isCancelled()) {
            set({ isAutoPlaying: false, isAutoRolling: false })
            return
          }

          const throwResult = getThrowResult(nextState.gameType)
          nextState = { ...nextState, currentThrow: throwResult }
          const throwPartial: Partial<GameState> = { currentThrow: throwResult }
          set({
            currentThrow: throwResult,
            legalMoves: getLegalMoves(nextState),
            isAutoRolling: false,
          })
          get().syncState(throwPartial)

          await sleep(timings.afterThrowMs)
          if (isCancelled()) {
            set({ isAutoPlaying: false, isAutoRolling: false })
            return
          }
        }

        const executedTurn = executeAutoPlayTurn(nextState, {
          applyMove,
          autoPassIfNoMoves,
          getLegalMoves,
          getThrowResult: () => getThrowResult(nextState.gameType),
          random: dependencies.random,
        })
        nextState = executedTurn.nextState
        commitState(nextState, executedTurn.movedPieceId)
        await sleep(timings.afterMoveMs)
      }

      if (isCancelled()) {
        set({ isAutoPlaying: false, isAutoRolling: false })
        return
      }

      commitState(nextState)
      set({ isAutoPlaying: false, isAutoRolling: false })
      logger.info(`Finished autoplay. Winner: ${nextState.winner || 'None'}`)
    },

    resetGame: () => {
      const state = get()
      if (state.isOnline || state.isAutoPlaying || state.isAutoRolling) return

      cancelAutoplay()
      clearAutoPassTimer()
      clearLastMoveTimeout()
      const nextState =
        state.gameType === 'senet'
          ? senetLogic.createInitialState(state.ruleset)
          : mehenLogic.createInitialState()
      set({ ...nextState, legalMoves: [] })
    },

    setHoveredPieceId: (pieceId) => set({ hoveredPieceId: pieceId }),

    setOfflineMode: (mode) => set({ offlineMode: mode }),

    setShowGuide: (show) => set({ showGuide: show }),

    setGameType: (type) => {
      cancelAutoplay()
      clearAutoPassTimer()
      clearLastMoveTimeout()
      const logic = getGameLogic(type)
      set({
        ...logic.createInitialState(),
        gameType: type,
        legalMoves: []
      })
    },

    syncState: (state) => {
      if (get().isOnline) {
        connectionManager.syncState(state)
      }
    },

    throwSticks: () => {
      const state = get()
      if (
        state.winner ||
        state.currentThrow ||
        state.isAutoPlaying ||
        state.isAutoRolling
      ) {
        return
      }
      if (!isLocalTurnState(state)) return

      clearAutoPassTimer()

      const throwResult = getThrowResult(state.gameType)
      const partialState: Partial<GameState> = { currentThrow: throwResult }
      set(partialState)
      get().syncState(partialState)

      const stateAfterThrow = get()
      const currentGameState = extractGameState(stateAfterThrow)
      const legalMoves = getLegalMoves(currentGameState)

      if (legalMoves.length === 0) {
        autoPassTimer = setTimeoutFn(() => {
          autoPassTimer = null
          get().passTurn()
        }, 1500)
      }

      set({ legalMoves })
    },
  }))
}

export const useSenetStore = createSenetStore()
