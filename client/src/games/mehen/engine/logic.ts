import type {
  GameState,
  HistoryEvent,
  MehenConfig,
  MehenMove,
  Piece,
  PlayerID,
  ThrowResult,
} from '../../../engine/types'
import { CommonRuleset } from '../../senet/engine/rules'

const DEFAULT_PLAYERS: PlayerID[] = ['anubis', 'sphinx']
const MAX_PLAYERS = 6
const MIN_PLAYERS = 2
const OFF_BOARD = 0
const START_CELL = 1

export const DEFAULT_MEHEN_CONFIG: MehenConfig = {
  boardSize: 60,
  ballsPerPlayer: 5,
  exactFinish: true,
  allowBounce: false,
  lionBlocks: true,
  captureMode: 'SEND_TO_START',
  safeCells: [10, 20, 30, 40, 50],
  extraRollValues: [1, 5],
  winCondition: 'ALL_BALLS_AND_LION',
  requireExactCenterRoll: true,
  opponentLionMode: 'INVALID',
}

const cloneState = (state: GameState): GameState => structuredClone(state)

const normalizePlayers = (players: PlayerID[] = DEFAULT_PLAYERS) => {
  const uniquePlayers = [...new Set(players)]
  if (uniquePlayers.length < MIN_PLAYERS || uniquePlayers.length > MAX_PLAYERS) {
    throw new Error('Mehen requires 2 to 6 unique players')
  }
  return uniquePlayers
}

const normalizeConfig = (config: Partial<MehenConfig> = {}): MehenConfig => ({
  ...DEFAULT_MEHEN_CONFIG,
  ...config,
  safeCells: [...(config.safeCells ?? DEFAULT_MEHEN_CONFIG.safeCells)].sort((a, b) => a - b),
  extraRollValues: [...(config.extraRollValues ?? DEFAULT_MEHEN_CONFIG.extraRollValues)].sort((a, b) => a - b),
})

const getFinalCell = (state: GameState) => state.boardSize ?? state.mehenConfig?.boardSize ?? DEFAULT_MEHEN_CONFIG.boardSize

const getPlayers = (state: GameState) => state.players ?? DEFAULT_PLAYERS

const getConfig = (state: GameState): MehenConfig =>
  normalizeConfig({
    ...state.mehenConfig,
    boardSize: state.boardSize ?? state.mehenConfig?.boardSize,
    safeCells: state.safeCells ?? state.mehenConfig?.safeCells,
  })

const findPiece = (state: GameState, pieceId: string) => state.board.find((piece) => piece.id === pieceId)

const isFinished = (state: GameState, piece: Piece) => piece.position === getFinalCell(state)
const isOffBoard = (piece: Piece) => piece.position === OFF_BOARD

const isSafeCell = (state: GameState, position: number) => getConfig(state).safeCells.includes(position)

const getOwnLion = (state: GameState, player: PlayerID) =>
  state.board.find((piece) => piece.player === player && piece.type === 'lion')

const annotateProtection = (state: GameState) => {
  state.board.forEach((piece) => {
    piece.isProtected = isProtected(state, piece)
  })
  return state
}

export const isProtected = (state: GameState, piece: Piece) => {
  if (piece.type !== 'ball') return false
  if (piece.position <= OFF_BOARD || isFinished(state, piece)) return false
  if (isSafeCell(state, piece.position)) return true

  const ownLion = getOwnLion(state, piece.player)
  return ownLion !== undefined && Math.abs(ownLion.position - piece.position) <= 1
}

const resolveDestination = (
  currentPosition: number,
  roll: number,
  config: MehenConfig,
) => {
  if (currentPosition === OFF_BOARD) {
    return { destination: START_CELL, bounced: false }
  }

  const rawTarget = currentPosition + roll
  const finalCell = config.boardSize

  if (rawTarget <= finalCell) {
    return { destination: rawTarget, bounced: false }
  }

  if (config.allowBounce) {
    const overshoot = rawTarget - finalCell
    return { destination: finalCell - overshoot, bounced: true }
  }

  if (config.exactFinish || config.requireExactCenterRoll) {
    return null
  }

  return { destination: finalCell, bounced: false }
}

const getOccupants = (state: GameState, position: number, excludePieceId?: string) =>
  state.board.filter((piece) => piece.position === position && piece.id !== excludePieceId)

const appendHistory = (
  historyLog: HistoryEvent[],
  payload: Omit<HistoryEvent, 'pieceId'> & { piece?: string },
) => {
  historyLog.push({
    ...payload,
    pieceId: payload.piece,
  })
}

const getNextPlayer = (state: GameState, currentPlayer: PlayerID) => {
  const players = getPlayers(state)
  const currentIndex = players.indexOf(currentPlayer)
  return players[(currentIndex + 1) % players.length]
}

const hasPlayerWon = (state: GameState, player: PlayerID) => {
  const finalCell = getFinalCell(state)
  const config = getConfig(state)
  const playerPieces = state.board.filter((piece) => piece.player === player)
  const allBallsFinished = playerPieces
    .filter((piece) => piece.type === 'ball')
    .every((piece) => piece.position === finalCell)
  const lionFinished = playerPieces.some(
    (piece) => piece.type === 'lion' && piece.position === finalCell,
  )
  const anyFinished = playerPieces.some((piece) => piece.position === finalCell)

  switch (config.winCondition) {
    case 'LION_ONLY':
      return lionFinished
    case 'BALLS_ONLY':
      return allBallsFinished
    case 'FIRST_PIECE_TO_CENTER':
      return anyFinished
    case 'ALL_BALLS_AND_LION':
    default:
      return allBallsFinished && lionFinished
  }
}

const buildMove = (
  state: GameState,
  pieceId: string,
  player: PlayerID,
  roll: number,
): MehenMove | null => {
  const piece = findPiece(state, pieceId)
  if (!piece || piece.player !== player) return null

  const validation = isValidMove(state, pieceId, roll, player)
  if (!validation.valid || validation.targetSquare === undefined) return null

  return {
    pieceId,
    player,
    roll,
    destination: validation.targetSquare,
    targetSquare: validation.targetSquare,
  }
}

export function initializeGame(
  config: Partial<MehenConfig> = {},
  players: PlayerID[] = DEFAULT_PLAYERS,
): GameState {
  const normalizedPlayers = normalizePlayers(players)
  const normalizedConfig = normalizeConfig(config)
  const board: Piece[] = []

  normalizedPlayers.forEach((player) => {
    board.push({ id: `${player}-lion`, player, type: 'lion', position: 0 })
    for (let index = 1; index <= normalizedConfig.ballsPerPlayer; index += 1) {
      board.push({
        id: `${player}-ball-${index}`,
        player,
        type: 'ball',
        position: 0,
      })
    }
  })

  return annotateProtection({
    gameType: 'mehen',
    board,
    boardSize: normalizedConfig.boardSize,
    currentPlayer: normalizedPlayers[0],
    currentThrow: null,
    lastRoll: null,
    ruleset: CommonRuleset,
    mehenConfig: normalizedConfig,
    safeCells: normalizedConfig.safeCells,
    winner: null,
    historyLog: [],
    turnIndex: 0,
    players: normalizedPlayers,
  })
}

export const createInitialState = initializeGame

export function rollDice(seed: number): ThrowResult {
  const normalizedSeed = Math.abs(Math.trunc(seed)) || 1
  const next = (normalizedSeed * 48271) % 0x7fffffff
  const value = (next % 5) + 1
  return {
    lightSidesUp: value === 5 ? 0 : value,
    value,
  }
}

export const getThrowResult = (seed?: number) =>
  seed === undefined
    ? rollDice(Math.floor(Math.random() * 0x7fffffff) + 1)
    : rollDice(seed)

export function isValidMove(
  state: GameState,
  pieceId: string,
  roll: number,
  player: PlayerID = state.currentPlayer,
): { valid: boolean; reason?: string; targetSquare?: number } {
  if (state.winner) return { valid: false, reason: 'Game is over' }

  const config = getConfig(state)
  const piece = findPiece(state, pieceId)
  if (!piece) return { valid: false, reason: 'Piece not found' }
  if (piece.player !== player) return { valid: false, reason: 'Not your piece' }
  if (isFinished(state, piece)) {
    return { valid: false, reason: 'Piece has already reached the center' }
  }

  const destination = resolveDestination(piece.position, roll, config)
  if (destination === null) {
    return { valid: false, reason: 'Requires exact roll to finish' }
  }

  const { destination: targetSquare } = destination
  if (isOffBoard(piece)) {
    const startOccupants = getOccupants(state, START_CELL, piece.id)
    if (startOccupants.length > 0) {
      const ownOccupant = startOccupants.find((occupant) => occupant.player === player)
      if (ownOccupant) {
        return { valid: false, reason: 'Target occupied by your own piece' }
      }

      const opponentLion = startOccupants.find((occupant) => occupant.type === 'lion')
      if (opponentLion) {
        return { valid: false, reason: 'Cannot land on opponent lion' }
      }

      if (startOccupants.some((occupant) => occupant.type === 'ball' && isProtected(state, occupant))) {
        return { valid: false, reason: 'Opponent piece is protected' }
      }
    }

    return { valid: true, targetSquare: START_CELL }
  }

  const travelPositions: number[] = []
  const finalCell = config.boardSize
  let cursor = piece.position
  let direction = 1

  for (let step = 0; step < roll; step += 1) {
    cursor += direction
    if (cursor > finalCell) {
      cursor = finalCell - 1
      direction = -1
    }
    travelPositions.push(cursor)
  }

  if (config.lionBlocks && piece.type === 'ball') {
    const blockedAt = travelPositions.find((position) =>
      state.board.some(
        (occupant) =>
          occupant.player !== player &&
          occupant.type === 'lion' &&
          occupant.position === position,
      ),
    )
    if (blockedAt !== undefined) {
      return { valid: false, reason: `Path blocked by opponent lion at ${blockedAt}` }
    }
  }

  const occupants = getOccupants(state, targetSquare, piece.id)
  if (targetSquare !== finalCell && occupants.length > 0) {
    const ownOccupant = occupants.find((occupant) => occupant.player === player)
    if (ownOccupant) {
      return { valid: false, reason: 'Target occupied by your own piece' }
    }

    const opponentLion = occupants.find((occupant) => occupant.type === 'lion')
    if (opponentLion) {
      return {
        valid: false,
        reason:
          config.opponentLionMode === 'BLOCKED'
            ? 'Move blocked by opponent lion'
            : 'Cannot land on opponent lion',
      }
    }

    const capturableBalls = occupants.filter((occupant) => occupant.type === 'ball')
    if (capturableBalls.some((occupant) => isProtected(state, occupant))) {
      return { valid: false, reason: 'Opponent piece is protected' }
    }
  }

  return { valid: true, targetSquare }
}

export function getLegalMoves(
  state: GameState,
  player: PlayerID = state.currentPlayer,
  roll: number = state.currentThrow?.value ?? 0,
): MehenMove[] {
  if (!roll) return []

  return state.board
    .filter((piece) => piece.player === player)
    .map((piece) => buildMove(state, piece.id, player, roll))
    .filter((move): move is MehenMove => move !== null)
}

export function applyMove(
  state: GameState,
  moveOrPieceId: MehenMove | string,
): GameState {
  if (typeof moveOrPieceId !== 'string' && moveOrPieceId.player !== state.currentPlayer) {
    return state
  }

  const move =
    typeof moveOrPieceId === 'string'
      ? buildMove(
          state,
          moveOrPieceId,
          state.currentPlayer,
          state.currentThrow?.value ?? 0,
        )
      : buildMove(
          state,
          moveOrPieceId.pieceId,
          moveOrPieceId.player,
          moveOrPieceId.roll,
        )

  if (!move) return state

  const nextState = cloneState(state)
  const piece = findPiece(nextState, move.pieceId)
  if (!piece) return state

  const turn = nextState.turnIndex ?? 0
  const from = piece.position
  const config = getConfig(nextState)
  const occupants = getOccupants(nextState, move.destination, move.pieceId)

  piece.position = move.destination

  appendHistory(nextState.historyLog, {
    key: 'history.mehen_move',
    turn,
    player: move.player,
    roll: move.roll,
    piece: move.pieceId,
    from,
    to: move.destination,
    eventType: 'MOVE',
  })

  occupants
    .filter((occupant) => occupant.player !== move.player && occupant.type === 'ball')
    .forEach((occupant) => {
      const originalPosition = occupant.position
      occupant.position = config.captureMode === 'SWAP_POSITIONS' ? from : OFF_BOARD
      appendHistory(nextState.historyLog, {
        key: 'history.mehen_capture',
        turn,
        player: move.player,
        roll: move.roll,
        piece: occupant.id,
        from: originalPosition,
        to: occupant.position,
        eventType: 'CAPTURE',
      })
    })

  if (isSafeCell(nextState, move.destination)) {
    appendHistory(nextState.historyLog, {
      key: 'history.mehen_safe_land',
      turn,
      player: move.player,
      roll: move.roll,
      piece: move.pieceId,
      from,
      to: move.destination,
      eventType: 'SAFE_LAND',
    })
  }

  if (piece.position === getFinalCell(nextState)) {
    appendHistory(nextState.historyLog, {
      key: 'history.mehen_finish',
      turn,
      player: move.player,
      roll: move.roll,
      piece: move.pieceId,
      from,
      to: move.destination,
      eventType: 'FINISH',
    })
  }

  if (hasPlayerWon(nextState, move.player)) {
    nextState.winner = move.player
    appendHistory(nextState.historyLog, {
      key: 'history.mehen_win',
      turn,
      player: move.player,
      roll: move.roll,
      piece: move.pieceId,
      from,
      to: move.destination,
      eventType: 'WIN',
    })
    nextState.currentThrow = null
    nextState.lastRoll = move.roll
    return annotateProtection(nextState)
  }

  if (config.extraRollValues.includes(move.roll)) {
    appendHistory(nextState.historyLog, {
      key: 'history.mehen_extra_turn',
      turn,
      player: move.player,
      roll: move.roll,
      piece: move.pieceId,
      from,
      to: move.destination,
      eventType: 'EXTRA_TURN',
    })
  } else {
    nextState.currentPlayer = getNextPlayer(nextState, move.player)
    nextState.turnIndex = turn + 1
  }

  nextState.currentThrow = null
  nextState.lastRoll = move.roll
  return annotateProtection(nextState)
}

export function autoPassIfNoMoves(state: GameState): GameState {
  const roll = state.currentThrow?.value ?? 0
  if (!roll) return state

  const legalMoves = getLegalMoves(state, state.currentPlayer, roll)
  if (legalMoves.length > 0) return state

  const nextState = cloneState(state)
  appendHistory(nextState.historyLog, {
    key: 'history.mehen_blocked',
    turn: nextState.turnIndex ?? 0,
    player: nextState.currentPlayer,
    roll,
    piece: undefined,
    from: undefined,
    to: undefined,
    eventType: 'BLOCKED',
  })
  nextState.currentPlayer = getNextPlayer(nextState, nextState.currentPlayer)
  nextState.turnIndex = (nextState.turnIndex ?? 0) + 1
  nextState.currentThrow = null
  nextState.lastRoll = roll
  return annotateProtection(nextState)
}

export const isGameOver = (state: GameState) => state.winner !== null
