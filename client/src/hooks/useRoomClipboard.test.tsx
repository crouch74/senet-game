import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRoomClipboard } from './useRoomClipboard'

function RoomClipboardProbe({
  clearTimeoutFn,
  clipboard,
  roomId = 'abc-def-ghi',
  setTimeoutFn,
}: {
  clearTimeoutFn?: typeof window.clearTimeout
  clipboard: { writeText: (value: string) => Promise<void> }
  roomId?: string | null
  setTimeoutFn?: typeof window.setTimeout
}) {
  const { copiedRoom, copyRoomId } = useRoomClipboard(roomId, {
    clearTimeoutFn,
    clipboard,
    setTimeoutFn,
  })

  return (
    <>
      <button onClick={() => void copyRoomId()}>copy</button>
      <span>{copiedRoom ? 'copied' : 'idle'}</span>
    </>
  )
}

describe('useRoomClipboard', () => {
  it('copies the room id and resets the copied state after the timeout', async () => {
    const clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }
    let resetCopiedState: (() => void) | undefined
    const setTimeoutFn = vi.fn((callback: TimerHandler) => {
      resetCopiedState = callback as () => void
      return 1 as ReturnType<typeof setTimeout>
    })

    render(
      <RoomClipboardProbe
        clipboard={clipboard}
        setTimeoutFn={setTimeoutFn}
      />,
    )
    await act(async () => {
      fireEvent.click(screen.getByText('copy'))
      await Promise.resolve()
    })

    expect(clipboard.writeText).toHaveBeenCalledWith('abc-def-ghi')
    expect(screen.getByText('copied')).toBeInTheDocument()

    act(() => {
      resetCopiedState?.()
    })

    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('does nothing when there is no room id to copy', async () => {
    const clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }

    render(<RoomClipboardProbe clipboard={clipboard} roomId={null} />)
    fireEvent.click(screen.getByText('copy'))

    expect(clipboard.writeText).not.toHaveBeenCalled()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })
})
