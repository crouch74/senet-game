import { create } from 'zustand'
import type { GameState, OfflineMode, PlayerID } from './types'
import {
  applyMove as applyMoveDefault,
  autoPassIfNoMoves as autoPassIfNoMovesDefault,
  createInitialState,
  getLegalMoves as getLegalMovesDefault,
  getThrowResult as getThrowResultDefault,
} from './logic'
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

const extractGameState = (state: GameState): GameState => ({
  board: state.board,
  currentPlayer: state.currentPlayer,
  currentThrow: state.currentThrow,
  ruleset: state.ruleset,
  winner: state.winner,
  historyLog: state.historyLog,
})

const isLocalTurn = (
  state: Pick<
    SenetStore,
    | 'currentPlayer'
    | 'isConnectingToRoom'
    | 'isOnline'
    | 'isWaitingForOpponent'
    | 'localPlayer'
    | 'offlineHumanPlayer'
    | 'offlineMode'
  >,
) => {
  if (state.isOnline) {
    if (state.isWaitingForOpponent || state.isConnectingToRoom) return false
    return state.currentPlayer === state.localPlayer
  }

  if (state.offlineMode === 'vs_pc') {
    return state.currentPlayer === state.offlineHumanPlayer
  }

  return true
}

interface SenetStoreDependencies extends AutoPlayDependencies {
  clearTimeoutFn?: typeof window.clearTimeout
  createConnectionManager?: typeof createMatchConnectionManager
  log?: Pick<Console, 'error' | 'log'>
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
  lastMove: { pieceId: string; from: number; to: number; isCapture?: boolean } | null
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
  showGuide: boolean
  syncState: (state: Partial<GameState>) => void
  throwSticks: () => void
}

export const createSenetStore = (
  dependencies: SenetStoreDependencies = {},
) => {
  const logger = dependencies.log ?? console
  const setTimeoutFn =
    dependencies.setTimeoutFn ?? window.setTimeout.bind(window)
  const clearTimeoutFn =
    dependencies.clearTimeoutFn ?? window.clearTimeout.bind(window)
  const getThrowResult = dependencies.getThrowResult ?? getThrowResultDefault
  const getLegalMoves = dependencies.getLegalMoves ?? getLegalMovesDefault
  const applyMove = dependencies.applyMove ?? applyMoveDefault
  const autoPassIfNoMoves =
    dependencies.autoPassIfNoMoves ?? autoPassIfNoMovesDefault
  const connectionManager =
    (dependencies.createConnectionManager ?? createMatchConnectionManager)()

  let autoplayRunId = 0
  let autoPassTimer: ReturnType<typeof setTimeout> | null = null
  let clearLastMoveTimer: ReturnType<typeof setTimeout> | null = null

  const clearAutoPassTimer = () => {
    if (autoPassTimer !== null) {
      clearTimeoutFn(autoPassTimer)
      autoPassTimer = null
    }
  }

  const clearLastMoveTimeout = () => {
    if (clearLastMoveTimer !== null) {
      clearTimeoutFn(clearLastMoveTimer)
      clearLastMoveTimer = null
    }
  }

  const cancelAutoplay = () => {
    autoplayRunId += 1
  }

  return create<SenetStore>((set, get) => ({
    ...createInitialState(),
    legalMoves: [],
    hoveredPieceId: null,
    setHoveredPieceId: (pieceId) => set({ hoveredPieceId: pieceId }),
    lastMove: null,

    showGuide: false,
    setShowGuide: (show) => set({ showGuide: show }),

    offlineMode: 'play_and_pass',
    offlineHumanPlayer: 'anubis',
    setOfflineMode: (mode) => set({ offlineMode: mode }),

    isOnline: false,
    isConnectingToRoom: false,
    isWaitingForOpponent: false,
    roomId: null,
    localPlayer: null,
    roomJoinError: null,

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

      connectionManager.connect(normalizedRoomId, {
        onOpen: (joinedRoomId) => {
          logger.log(`🌐 Joined room ${joinedRoomId}`)
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
            logger.log('👁️ Joined as spectator')
          } else {
            logger.log(`🎮 Playing as ${role} — waiting for opponent`)
          }
        },
        onGameStart: ({ openingPlayer, openingRolls }) => {
          set((state) => ({
            isConnectingToRoom: false,
            isWaitingForOpponent: false,
            currentPlayer: openingPlayer ?? state.currentPlayer,
          }))

          if (openingPlayer && openingRolls) {
            logger.log(
              `⚔️ Both players connected — opening roll-off decided starter: anubis=${openingRolls.anubis}, sphinx=${openingRolls.sphinx}, starter=${openingPlayer}`,
            )
          } else {
            logger.log('⚔️ Both players connected — game resumed!')
          }
        },
        onSync: (state) => {
          set({ ...state, legalMoves: [] })
        },
        onOpponentDisconnected: () => {
          set({ isWaitingForOpponent: true })
          logger.log('⚠️ Opponent disconnected — gameplay paused')
        },
        onError: (message) => {
          logger.error('WebSocket Error:', message)
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

    clearRoomJoinError: () => set({ roomJoinError: null }),

    syncState: (state) => {
      if (get().isOnline) {
        connectionManager.syncState(state)
      }
    },

    throwSticks: () => {
      const state = get()
      if (state.winner || state.currentThrow || state.isAutoPlaying || state.isAutoRolling) {
        return
      }
      if (!isLocalTurn(state)) return

      clearAutoPassTimer()

      const throwResult = getThrowResult()
      const partialState: Partial<GameState> = { currentThrow: throwResult }
      set(partialState)
      get().syncState(partialState)

      const stateAfterThrow = get()
      const legalMoves = getLegalMoves(extractGameState(stateAfterThrow))

      if (legalMoves.length === 0) {
        autoPassTimer = setTimeoutFn(() => {
          autoPassTimer = null
          get().passTurn()
        }, 1500)
      }

      set({ legalMoves })
    },

    movePiece: (pieceId) => {
      const state = get()
      if (!state.currentThrow || state.isAutoPlaying || state.isAutoRolling) return
      if (!isLocalTurn(state)) return

      clearAutoPassTimer()

      const nextState = applyMove(extractGameState(state), pieceId)
      const oldPiece = state.board.find((piece) => piece.id === pieceId)
      const newPiece = nextState.board.find((piece) => piece.id === pieceId)

      let capturedPieceId: string | null = null
      nextState.board.forEach((piece) => {
        const previousPiece = state.board.find((oldPieceState) => oldPieceState.id === piece.id)
        if (previousPiece && previousPiece.position !== piece.position && piece.id !== pieceId) {
          capturedPieceId = piece.id
        }
      })

      const partialState: Partial<GameState> = {
        board: nextState.board,
        currentPlayer: nextState.currentPlayer,
        currentThrow: nextState.currentThrow,
        winner: nextState.winner,
        historyLog: nextState.historyLog,
      }

      set({
        ...partialState,
        legalMoves: [],
        lastMove:
          oldPiece && newPiece
            ? {
                pieceId,
                from: oldPiece.position,
                to: newPiece.position,
                isCapture: Boolean(capturedPieceId),
              }
            : null,
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
      if (!isLocalTurn(state)) return

      clearAutoPassTimer()

      const nextState = autoPassIfNoMoves(extractGameState(state))
      const partialState: Partial<GameState> = {
        currentPlayer: nextState.currentPlayer,
        currentThrow: nextState.currentThrow,
        historyLog: nextState.historyLog,
        winner: nextState.winner,
      }

      set({ ...partialState, legalMoves: [] })
      get().syncState(partialState)
    },

    resetGame: () => {
      const state = get()
      if (state.isOnline || state.isAutoPlaying || state.isAutoRolling) return

      cancelAutoplay()
      clearAutoPassTimer()
      clearLastMoveTimeout()

      set({ ...createInitialState(state.ruleset), legalMoves: [] })
    },

    isAutoPlaying: false,
    isAutoRolling: false,

    playRandomTurns: async (turnsCount, speed = 'immediate') => {
      const storeState = get()
      if (storeState.isOnline || storeState.winner || storeState.isAutoPlaying || storeState.isAutoRolling) {
        return
      }

      const timings = AUTO_PLAY_TIMINGS[speed]
      const runId = ++autoplayRunId

      set({ isAutoPlaying: true, isAutoRolling: false })
      logger.log(`🤖 Playing ${turnsCount} random turns at "${speed}" speed...`)

      const isCancelled = () => runId !== autoplayRunId
      const currentState = extractGameState(storeState)

      const commitState = (state: GameState, movedPieceId: string | null = null) => {
        const oldState = get()
        const oldPiece = movedPieceId
          ? oldState.board.find((piece) => piece.id === movedPieceId)
          : undefined
        const newPiece = movedPieceId
          ? state.board.find((piece) => piece.id === movedPieceId)
          : undefined

        const partialState: Partial<GameState> = {
          board: state.board,
          currentPlayer: state.currentPlayer,
          currentThrow: state.currentThrow,
          winner: state.winner,
          historyLog: state.historyLog,
        }

        set({
          ...partialState,
          legalMoves: state.currentThrow ? getLegalMoves(state) : [],
          lastMove:
            oldPiece && newPiece
              ? {
                  pieceId: movedPieceId!,
                  from: oldPiece.position,
                  to: newPiece.position,
                }
              : null,
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
          getThrowResult,
          random: dependencies.random,
        })

        if (isCancelled()) return
        commitState(nextState)
        set({ isAutoPlaying: false, isAutoRolling: false })
        logger.log(`✅ Finished playing random turns. Winner: ${nextState.winner || 'None'}`)
        return
      }

      let nextState = currentState

      for (let i = 0; i < turnsCount; i += 1) {
        if (nextState.winner || isCancelled()) break

        if (!nextState.currentThrow) {
          set({ isAutoRolling: true, currentThrow: null, legalMoves: [] })
          await sleep(timings.rollAnimationMs)
          if (isCancelled()) {
            set({ isAutoPlaying: false, isAutoRolling: false })
            return
          }

          const throwResult = getThrowResult()
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
          getThrowResult,
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
      logger.log(`✅ Finished playing random turns. Winner: ${nextState.winner || 'None'}`)
    },
  }))
}

export const useSenetStore = createSenetStore()
