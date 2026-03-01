import type {
  GameState,
  HistoryEvent,
  Piece,
  PlayerID,
  ThrowResult,
  UrConfig,
} from '../../../engine/types'
import { getFourBinaryDiceThrow } from '../../../engine/throwSticks'
import { UrRuleset } from './rules'

const DEFAULT_PLAYERS: PlayerID[] = ['anubis', 'sphinx']
const OFF_BOARD = 0
const ENTRY_POSITION = 1
const FINISH_POSITION = 15

export const DEFAULT_UR_CONFIG: UrConfig = {
  piecesPerPlayer: 7,
  trackLength: 14,
  finishPosition: FINISH_POSITION,
  rosettePositions: [4, 8, 14],
  sharedTrackStart: 5,
  sharedTrackEnd: 12,
  throwMode: 'four_binary_tetrahedra_0_to_4',
  exactBearOff: true,
  safeRosettes: true,
  extraThrowOnRosette: true,
}

const cloneState = (state: GameState): GameState => structuredClone(state)

const getConfig = (state: GameState): UrConfig => ({
  ...DEFAULT_UR_CONFIG,
  ...state.urConfig,
})

const getNextPlayer = (currentPlayer: PlayerID) =>
  currentPlayer === 'anubis' ? 'sphinx' : 'anubis'

const getPiecesForPlayer = (state: GameState, player: PlayerID) =>
  state.board.filter((piece) => piece.player === player)

const findPiece = (state: GameState, pieceId: string) =>
  state.board.find((piece) => piece.id === pieceId)

const isSharedPosition = (state: GameState, position: number) => {
  const config = getConfig(state)
  return position >= config.sharedTrackStart && position <= config.sharedTrackEnd
}

const isRosettePosition = (state: GameState, position: number) =>
  getConfig(state).rosettePositions.includes(position as 4 | 8 | 14)

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

const getOpponentOccupant = (
  state: GameState,
  player: PlayerID,
  position: number,
) => {
  if (!isSharedPosition(state, position)) return undefined

  return state.board.find(
    (piece) => piece.player !== player && piece.position === position,
  )
}

const appendHistory = (historyLog: HistoryEvent[], event: HistoryEvent) => {
  historyLog.push(event)
}

export function createInitialState(): GameState {
  const board: Piece[] = []

  DEFAULT_PLAYERS.forEach((player) => {
    for (let index = 1; index <= DEFAULT_UR_CONFIG.piecesPerPlayer; index += 1) {
      board.push({
        id: `${player}-ur_token-${index}`,
        player,
        type: 'ur_token',
        position: OFF_BOARD,
      })
    }
  })

  return {
    gameType: 'ur',
    board,
    currentPlayer: 'anubis',
    currentThrow: null,
    ruleset: UrRuleset,
    urConfig: DEFAULT_UR_CONFIG,
    winner: null,
    historyLog: [{ key: 'history.ur_started' }],
    lastRoll: null,
    players: DEFAULT_PLAYERS,
    turnIndex: 0,
  }
}

export const initializeGame = createInitialState

export const getThrowResult = (): ThrowResult => getFourBinaryDiceThrow()

export function isValidMove(
  state: GameState,
  pieceId: string,
  roll: number = state.currentThrow?.value ?? 0,
  player: PlayerID = state.currentPlayer,
): { valid: boolean; reason?: string; targetSquare?: number } {
  if (state.winner) {
    return { valid: false, reason: 'game_over' }
  }

  if (state.currentThrow === null && roll <= 0) {
    return { valid: false, reason: 'no_throw' }
  }

  const piece = findPiece(state, pieceId)
  if (!piece || piece.player !== player) {
    return { valid: false, reason: 'not_your_piece' }
  }

  if (piece.position === FINISH_POSITION) {
    return { valid: false, reason: 'piece_already_borne_off' }
  }

  if (roll <= 0) {
    return { valid: false, reason: 'no_legal_move_for_roll' }
  }

  const targetSquare = piece.position === OFF_BOARD ? ENTRY_POSITION : piece.position + roll
  if (targetSquare > FINISH_POSITION) {
    return { valid: false, reason: 'requires_exact_bear_off' }
  }

  if (targetSquare === FINISH_POSITION) {
    return { valid: true, targetSquare }
  }

  if (piece.position === OFF_BOARD) {
    if (getOwnOccupant(state, player, ENTRY_POSITION)) {
      return { valid: false, reason: 'no_piece_can_enter' }
    }

    return { valid: true, targetSquare: ENTRY_POSITION }
  }

  if (getOwnOccupant(state, player, targetSquare, piece.id)) {
    return { valid: false, reason: 'target_occupied_by_own_piece' }
  }

  const opponentOccupant = getOpponentOccupant(state, player, targetSquare)
  if (opponentOccupant && isRosettePosition(state, targetSquare)) {
    return { valid: false, reason: 'rosette_occupied' }
  }

  return { valid: true, targetSquare }
}

export function getLegalMoves(
  state: GameState,
  player: PlayerID = state.currentPlayer,
  roll: number = state.currentThrow?.value ?? 0,
): { pieceId: string; targetSquare: number }[] {
  if (roll <= 0) return []

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

  const roll = state.currentThrow.value
  const validation = isValidMove(state, pieceId, roll, state.currentPlayer)
  if (!validation.valid || validation.targetSquare === undefined) {
    return state
  }

  const nextState = cloneState(state)
  const piece = findPiece(nextState, pieceId)
  if (!piece) return state

  const turn = nextState.turnIndex ?? 0
  const from = piece.position
  const targetSquare = validation.targetSquare
  const opponentOccupant =
    targetSquare < FINISH_POSITION
      ? getOpponentOccupant(nextState, nextState.currentPlayer, targetSquare)
      : undefined

  if (opponentOccupant) {
    const capturedFrom = opponentOccupant.position
    opponentOccupant.position = OFF_BOARD
    appendHistory(nextState.historyLog, {
      key: 'history.ur_capture',
      turn,
      player: nextState.currentPlayer,
      roll,
      piece: opponentOccupant.id,
      pieceId: opponentOccupant.id,
      from: capturedFrom,
      to: OFF_BOARD,
      eventType: 'CAPTURE',
    })
  }

  piece.position = targetSquare
  appendHistory(nextState.historyLog, {
    key:
      from === OFF_BOARD
        ? 'history.ur_enter'
        : targetSquare === FINISH_POSITION
          ? 'history.ur_bear_off'
          : 'history.ur_move',
    turn,
    player: nextState.currentPlayer,
    roll,
    piece: piece.id,
    pieceId: piece.id,
    from,
    to: targetSquare,
    eventType: targetSquare === FINISH_POSITION ? 'BEAR_OFF' : 'MOVE',
  })

  const allFinished = getPiecesForPlayer(nextState, nextState.currentPlayer).every(
    (candidate) => candidate.position === FINISH_POSITION,
  )

  if (allFinished) {
    nextState.winner = nextState.currentPlayer
    appendHistory(nextState.historyLog, {
      key: 'history.ur_win',
      turn,
      player: nextState.currentPlayer,
      roll,
      piece: piece.id,
      pieceId: piece.id,
      from,
      to: targetSquare,
      eventType: 'WIN',
    })
    nextState.currentThrow = null
    nextState.lastRoll = roll
    return nextState
  }

  if (
    targetSquare < FINISH_POSITION &&
    isRosettePosition(nextState, targetSquare) &&
    getConfig(nextState).extraThrowOnRosette
  ) {
    appendHistory(nextState.historyLog, {
      key: 'history.ur_rosette',
      turn,
      player: nextState.currentPlayer,
      roll,
      piece: piece.id,
      pieceId: piece.id,
      from,
      to: targetSquare,
      eventType: 'EXTRA_TURN',
    })
  } else {
    nextState.currentPlayer = getNextPlayer(nextState.currentPlayer)
    nextState.turnIndex = turn + 1
  }

  nextState.currentThrow = null
  nextState.lastRoll = roll
  return nextState
}

export function autoPassIfNoMoves(state: GameState): GameState {
  if (!state.currentThrow) return state

  const roll = state.currentThrow.value
  if (getLegalMoves(state, state.currentPlayer, roll).length > 0) {
    return state
  }

  const nextState = cloneState(state)
  const turn = nextState.turnIndex ?? 0

  appendHistory(nextState.historyLog, {
    key: 'history.ur_blocked',
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
