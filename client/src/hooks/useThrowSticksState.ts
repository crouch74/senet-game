import { useEffect, useMemo, useRef, useState } from 'react'
import type { PlayerID, ThrowResult } from '../engine/types'
import { useLocalTurn } from './useLocalTurn'

export interface StickLayout {
  isLight: boolean
  rotate: number
  x: number
  y: number
  zIndex: number
}

interface UseThrowSticksStateOptions {
  currentPlayer: PlayerID
  currentThrow: ThrowResult | null
  isAutoRolling: boolean
  throwDelayMs?: number
  throwSticks: () => void
  winner: PlayerID | null
}

const createStickLayouts = (
  value: number,
  lightSidesUp: number,
  seedOffset: number,
): StickLayout[] => {
  let seed =
    ((value + 1) * 2654435761 + (lightSidesUp + 1) * 1013904223 + seedOffset) >>> 0

  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  const shuffled = [0, 1, 2, 3]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(next() * (index + 1))
    ;[shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]]
  }

  const lightIndices = new Set<number>(shuffled.slice(0, lightSidesUp))

  return Array.from({ length: 4 }, (_, index) => ({
    x: (next() - 0.5) * 140,
    y: (next() - 0.5) * 40,
    rotate: (next() - 0.5) * 90,
    zIndex: Math.floor(next() * 10),
    isLight: lightIndices.has(index),
  }))
}

export function useThrowSticksState({
  currentPlayer,
  currentThrow,
  isAutoRolling,
  throwDelayMs = 800,
  throwSticks,
  winner,
}: UseThrowSticksStateOptions) {
  const [isManualThrowing, setIsManualThrowing] = useState(false)
  const throwTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMyTurn = useLocalTurn()
  const isThrowing = isManualThrowing || isAutoRolling

  useEffect(() => {
    return () => {
      if (throwTimerRef.current === null) return
      window.clearTimeout(throwTimerRef.current)
      throwTimerRef.current = null
    }
  }, [])

  const stickLayouts = useMemo(() => {
    if (!currentThrow) return []

    const playerSeed = currentPlayer === 'anubis' ? 17 : 31
    return createStickLayouts(
      currentThrow.value,
      currentThrow.lightSidesUp,
      playerSeed,
    )
  }, [currentPlayer, currentThrow])

  const handleThrow = () => {
    if (!isMyTurn || currentThrow || winner || isThrowing) return

    setIsManualThrowing(true)
    throwTimerRef.current = window.setTimeout(() => {
      throwTimerRef.current = null
      throwSticks()
      setIsManualThrowing(false)
    }, throwDelayMs)
  }

  return {
    handleThrow,
    isMyTurn,
    isThrowing,
    stickLayouts,
  }
}
