import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSenetStore } from '../../../engine/store'
import { createInitialState, getLegalMoves } from '../engine/logic'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { registerSenetStoreReset } from '../../../test/resetSenetStore'
import { Board } from './Board'

registerSenetStoreReset()

describe('Ur Board', () => {
  it('highlights legal reserve tokens and surfaces illegal move reasons', async () => {
    const initialState = createInitialState()
    const currentThrow = {
      value: 1,
      lightSidesUp: 1,
      binaryDice: [true, false, false, false],
    }
    const legalMoves = getLegalMoves({
      ...initialState,
      currentThrow,
    })

    useSenetStore.setState({
      ...initialState,
      currentThrow,
      gameType: 'ur',
      legalMoves,
    })

    const { container } = await renderWithProviders(<Board />)

    expect(container.querySelectorAll('.ur-piece--legal').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.ur-square--legal')).toHaveLength(1)

    fireEvent.click(screen.getAllByRole('button', { name: 'Stone Token' })[0])

    expect(
      screen.getByText('That token does not belong to the current player.'),
    ).toBeInTheDocument()
  })

  it('localizes reserve headers in French', async () => {
    const initialState = createInitialState()
    useSenetStore.setState({
      ...initialState,
      gameType: 'ur',
    })

    await renderWithProviders(<Board />, { language: 'fr' })

    expect(screen.getAllByText('Réserve')).toHaveLength(2)
    expect(screen.getByText('Pierre')).toBeInTheDocument()
    expect(screen.getByText('Coquille')).toBeInTheDocument()
  })
})
