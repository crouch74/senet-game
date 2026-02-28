import { MATCH_CREATE_PATH, MATCH_HEALTH_PATH } from './matchConfig'

interface CreateRoomResponse {
  room_id: string
}

interface MatchApiDependencies {
  fetchFn?: typeof fetch
}

const DEFAULT_CREATE_ROOM_ERROR = 'Failed to create room'

const parseCreateRoomResponse = (payload: unknown): string => {
  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof (payload as CreateRoomResponse).room_id !== 'string'
  ) {
    throw new Error('Invalid create-room response')
  }

  return (payload as CreateRoomResponse).room_id
}

export function createMatchApi(dependencies: MatchApiDependencies = {}) {
  const fetchFn =
    dependencies.fetchFn ??
    ((...args: Parameters<typeof fetch>) => fetch(...args))

  return {
    async checkHealth(signal?: AbortSignal) {
      const response = await fetchFn(MATCH_HEALTH_PATH, { signal })
      return response.ok
    },

    async createRoom(gameType: 'senet' | 'mehen' = 'senet', signal?: AbortSignal) {
      const url = gameType === 'senet' ? MATCH_CREATE_PATH : `${MATCH_CREATE_PATH}?game=${gameType}`
      const response = await fetchFn(url, {
        method: 'POST',
        signal,
      })

      if (!response.ok) {
        throw new Error(response.statusText || DEFAULT_CREATE_ROOM_ERROR)
      }

      const payload = await response.json()
      return parseCreateRoomResponse(payload)
    },
  }
}

export const matchApi = createMatchApi()
