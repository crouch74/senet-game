import { useEffect, useState } from 'react'
import { matchApi } from '../services/matchApi'

export const BACKEND_HEALTH_POLL_MS = 15000

interface UseBackendHealthOptions {
  api?: Pick<typeof matchApi, 'checkHealth'>
  pollIntervalMs?: number
}

export function useBackendHealth(
  options: UseBackendHealthOptions = {},
) {
  const api = options.api ?? matchApi
  const pollIntervalMs = options.pollIntervalMs ?? BACKEND_HEALTH_POLL_MS
  const [isBackendAvailable, setIsBackendAvailable] = useState(false)

  useEffect(() => {
    let isMounted = true
    let activeController: AbortController | null = null

    const updateHealth = async () => {
      activeController?.abort()
      const controller = new AbortController()
      activeController = controller

      try {
        const isAvailable = await api.checkHealth(controller.signal)
        if (!isMounted || controller.signal.aborted) return
        setIsBackendAvailable(isAvailable)
      } catch {
        if (!isMounted || controller.signal.aborted) return
        setIsBackendAvailable(false)
      }
    }

    void updateHealth()
    const intervalId = window.setInterval(() => {
      void updateHealth()
    }, pollIntervalMs)

    return () => {
      isMounted = false
      activeController?.abort()
      window.clearInterval(intervalId)
    }
  }, [api, pollIntervalMs])

  return isBackendAvailable
}
