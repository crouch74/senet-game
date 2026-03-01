import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSenetStore } from '../../../engine/store'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { registerSenetStoreReset } from '../../../test/resetSenetStore'
import { UrRulesDrawer } from './RulesDrawer'

registerSenetStoreReset()

describe('UrRulesDrawer', () => {
  it('switches between rules and attribution content', async () => {
    useSenetStore.setState({
      showGuide: true,
      guideSection: 'rules',
    })

    await renderWithProviders(<UrRulesDrawer />)

    expect(screen.getByText('Canonical Ruleset')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Attribution' }))

    expect(screen.getByText('Historical References')).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'British Museum: The rosettes game from ancient Iraq',
      }),
    ).toBeInTheDocument()
  })
})
