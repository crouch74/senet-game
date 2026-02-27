import type { OfflineMode } from '../engine/types'
import { stripBasePath, withBasePath } from '../utils/urls'

const ROOM_PATH_REGEX = /^\/room\/([a-z]{3}-[a-z]{3}-[a-z]{3})\/?$/i
const OFFLINE_MODE_PATH_REGEX = /^\/mode\/(pass-and-play|vs-pc)\/?$/i

const OFFLINE_MODE_TO_SLUG: Record<OfflineMode, string> = {
  play_and_pass: 'pass-and-play',
  vs_pc: 'vs-pc',
}

const SLUG_TO_OFFLINE_MODE: Record<string, OfflineMode> = {
  'pass-and-play': 'play_and_pass',
  'vs-pc': 'vs_pc',
}

export interface InitialPermalinkState {
  roomCode: string | null
  offlineMode: OfflineMode | null
  showLobby: boolean
}

export const getRoomCodeFromPath = (path: string) => {
  const match = stripBasePath(path).match(ROOM_PATH_REGEX)
  return match ? match[1].toLowerCase() : null
}

export const getRoomPermalinkPath = (roomCode: string) =>
  withBasePath(`/room/${roomCode.toLowerCase()}`)

export const getOfflineModePermalinkPath = (mode: OfflineMode) =>
  withBasePath(`/mode/${OFFLINE_MODE_TO_SLUG[mode]}`)

export const getOfflineModeFromPath = (path: string): OfflineMode | null => {
  const match = stripBasePath(path).match(OFFLINE_MODE_PATH_REGEX)
  if (!match) return null
  return SLUG_TO_OFFLINE_MODE[match[1].toLowerCase()] ?? null
}

export const getInitialPermalinkState = (path: string): InitialPermalinkState => {
  const roomCode = getRoomCodeFromPath(path)
  const offlineMode = roomCode ? null : getOfflineModeFromPath(path)

  return {
    roomCode,
    offlineMode,
    showLobby: offlineMode === null,
  }
}

const replacePath = (path: string) => {
  if (window.location.pathname !== path) {
    window.history.replaceState({}, '', path)
  }
}

export const setLobbyPath = () => replacePath(withBasePath('/'))
export const setRoomPath = (roomCode: string) =>
  replacePath(getRoomPermalinkPath(roomCode))
export const setOfflineModePath = (mode: OfflineMode) =>
  replacePath(getOfflineModePermalinkPath(mode))
