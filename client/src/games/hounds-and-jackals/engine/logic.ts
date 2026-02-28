import type {
  GameState,
  HistoryEvent,
  HoundsAndJackalsConfig,
  Piece,
  PlayerID,
  ThrowResult,
} from '../../../engine/types'
import { getFourStickThrow } from '../../../engine/throwSticks'
import {
  HOUNDS_AND_JACKALS_CONFIG,
  HOUNDS_AND_JACKALS_TRACK_PLAYERS,
} from '../boardMetadata'
import { HoundsAndJackalsRuleset } from './rules'

const OFF_BOARD = 0
const START_HOLE = 1

const cloneState = (state: GameState): GameState => structuredClone(state)

const getConfig = (state: GameState): HoundsAndJackalsConfig =>
  state.houndsAndJackalsConfig ?? HOUNDS_AND_JACKALS_CONFIG

const getPiecesForPlayer = (state: GameState, player: PlayerID) =>
  state.board.filter((piece) => piece.player === player)

const findPiece = (state: GameState, pieceId: string) =>
  state.board.find((piece) => piece.id === pieceId)

const getNextPlayer = (currentPlayer: PlayerID) =>
  currentPlayer === 'anubis' ? 'sphinx' : 'anubis'

const appendHistory = (historyLog: HistoryEvent[], event: HistoryEvent) => {
  historyLog.push(event)
}

const getOwnOccupant = (
  state: GameState,
  player: PlayerID,
  position: number,
  excludePieceId?: string,
) =>
  state.board.find(
    (piece) =>
      piece.player === player &&
      piece.position === position &&
      piece.id !== excludePieceId,
  )

const resolveDestination = (
  state: GameState,
  player: PlayerID,
  piece: Piece,
  roll: number,
) => {
  const config = getConfig(state)
  const landingSquare = piece.position === OFF_BOARD ? START_HOLE : piece.position + roll

  if (landingSquare > config.goalPosition) {
    return { valid: false, reason: 'Requires exact throw to finish' }
  }

  const specialHole = config.specialHoles[landingSquare]
  const finalSquare = specialHole?.target ?? landingSquare

  const isGoalSquare = finalSquare === config.goalPosition

  if (!isGoalSquare && getOwnOccupant(state, player, finalSquare, piece.id)) {
    return {
      valid: false,
      reason:
        finalSquare === landingSquare
          ? 'Target occupied by your own peg'
          : 'Linked destination occupied by your own peg',
    }
  }

  return {
    valid: true,
    finalSquare,
    landingSquare,
    specialHole,
  }
}

export function initializeGame(
  config: Partial<HoundsAndJackalsConfig> = {},
): GameState {
  const normalizedConfig: HoundsAndJackalsConfig = {
    ...HOUNDS_AND_JACKALS_CONFIG,
    ...config,
    specialHoles: {
      ...HOUNDS_AND_JACKALS_CONFIG.specialHoles,
      ...(config.specialHoles ?? {}),
    },
  }
  const board: Piece[] = []

  for (const player of HOUNDS_AND_JACKALS_TRACK_PLAYERS) {
    for (let index = 1; index <= normalizedConfig.piecesPerPlayer; index += 1) {
      board.push({
        id: `${player}-peg-${index}`,
        player,
        type: 'peg',
        position: OFF_BOARD,
      })
    }
  }

  return {
    gameType: 'hounds-and-jackals',
    board,
    currentPlayer: 'anubis',
    currentThrow: null,
    ruleset: HoundsAndJackalsRuleset,
    houndsAndJackalsConfig: normalizedConfig,
    winner: null,
    historyLog: [{ key: 'history.hounds_started' }],
    lastRoll: null,
    players: HOUNDS_AND_JACKALS_TRACK_PLAYERS,
    turnIndex: 0,
  }
}

export const createInitialState = initializeGame

export const getThrowResult = (): ThrowResult => getFourStickThrow()

export function isValidMove(
  state: GameState,
  pieceId: string,
  roll: number,
  player: PlayerID = state.currentPlayer,
): { valid: boolean; reason?: string; targetSquare?: number; landingSquare?: number } {
  if (state.winner) {
    return { valid: false, reason: 'Game is over' }
  }

  const piece = findPiece(state, pieceId)
  if (!piece) {
    return { valid: false, reason: 'Piece not found' }
  }
  if (piece.player !== player) {
    return { valid: false, reason: 'Not your piece' }
  }

  const resolved = resolveDestination(state, player, piece, roll)
  if (!resolved.valid || resolved.finalSquare === undefined || resolved.landingSquare === undefined) {
    return { valid: false, reason: resolved.reason }
  }

  return {
    valid: true,
    targetSquare: resolved.finalSquare,
    landingSquare: resolved.landingSquare,
  }
}

export function getLegalMoves(
  state: GameState,
  player: PlayerID = state.currentPlayer,
  roll: number = state.currentThrow?.value ?? 0,
): { pieceId: string; targetSquare: number }[] {
  if (!roll) return []

  return getPiecesForPlayer(state, player)
    .map((piece) => {
      const validation = isValidMove(state, piece.id, roll, player)
      if (!validation.valid || validation.targetSquare === undefined) {
        return null
      }

      return {
        pieceId: piece.id,
        targetSquare: validation.targetSquare,
      }
    })
    .filter((move): move is { pieceId: string; targetSquare: number } => move !== null)
}

export function applyMove(state: GameState, pieceId: string): GameState {
  if (!state.currentThrow) return state

  const piece = findPiece(state, pieceId)
  if (!piece || piece.player !== state.currentPlayer) return state

  const resolved = resolveDestination(
    state,
    state.currentPlayer,
    piece,
    state.currentThrow.value,
  )
  if (!resolved.valid || resolved.finalSquare === undefined || resolved.landingSquare === undefined) {
    return state
  }

  const nextState = cloneState(state)
  const nextPiece = findPiece(nextState, pieceId)
  if (!nextPiece) return state

  const turn = nextState.turnIndex ?? 0
  const from = nextPiece.position
  nextPiece.position = resolved.finalSquare

  appendHistory(nextState.historyLog, {
    key: 'history.hounds_move',
    turn,
    player: nextState.currentPlayer,
    roll: state.currentThrow.value,
    piece: pieceId,
    from,
    to: resolved.landingSquare,
    eventType: 'MOVE',
  })

  if (resolved.specialHole) {
    appendHistory(nextState.historyLog, {
      key:
        resolved.specialHole.type === 'good'
          ? 'history.hounds_good_jump'
          : 'history.hounds_bad_jump',
      turn,
      player: nextState.currentPlayer,
      roll: state.currentThrow.value,
      piece: pieceId,
      from: resolved.landingSquare,
      to: resolved.finalSquare,
      eventType: resolved.specialHole.type === 'good' ? 'GOOD_JUMP' : 'BAD_JUMP',
      params: { label: resolved.specialHole.label },
    })
  }

  const goalPosition = getConfig(nextState).goalPosition
  if (resolved.finalSquare === goalPosition) {
    appendHistory(nextState.historyLog, {
      key: 'history.hounds_finish',
      turn,
      player: nextState.currentPlayer,
      roll: state.currentThrow.value,
      piece: pieceId,
      from,
      to: resolved.finalSquare,
      eventType: 'FINISH',
    })
  }

  const activePlayer = nextState.currentPlayer
  const allFinished = getPiecesForPlayer(nextState, activePlayer).every(
    (candidate) => candidate.position === goalPosition,
  )

  if (allFinished) {
    nextState.winner = activePlayer
    appendHistory(nextState.historyLog, {
      key: 'history.hounds_win',
      turn,
      player: activePlayer,
      roll: state.currentThrow.value,
      piece: pieceId,
      from,
      to: resolved.finalSquare,
      eventType: 'WIN',
    })
  } else {
    nextState.currentPlayer = getNextPlayer(activePlayer)
    nextState.turnIndex = turn + 1
  }

  nextState.currentThrow = null
  nextState.lastRoll = state.currentThrow.value
  return nextState
}

export function autoPassIfNoMoves(state: GameState): GameState {
  const roll = state.currentThrow?.value ?? 0
  if (!roll) return state

  if (getLegalMoves(state, state.currentPlayer, roll).length > 0) {
    return state
  }

  const nextState = cloneState(state)
  const turn = nextState.turnIndex ?? 0

  appendHistory(nextState.historyLog, {
    key: 'history.hounds_blocked',
    turn,
    player: nextState.currentPlayer,
    roll,
    eventType: 'BLOCKED',
  })

  nextState.currentPlayer = getNextPlayer(nextState.currentPlayer)
  nextState.currentThrow = null
  nextState.lastRoll = roll
  nextState.turnIndex = turn + 1
  return nextState
}
