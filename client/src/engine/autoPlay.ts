import type { GameState, ThrowResult } from './types'
import {
  applyMove as applyMoveDefault,
  autoPassIfNoMoves as autoPassIfNoMovesDefault,
  getLegalMoves as getLegalMovesDefault,
  getThrowResult as getThrowResultDefault,
} from './logic'

export type AutoPlaySpeed = 'human' | 'quick' | 'fast' | 'immediate'

export const AUTO_PLAY_TIMINGS: Record<
  AutoPlaySpeed,
  { rollAnimationMs: number; afterThrowMs: number; afterMoveMs: number }
> = {
  human: { rollAnimationMs: 800, afterThrowMs: 650, afterMoveMs: 900 },
  quick: { rollAnimationMs: 600, afterThrowMs: 350, afterMoveMs: 500 },
  fast: { rollAnimationMs: 350, afterThrowMs: 180, afterMoveMs: 260 },
  immediate: { rollAnimationMs: 0, afterThrowMs: 0, afterMoveMs: 0 },
}

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export interface AutoPlayDependencies {
  applyMove?: typeof applyMoveDefault
  autoPassIfNoMoves?: typeof autoPassIfNoMovesDefault
  getLegalMoves?: typeof getLegalMovesDefault
  getThrowResult?: typeof getThrowResultDefault
  random?: () => number
}

export interface AutoPlayTurnResult {
  movedPieceId: string | null
  nextState: GameState
  throwResult?: ThrowResult
}

export const executeAutoPlayTurn = (
  state: GameState,
  dependencies: AutoPlayDependencies = {},
): AutoPlayTurnResult => {
  const getThrowResult = dependencies.getThrowResult ?? getThrowResultDefault
  const getLegalMoves = dependencies.getLegalMoves ?? getLegalMovesDefault
  const applyMove = dependencies.applyMove ?? applyMoveDefault
  const autoPassIfNoMoves =
    dependencies.autoPassIfNoMoves ?? autoPassIfNoMovesDefault
  const random = dependencies.random ?? Math.random

  if (state.winner) {
    return { nextState: state, movedPieceId: null }
  }

  let workingState = state
  let throwResult: ThrowResult | undefined

  if (!workingState.currentThrow) {
    throwResult = getThrowResult()
    workingState = { ...workingState, currentThrow: throwResult }
  }

  const legalMoves = getLegalMoves(workingState)
  if (legalMoves.length === 0) {
    return {
      nextState: autoPassIfNoMoves(workingState),
      movedPieceId: null,
      throwResult,
    }
  }

  const randomMove =
    legalMoves[Math.floor(random() * legalMoves.length)]

  return {
    nextState: applyMove(workingState, randomMove.pieceId),
    movedPieceId: randomMove.pieceId,
    throwResult,
  }
}

export const playImmediateAutoTurns = (
  state: GameState,
  turnsCount: number,
  dependencies: AutoPlayDependencies = {},
) => {
  let nextState = state

  for (let i = 0; i < turnsCount; i += 1) {
    if (nextState.winner) break
    nextState = executeAutoPlayTurn(nextState, dependencies).nextState
  }

  return nextState
}
