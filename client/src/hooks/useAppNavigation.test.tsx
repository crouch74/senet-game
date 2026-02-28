import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAppNavigation } from './useAppNavigation'

function AppNavigationProbe(props: {
  clearRoomJoinError: () => void
  isConnectingToRoom: boolean
  isOnline: boolean
  joinRoom: (roomId: string) => void
  leaveRoom: () => void
  offlineMode: 'play_and_pass' | 'vs_pc'
  resetGame: () => void
  roomId: string | null
  roomJoinError: string | null
  setOfflineMode: (mode: 'play_and_pass' | 'vs_pc') => void
}) {
  useAppNavigation(props)
  return null
}

describe('useAppNavigation', () => {
  it('joins the permalink room on mount', () => {
    window.history.replaceState({}, '', '/room/abc-def-ghi')
    const clearRoomJoinError = vi.fn()
    const joinRoom = vi.fn()

    render(
      <AppNavigationProbe
        clearRoomJoinError={clearRoomJoinError}
        isConnectingToRoom={false}
        isOnline={false}
        joinRoom={joinRoom}
        leaveRoom={vi.fn()}
        offlineMode="play_and_pass"
        resetGame={vi.fn()}
        roomId={null}
        roomJoinError={null}
        setOfflineMode={vi.fn()}
      />,
    )

    expect(clearRoomJoinError).toHaveBeenCalled()
    expect(joinRoom).toHaveBeenCalledWith('abc-def-ghi')
  })

  it('syncs the browser path when an online room is active', () => {
    render(
      <AppNavigationProbe
        clearRoomJoinError={vi.fn()}
        isConnectingToRoom={false}
        isOnline={true}
        joinRoom={vi.fn()}
        leaveRoom={vi.fn()}
        offlineMode="play_and_pass"
        resetGame={vi.fn()}
        roomId="abc-def-ghi"
        roomJoinError={null}
        setOfflineMode={vi.fn()}
      />,
    )

    expect(window.location.pathname).toBe('/room/abc-def-ghi')
  })
})
