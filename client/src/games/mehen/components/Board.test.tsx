import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSenetStore } from '../../../engine/store'
import { initializeGame } from '../engine/logic'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { registerSenetStoreReset } from '../../../test/resetSenetStore'
import { Board } from './Board'

registerSenetStoreReset()

describe('Mehen Board', () => {
  it('only enables reserve pieces for the current player when they are legal moves', async () => {
    const movePiece = vi.fn()
    const state = initializeGame()

    useSenetStore.setState({
      ...state,
      currentPlayer: 'anubis',
      currentThrow: { lightSidesUp: 1, value: 1 },
      legalMoves: [{ pieceId: 'anubis-lion', targetSquare: 1 }],
      movePiece,
    } as never)

    await renderWithProviders(<Board />)

    const anubisLion = screen.getByRole('button', { name: 'ANUBIS Lion' })
    const sphinxLion = screen.getByRole('button', { name: 'SPHINX Lion' })

    expect(anubisLion).toBeEnabled()
    expect(sphinxLion).toBeDisabled()

    fireEvent.click(anubisLion)
    fireEvent.click(sphinxLion)

    expect(movePiece).toHaveBeenCalledTimes(1)
    expect(movePiece).toHaveBeenCalledWith('anubis-lion')
  })

  it('renders finished pieces in the heart of mehen', async () => {
    const state = initializeGame()
    state.board.find((piece) => piece.id === 'anubis-ball-1')!.position = state.boardSize ?? 60

    useSenetStore.setState({
      ...state,
      legalMoves: [],
      movePiece: vi.fn(),
    } as never)

    const { container } = await renderWithProviders(<Board />)
    const heartPiece = container.querySelector('[data-piece-id="anubis-ball-1"]')

    expect(heartPiece).not.toBeNull()
    expect(heartPiece).toHaveAttribute('data-piece-zone', 'heart')
  })
})
