import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThrowSticks } from '../games/senet/components/ThrowSticks';
import { renderWithProviders } from '../test/renderWithProviders';
import { registerSenetStoreReset } from '../test/resetSenetStore';
import { useSenetStore } from '../engine/store';

registerSenetStoreReset();

describe('ThrowSticks', () => {
  it('shows the idle prompt on the local turn', async () => {
    await renderWithProviders(<ThrowSticks />);
    expect(screen.getByText('Click sticks to throw')).toBeInTheDocument();
  });

  it('delays manual throws before calling the store action', async () => {
    vi.useFakeTimers();
    const throwSticks = vi.fn();
    useSenetStore.setState({ throwSticks } as never);

    await renderWithProviders(<ThrowSticks />);
    fireEvent.click(screen.getByRole('button'));

    expect(throwSticks).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(throwSticks).toHaveBeenCalled();
  });

  it('shows the result state when a throw is present', async () => {
    useSenetStore.setState({ currentThrow: { lightSidesUp: 3, value: 3 } });

    await renderWithProviders(<ThrowSticks />);
    expect(screen.getByText('MOVES: 3')).toBeInTheDocument();
  });

  it('shows the waiting state when it is the computer turn', async () => {
    useSenetStore.setState({
      currentPlayer: 'sphinx',
      isOnline: false,
      offlineHumanPlayer: 'anubis',
      offlineMode: 'vs_pc',
    });

    await renderWithProviders(<ThrowSticks />);
    expect(screen.getByText('Awaiting the computer\'s move...')).toBeInTheDocument();
  });

  it('shows the game over state when a winner exists', async () => {
    useSenetStore.setState({ winner: 'anubis' });

    await renderWithProviders(<ThrowSticks />);
    expect(screen.getByText('The Journey is Complete')).toBeInTheDocument();
  });
});
