import { useEffect, useRef, useState } from 'react'

interface ClipboardLike {
  writeText: (value: string) => Promise<void>
}

interface UseRoomClipboardOptions {
  clearTimeoutFn?: typeof window.clearTimeout
  clipboard?: ClipboardLike | null
  resetDelayMs?: number
  setTimeoutFn?: typeof window.setTimeout
}

export const ROOM_COPY_RESET_DELAY_MS = 2000

export function useRoomClipboard(
  roomId: string | null,
  options: UseRoomClipboardOptions = {},
) {
  const clipboard =
    options.clipboard ?? (typeof navigator === 'undefined' ? null : navigator.clipboard)
  const setTimeoutFn =
    options.setTimeoutFn ?? window.setTimeout.bind(window)
  const clearTimeoutFn =
    options.clearTimeoutFn ?? window.clearTimeout.bind(window)
  const resetDelayMs = options.resetDelayMs ?? ROOM_COPY_RESET_DELAY_MS
  const [copiedRoom, setCopiedRoom] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCopiedStateTimer = () => {
    if (timerRef.current === null) return
    clearTimeoutFn(timerRef.current)
    timerRef.current = null
  }

  useEffect(() => {
    return () => {
      if (timerRef.current === null) return
      clearTimeoutFn(timerRef.current)
      timerRef.current = null
    }
  }, [clearTimeoutFn])

  const copyRoomId = async () => {
    if (!roomId || !clipboard) return

    await clipboard.writeText(roomId)
    clearCopiedStateTimer()
    setCopiedRoom(true)
    timerRef.current = setTimeoutFn(() => {
      timerRef.current = null
      setCopiedRoom(false)
    }, resetDelayMs)
  }

  return {
    copiedRoom,
    copyRoomId,
  }
}
