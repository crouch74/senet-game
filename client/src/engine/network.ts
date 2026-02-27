import type { GameState, PlayerID } from './types'

export type RoomJoinError = 'not_found' | 'full' | 'unavailable'
export type LocalRole = PlayerID | 'spectator'

interface MatchConnectionHandlers {
  onClose: () => void
  onError: (message: unknown) => void
  onGameStart: (payload: {
    openingPlayer?: PlayerID
    openingRolls?: { anubis: number; sphinx: number }
  }) => void
  onInit: (role: LocalRole) => void
  onOpen: (roomId: string) => void
  onOpponentDisconnected: () => void
  onSync: (state: Partial<GameState>) => void
}

interface MatchConnectionDependencies {
  createSocket?: (url: string) => WebSocket
  getLocation?: () => Pick<Location, 'host' | 'protocol'>
  parseMessage?: (message: string) => unknown
}

export const normalizeRoomId = (roomId: string) => roomId.trim().toLowerCase()

export const mapRoomJoinError = (message: unknown): RoomJoinError => {
  const lowered = typeof message === 'string' ? message.toLowerCase() : ''

  if (lowered.includes('does not exist')) return 'not_found'
  if (lowered.includes('full')) return 'full'
  return 'unavailable'
}

export const buildMatchWebSocketUrl = (
  locationLike: Pick<Location, 'host' | 'protocol'>,
  roomId: string,
) => {
  const protocol = locationLike.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${locationLike.host}/api/match/${normalizeRoomId(roomId)}`
}

export function createMatchConnectionManager(
  dependencies: MatchConnectionDependencies = {},
) {
  const createSocket =
    dependencies.createSocket ?? ((url: string) => new WebSocket(url))
  const getLocation =
    dependencies.getLocation ?? (() => window.location)
  const parseMessage = dependencies.parseMessage ?? JSON.parse

  let connectionAttempt = 0
  let socket: WebSocket | null = null

  return {
    connect(roomId: string, handlers: MatchConnectionHandlers) {
      const normalizedRoomId = normalizeRoomId(roomId)
      if (!normalizedRoomId) return

      const currentAttempt = ++connectionAttempt

      if (socket) {
        socket.close()
      }

      socket = createSocket(
        buildMatchWebSocketUrl(getLocation(), normalizedRoomId),
      )

      socket.onopen = () => {
        if (currentAttempt !== connectionAttempt) return
        handlers.onOpen(normalizedRoomId)
      }

      socket.onmessage = (event) => {
        if (currentAttempt !== connectionAttempt) return

        let data: unknown
        try {
          data = parseMessage(String(event.data))
        } catch {
          handlers.onError('Invalid server payload')
          return
        }

        if (!data || typeof data !== 'object' || !('type' in data)) {
          handlers.onError('Invalid server payload')
          return
        }

        const message = data as Record<string, unknown>

        switch (message.type) {
          case 'init':
            handlers.onInit((message.player ?? message.role) as LocalRole)
            return
          case 'game_start':
            handlers.onGameStart({
              openingPlayer: message.opening_player as PlayerID | undefined,
              openingRolls: message.opening_rolls as
                | { anubis: number; sphinx: number }
                | undefined,
            })
            return
          case 'sync':
            if (message.state && typeof message.state === 'object') {
              handlers.onSync(message.state as Partial<GameState>)
            }
            return
          case 'opponent_disconnected':
            handlers.onOpponentDisconnected()
            return
          case 'error':
            handlers.onError(message.message)
            socket?.close()
            return
          default:
            return
        }
      }

      socket.onerror = () => {
        if (currentAttempt !== connectionAttempt) return
        handlers.onError('unavailable')
      }

      socket.onclose = () => {
        if (currentAttempt !== connectionAttempt) return
        socket = null
        handlers.onClose()
      }
    },

    disconnect() {
      connectionAttempt += 1
      if (socket) {
        socket.close()
        socket = null
      }
    },

    syncState(state: Partial<GameState>) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'sync', state }))
      }
    },
  }
}
