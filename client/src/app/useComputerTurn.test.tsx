import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useComputerTurn } from './useComputerTurn';

function Harness({
  currentPlayer = 'sphinx',
  enabled = true,
  isAutoPlaying = false,
  isAutoRolling = false,
  winner = null,
  playRandomTurns,
}: {
  currentPlayer?: 'anubis' | 'sphinx';
  enabled?: boolean;
  isAutoPlaying?: boolean;
  isAutoRolling?: boolean;
  winner?: 'anubis' | 'sphinx' | null;
  playRandomTurns: (turns: number, speed?: 'human') => void;
}) {
  const [player] = useState(currentPlayer);

  useComputerTurn({
    currentPlayer: player,
    enabled,
    isAutoPlaying,
    isAutoRolling,
    playRandomTurns,
    winner,
  });

  return <div>computer turn harness</div>;
}

describe('useComputerTurn', () => {
  it('schedules a computer move when the sphinx turn is active', async () => {
    vi.useFakeTimers();
    const playRandomTurns = vi.fn();

    render(<Harness playRandomTurns={playRandomTurns} />);
    await vi.advanceTimersByTimeAsync(300);

    expect(playRandomTurns).toHaveBeenCalledWith(1, 'human');
  });

  it('does not schedule a move when disabled or already resolved', async () => {
    vi.useFakeTimers();
    const playRandomTurns = vi.fn();

    render(
      <Harness
        enabled={false}
        playRandomTurns={playRandomTurns}
        winner="anubis"
      />,
    );
    await vi.runAllTimersAsync();

    expect(playRandomTurns).not.toHaveBeenCalled();
  });

  it('does not schedule a move when it is not the sphinx turn', async () => {
    vi.useFakeTimers();
    const playRandomTurns = vi.fn();

    render(
      <Harness
        currentPlayer="anubis"
        playRandomTurns={playRandomTurns}
      />,
    );
    await vi.runAllTimersAsync();

    expect(playRandomTurns).not.toHaveBeenCalled();
  });
});
