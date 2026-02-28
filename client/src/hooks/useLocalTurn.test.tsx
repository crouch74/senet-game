import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useLocalTurn } from './useLocalTurn'
import { registerSenetStoreReset } from '../test/resetSenetStore'
import { useSenetStore } from '../engine/store'

registerSenetStoreReset()

function LocalTurnProbe() {
  const isLocalTurn = useLocalTurn()

  return <span>{isLocalTurn ? 'local-turn' : 'waiting'}</span>
}

describe('useLocalTurn', () => {
  it('returns true for local online turns', async () => {
    useSenetStore.setState({
      currentPlayer: 'anubis',
      isOnline: true,
      isWaitingForOpponent: false,
      localPlayer: 'anubis',
    })

    render(<LocalTurnProbe />)

    await waitFor(() => {
      expect(screen.getByText('local-turn')).toBeInTheDocument()
    })
  })

  it('returns false when the opponent is still being awaited online', async () => {
    useSenetStore.setState({
      currentPlayer: 'anubis',
      isConnectingToRoom: false,
      isOnline: true,
      isWaitingForOpponent: true,
      localPlayer: 'anubis',
    })

    render(<LocalTurnProbe />)

    await waitFor(() => {
      expect(screen.getByText('waiting')).toBeInTheDocument()
    })
  })
})
