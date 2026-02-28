import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSenetStore } from '../../../engine/store'
import { initializeGame } from '../engine/logic'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { registerSenetStoreReset } from '../../../test/resetSenetStore'
import { Board } from './Board'

registerSenetStoreReset()

describe('Hounds and Jackals Board', () => {
  it('enables only legal pegs for the active player', async () => {
    const movePiece = vi.fn()
    const state = initializeGame()

    useSenetStore.setState({
      ...state,
      currentThrow: { lightSidesUp: 1, value: 1 },
      legalMoves: [{ pieceId: 'anubis-peg-1', targetSquare: 1 }],
      movePiece,
    } as never)

    await renderWithProviders(<Board />)

    const legalPeg = screen.getByRole('button', { name: 'HOUND Peg 1' })

    fireEvent.click(legalPeg)

    expect(movePiece).toHaveBeenCalledWith('anubis-peg-1')
  })

  it('renders the board goal title', async () => {
    useSenetStore.setState({
      ...initializeGame(),
      legalMoves: [],
      movePiece: vi.fn(),
    } as never)

    await renderWithProviders(<Board />)

    expect(screen.getByText('Shen Goal')).toBeInTheDocument()
  })
})
