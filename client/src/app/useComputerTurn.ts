import { useEffect, useEffectEvent } from 'react'
import type { PlayerID } from '../engine/types'
import type { AutoPlaySpeed } from '../engine/autoPlay'

interface UseComputerTurnOptions {
  currentPlayer: PlayerID
  delayMs?: number
  enabled: boolean
  isAutoPlaying: boolean
  isAutoRolling: boolean
  playRandomTurns: (turnsCount: number, speed?: AutoPlaySpeed) => void
  winner: PlayerID | null
}

export function useComputerTurn({
  currentPlayer,
  delayMs = 300,
  enabled,
  isAutoPlaying,
  isAutoRolling,
  playRandomTurns,
  winner,
}: UseComputerTurnOptions) {
  const triggerComputerTurn = useEffectEvent(() => {
    if (!enabled) return
    if (winner || isAutoPlaying || isAutoRolling) return
    if (currentPlayer !== 'sphinx') return

    playRandomTurns(1, 'human')
  })

  useEffect(() => {
    if (!enabled) return
    if (winner || isAutoPlaying || isAutoRolling) return
    if (currentPlayer !== 'sphinx') return

    const timer = window.setTimeout(() => {
      triggerComputerTurn()
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [
    currentPlayer,
    delayMs,
    enabled,
    isAutoPlaying,
    isAutoRolling,
    winner,
  ])
}
