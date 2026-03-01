import type { OfflineMode, GameType } from '../engine/types'
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
  gameType: GameType | null
}

export const getRoomCodeFromPath = (path: string) => {
  const match = path.match(ROOM_PATH_REGEX)
  return match ? match[1].toLowerCase() : null
}

export const getRoomPermalinkPath = (roomCode: string, gameType: GameType = 'senet') =>
  withBasePath(`/${gameType}/room/${roomCode.toLowerCase()}`)

export const getOfflineModePermalinkPath = (mode: OfflineMode, gameType: GameType = 'senet') =>
  withBasePath(`/${gameType}/mode/${OFFLINE_MODE_TO_SLUG[mode]}`)

export const getOfflineModeFromPath = (path: string): OfflineMode | null => {
  const match = path.match(OFFLINE_MODE_PATH_REGEX)
  if (!match) return null
  return SLUG_TO_OFFLINE_MODE[match[1].toLowerCase()] ?? null
}

export const getInitialPermalinkState = (path: string, _search: string): InitialPermalinkState => {
  const strippedPath = stripBasePath(path)
  const parts = strippedPath.split('/').filter(Boolean)
  const supportedGames = new Set<GameType>(['senet', 'mehen', 'hounds-and-jackals', 'ur'])

  let gameType: GameType | null = null
  let remainingPath = strippedPath

  if (parts.length > 0 && supportedGames.has(parts[0] as GameType)) {
    gameType = parts[0] as GameType
    remainingPath = '/' + parts.slice(1).join('/')
    if (remainingPath === '//') remainingPath = '/'
  }

  const roomCode = getRoomCodeFromPath(remainingPath)
  const offlineMode = roomCode ? null : getOfflineModeFromPath(remainingPath)

  // If we have a game type but no specific sub-route, we show the lobby
  const isAtGameRoot = gameType !== null && remainingPath === '/'

  return {
    roomCode,
    offlineMode,
    showLobby: isAtGameRoot || (gameType !== null && roomCode === null && offlineMode === null),
    gameType,
  }
}

const replacePath = (path: string) => {
  if (window.location.pathname !== path) {
    window.history.replaceState({}, '', path)
  }
}

export const setLobbyPath = (gameType: GameType = 'senet') => replacePath(withBasePath(`/${gameType}`))
export const setRoomPath = (roomCode: string, gameType: GameType = 'senet') =>
  replacePath(getRoomPermalinkPath(roomCode, gameType))
export const setOfflineModePath = (mode: OfflineMode, gameType: GameType = 'senet') =>
  replacePath(getOfflineModePermalinkPath(mode, gameType))
export const setLandingPath = () => replacePath(withBasePath('/'))
