import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useBackendHealth } from './useBackendHealth'

function BackendHealthProbe({
  api,
  pollIntervalMs = 15000,
}: {
  api: { checkHealth: (signal?: AbortSignal) => Promise<boolean> }
  pollIntervalMs?: number
}) {
  const isBackendAvailable = useBackendHealth({ api, pollIntervalMs })

  return <span>{isBackendAvailable ? 'online' : 'offline'}</span>
}

describe('useBackendHealth', () => {
  it('polls backend health on an interval and updates availability', async () => {
    vi.useFakeTimers()
    const checkHealth = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)

    render(
      <BackendHealthProbe
        api={{ checkHealth }}
        pollIntervalMs={1000}
      />,
    )

    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByText('online')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
      await Promise.resolve()
    })

    expect(checkHealth).toHaveBeenCalledTimes(2)
    expect(screen.getByText('offline')).toBeInTheDocument()
  })

  it('aborts the active request when the component unmounts', async () => {
    let signalRef: AbortSignal | undefined
    const checkHealth = vi.fn().mockImplementation(async (signal?: AbortSignal) => {
      signalRef = signal
      return false
    })

    const { unmount } = render(
      <BackendHealthProbe api={{ checkHealth }} />,
    )

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalled()
      expect(signalRef).toBeDefined()
    })

    expect(signalRef?.aborted).toBe(false)
    unmount()
    expect(signalRef?.aborted).toBe(true)
  })
})
