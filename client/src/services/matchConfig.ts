export const MATCH_CREATE_PATH = '/api/match/create'
export const MATCH_HEALTH_PATH = '/api/health'

export const normalizeRoomId = (roomId: string) => roomId.trim().toLowerCase()

export const buildMatchWebSocketUrl = (
  locationLike: Pick<Location, 'host' | 'protocol'>,
  roomId: string,
  gameType?: 'senet' | 'mehen',
) => {
  const protocol = locationLike.protocol === 'https:' ? 'wss:' : 'ws:'
  const suffix = gameType ? `?game=${gameType}` : ''
  return `${protocol}//${locationLike.host}/api/match/${normalizeRoomId(roomId)}${suffix}`
}
