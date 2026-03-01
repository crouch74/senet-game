import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSenetStore } from '../../../engine/store'
import { createInitialState } from '../engine/logic'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { registerSenetStoreReset } from '../../../test/resetSenetStore'
import { StatusPanel } from './StatusPanel'

registerSenetStoreReset()

describe('Ur StatusPanel', () => {
  it('shows four ceremonial dice and the numeric total', async () => {
    const initialState = createInitialState()
    useSenetStore.setState({
      ...initialState,
      currentThrow: {
        value: 3,
        lightSidesUp: 3,
        binaryDice: [true, true, true, false],
      },
      gameType: 'ur',
    })

    const { container } = await renderWithProviders(<StatusPanel />)

    expect(screen.getByText('Throw Total')).toBeInTheDocument()
    expect(
      container.querySelector('.ur-status-panel__total-value')?.textContent,
    ).toBe('3')
    expect(container.querySelectorAll('.ur-die')).toHaveLength(4)
  })
})
