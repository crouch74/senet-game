import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from './test/renderWithProviders';
import { registerSenetStoreReset } from './test/resetSenetStore';
import { useSenetStore } from './engine/store';

vi.mock('./components/Board', () => ({
  Board: () => <div>Board</div>,
}));

vi.mock('./components/ThrowSticks', () => ({
  ThrowSticks: () => <div>ThrowSticks</div>,
}));

vi.mock('./components/Afterlife', () => ({
  Afterlife: () => <div>Afterlife</div>,
}));

vi.mock('./components/GuideModal', () => ({
  GuideModal: () => null,
}));

vi.mock('./components/GameOver', () => ({
  GameOver: () => <div>Game Over</div>,
}));

vi.mock('./components/HUD', () => ({
  HUD: ({
    isLobby,
    onReturnToLobby,
    setTheme,
  }: {
    isLobby?: boolean;
    onReturnToLobby?: () => void;
    setTheme: (theme: 'nile-papyrus') => void;
  }) => (
    <div>
      <div>{isLobby ? 'HUD lobby' : 'HUD game'}</div>
      <button onClick={() => setTheme('nile-papyrus')}>Set Theme</button>
      {onReturnToLobby ? (
        <button onClick={onReturnToLobby}>Return To Lobby</button>
      ) : null}
    </div>
  ),
}));

vi.mock('./components/Lobby', () => ({
  Lobby: ({
    onStartOfflineMode,
  }: {
    onStartOfflineMode: (mode: 'vs_pc' | 'play_and_pass') => void;
  }) => (
    <div>
      <span>Lobby</span>
      <button onClick={() => onStartOfflineMode('vs_pc')}>Start Vs PC</button>
    </div>
  ),
}));

vi.mock('./components/LandingPage', () => ({
  LandingPage: ({
    onSelectGame,
  }: {
    onSelectGame: (game: 'senet' | 'mehen') => void;
  }) => (
    <div>
      <span>Landing</span>
      <button onClick={() => onSelectGame('mehen')}>Choose Mehen</button>
    </div>
  ),
}));

import App from './App';
import i18n from './i18n';

registerSenetStoreReset();

describe('App', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('joins rooms from permalink routes on mount', async () => {
    window.history.replaceState({}, '', '/room/abc-def-ghi');
    const joinRoom = vi.fn();
    const clearRoomJoinError = vi.fn();
    useSenetStore.setState({ clearRoomJoinError, joinRoom } as never);

    await renderWithProviders(<App />);

    await waitFor(() => {
      expect(clearRoomJoinError).toHaveBeenCalled();
      expect(joinRoom).toHaveBeenCalledWith('abc-def-ghi');
    });
  });

  it('boots directly into offline permalink modes', async () => {
    window.history.replaceState({}, '', '/mode/vs-pc');

    await renderWithProviders(<App />);

    await waitFor(() => {
      expect(useSenetStore.getState().offlineMode).toBe('vs_pc');
    });
    expect(screen.queryByText('Lobby')).not.toBeInTheDocument();
  });

  it('opens the lobby after choosing a game from the landing page', async () => {
    window.history.replaceState({}, '', '/');

    await renderWithProviders(<App />);

    expect(screen.getByText('Landing')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Choose Mehen'));

    await waitFor(() => {
      expect(screen.getByText('Lobby')).toBeInTheDocument();
    });
    expect(window.location.pathname).toBe('/mehen');
  });

  it('returns the browser path to the lobby when a room join error appears', async () => {
    window.history.replaceState({}, '', '/room/abc-def-ghi');
    useSenetStore.setState({
      clearRoomJoinError: vi.fn(),
      joinRoom: vi.fn(),
    } as never);

    await renderWithProviders(<App />);
    act(() => {
      useSenetStore.setState({ roomJoinError: 'not_found' });
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe('/senet');
    });
  });

  it('persists theme changes and updates document direction with language changes', async () => {
    window.history.replaceState({}, '', '/senet');

    await renderWithProviders(<App />);

    fireEvent.click(screen.getByText('Set Theme'));
    expect(document.documentElement.dataset.theme).toBe('nile-papyrus');
    expect(window.localStorage.getItem('senet_theme')).toBe('nile-papyrus');

    await act(async () => {
      await i18n.changeLanguage('ar-EG');
    });
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('copies room ids for active online games', async () => {
    window.history.replaceState({}, '', '/senet');
    useSenetStore.setState({
      isOnline: true,
      isWaitingForOpponent: false,
      localPlayer: 'anubis',
      roomId: 'abc-def-ghi',
    });

    await renderWithProviders(<App />);
    await act(async () => {
      fireEvent.click(screen.getByTitle('Copy room code'));
    });

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('abc-def-ghi');
    });
    await waitFor(() => {
      expect(screen.getByTitle('Copy room code')).toHaveTextContent('Copied!');
    });
  });

  it('renders the waiting-room panel while connecting to an opponent', async () => {
    window.history.replaceState({}, '', '/senet');
    useSenetStore.setState({
      isConnectingToRoom: true,
      isWaitingForOpponent: true,
      localPlayer: 'anubis',
      roomId: 'abc-def-ghi',
    });

    await renderWithProviders(<App />);

    expect(screen.getByText('Awaiting the Second Soul')).toBeInTheDocument();
    expect(screen.getByText('abc-def-ghi')).toBeInTheDocument();
    expect(screen.getByText('Leave Room')).toBeInTheDocument();
  });

  it('schedules computer turns in vs-pc mode once the sphinx turn is active', async () => {
    vi.useFakeTimers();
    window.history.replaceState({}, '', '/mode/pass-and-play');
    const playRandomTurns = vi.fn();
    useSenetStore.setState({ playRandomTurns } as never);

    await renderWithProviders(<App />);

    act(() => {
      useSenetStore.setState({
        currentPlayer: 'sphinx',
        offlineMode: 'vs_pc',
      });
    });

    await vi.advanceTimersByTimeAsync(300);
    expect(playRandomTurns).toHaveBeenCalledWith(1, 'human');
  });

  it('starts offline modes from the lobby and can return to the lobby', async () => {
    window.history.replaceState({}, '', '/senet');
    const originalSetOfflineMode = useSenetStore.getState().setOfflineMode;
    const setOfflineMode = vi.fn((mode: 'vs_pc' | 'play_and_pass') =>
      originalSetOfflineMode(mode),
    );
    const resetGame = vi.fn();
    const leaveRoom = vi.fn();
    useSenetStore.setState({ leaveRoom, resetGame, setOfflineMode } as never);

    await renderWithProviders(<App />);
    fireEvent.click(screen.getByText('Start Vs PC'));

    expect(setOfflineMode).toHaveBeenCalledWith('vs_pc');
    expect(resetGame).toHaveBeenCalled();
    expect(window.location.pathname).toBe('/senet/mode/vs-pc');

    act(() => {
      useSenetStore.setState({
        isOnline: true,
        isWaitingForOpponent: false,
        roomId: 'abc-def-ghi',
      });
    });
    await waitFor(() => {
      expect(screen.getByText('Return To Lobby')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Return To Lobby'));

    expect(leaveRoom).toHaveBeenCalled();
    expect(window.location.pathname).toBe('/senet');
  });

  it('renders translated history params and player markers in the chronicle', async () => {
    window.history.replaceState({}, '', '/senet/mode/pass-and-play');
    useSenetStore.setState({
      historyLog: [
        {
          key: 'history.wins',
          params: { player: 'anubis' },
          player: 'sphinx',
        },
      ],
      isOnline: false,
      isWaitingForOpponent: false,
      roomId: null,
      localPlayer: null,
    });

    await renderWithProviders(<App />);

    expect(screen.getByText('🏆 ANUBIS WINS!')).toBeInTheDocument();
    expect(screen.getByTitle('SPHINX')).toBeInTheDocument();
  });
});
