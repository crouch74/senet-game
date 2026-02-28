import type { PlayerID } from '../../engine/types'

interface WinnerStatusOptions {
  isOnline: boolean
  localPlayer: PlayerID | 'spectator' | null
  offlineHumanPlayer: PlayerID
  offlineMode: 'play_and_pass' | 'vs_pc'
  winner: PlayerID
}

export const getIsWinner = ({
  isOnline,
  localPlayer,
  offlineHumanPlayer,
  offlineMode,
  winner,
}: WinnerStatusOptions) => {
  if (isOnline) {
    return winner === localPlayer
  }

  if (offlineMode === 'vs_pc') {
    return winner === offlineHumanPlayer
  }

  return true
}
