import { useEffect, useState } from 'react'
import {
  getInitialPermalinkState,
  setLobbyPath,
  setOfflineModePath,
  setRoomPath,
} from '../app/permalinks'
import type { OfflineMode } from '../engine/types'

interface UseAppNavigationOptions {
  clearRoomJoinError: () => void
  isConnectingToRoom: boolean
  isOnline: boolean
  joinRoom: (roomId: string) => void
  leaveRoom: () => void
  offlineMode: OfflineMode
  resetGame: () => void
  roomId: string | null
  roomJoinError: string | null
  setOfflineMode: (mode: OfflineMode) => void
}

export function useAppNavigation({
  clearRoomJoinError,
  isConnectingToRoom,
  isOnline,
  joinRoom,
  leaveRoom,
  offlineMode,
  resetGame,
  roomId,
  roomJoinError,
  setOfflineMode,
}: UseAppNavigationOptions) {
  const [initialPermalinkState] = useState(() =>
    getInitialPermalinkState(
      typeof window === 'undefined' ? '/' : window.location.pathname,
    ),
  )
  const [showLobby, setShowLobby] = useState(initialPermalinkState.showLobby)
  const showLobbyScreen = showLobby && !isOnline && !isConnectingToRoom

  useEffect(() => {
    const { roomCode, offlineMode: initialOfflineMode } = initialPermalinkState

    if (roomCode) {
      clearRoomJoinError()
      joinRoom(roomCode)
      return
    }

    if (!initialOfflineMode) return

    clearRoomJoinError()
    setOfflineMode(initialOfflineMode)
    resetGame()
  }, [
    clearRoomJoinError,
    initialPermalinkState,
    joinRoom,
    resetGame,
    setOfflineMode,
  ])

  useEffect(() => {
    if (!isOnline || !roomId) return
    setRoomPath(roomId)
  }, [isOnline, roomId])

  useEffect(() => {
    if (showLobbyScreen) return
    if (isOnline || isConnectingToRoom) return
    setOfflineModePath(offlineMode)
  }, [showLobbyScreen, isOnline, isConnectingToRoom, offlineMode])

  useEffect(() => {
    if (!roomJoinError) return
    setLobbyPath()
  }, [roomJoinError])

  const handleReturnToLobby = () => {
    if (isOnline || isConnectingToRoom) {
      leaveRoom()
    }

    resetGame()
    setShowLobby(true)
    setLobbyPath()
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    setShowLobby(true)
    setLobbyPath()
  }

  const handleStartOfflineMode = (mode: OfflineMode) => {
    setOfflineMode(mode)
    resetGame()
    setShowLobby(false)
    setOfflineModePath(mode)
  }

  return {
    handleLeaveRoom,
    handleReturnToLobby,
    handleStartOfflineMode,
    setShowLobby,
    showLobby,
    showLobbyScreen,
  }
}
