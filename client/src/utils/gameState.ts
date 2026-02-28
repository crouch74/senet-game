import type { GameState } from '../engine/types'

export function getFinishedPosition(state: Pick<GameState, 'gameType' | 'boardSize' | 'houndsAndJackalsConfig'>) {
  if (state.gameType === 'mehen') {
    return state.boardSize ?? 60
  }

  if (state.gameType === 'hounds-and-jackals') {
    return state.houndsAndJackalsConfig?.goalPosition ?? 30
  }

  return 31
}
