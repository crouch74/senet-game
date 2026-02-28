import { screen } from '@testing-library/react'
import { ChroniclePanel } from './ChroniclePanel'
import { renderWithProviders } from '../../test/renderWithProviders'

describe('ChroniclePanel', () => {
  it('renders Mehen history entries from top-level log fields', async () => {
    await renderWithProviders(
      <ChroniclePanel
        gameType="mehen"
        historyLog={[
          {
            key: 'history.mehen_move',
            player: 'anubis',
            piece: 'anubis-ball-3',
            from: 0,
            to: 1,
          },
          {
            key: 'history.mehen_blocked',
            player: 'sphinx',
          },
        ]}
      />,
    )

    expect(
      screen.getByText('🏃 ANUBIS Ball 3 advances from 0 to 1.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('🚫 SPHINX has no legal move and yields the turn.'),
    ).toBeInTheDocument()
    expect(screen.getByTitle('ANUBIS')).toBeInTheDocument()
    expect(screen.getByTitle('SPHINX')).toBeInTheDocument()
  })
})
