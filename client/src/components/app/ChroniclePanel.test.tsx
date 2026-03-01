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

  it('renders Ur history entries with localized token labels', async () => {
    await renderWithProviders(
      <ChroniclePanel
        gameType="ur"
        historyLog={[
          {
            key: 'history.ur_move',
            player: 'anubis',
            piece: 'anubis-ur_token-1',
            from: 1,
            to: 4,
          },
        ]}
      />,
    )

    expect(
      screen.getByText('🏃 Shell Token 1 advances from 1 to 4.'),
    ).toBeInTheDocument()
    expect(screen.getByTitle('Shell')).toBeInTheDocument()
  })
})
