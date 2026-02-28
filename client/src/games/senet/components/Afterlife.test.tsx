import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSenetStore } from '../../../engine/store'
import { initializeGame } from '../../mehen/engine/logic'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { registerSenetStoreReset } from '../../../test/resetSenetStore'
import { Afterlife } from './Afterlife'

registerSenetStoreReset()

describe('Afterlife', () => {
  it('uses player token appearance classes for Mehen finished pieces', async () => {
    const state = initializeGame()
    const finalCell = state.boardSize ?? 60

    useSenetStore.setState({
      ...state,
      gameType: 'mehen',
      board: state.board.map((piece) => {
        if (piece.id === 'anubis-lion' || piece.id === 'sphinx-lion') {
          return { ...piece, position: finalCell }
        }
        return piece
      }),
    } as never)

    const { container } = await renderWithProviders(<Afterlife />)

    expect(screen.getByText('Heart of Mehen')).toBeInTheDocument()
    expect(container.querySelector('.piece-token--anubis')).not.toBeNull()
    expect(container.querySelector('.piece-token--sphinx')).not.toBeNull()
  })
})
