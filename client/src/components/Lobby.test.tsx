import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Lobby } from './Lobby';
import { renderWithProviders } from '../test/renderWithProviders';
import { registerSenetStoreReset } from '../test/resetSenetStore';
import { useSenetStore } from '../engine/store';

registerSenetStoreReset();

describe('Lobby', () => {
  it('shows the online controls when the backend health check succeeds and keeps polling', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await act(async () => {
      await renderWithProviders(<Lobby onStartOfflineMode={vi.fn()} />);
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: 'Create New Room' })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shows the offline fallback when the backend is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await renderWithProviders(<Lobby onStartOfflineMode={vi.fn()} />);

    expect(
      await screen.findByText(
        'Online mode is unavailable while the backend is offline.',
      ),
    ).toBeInTheDocument();
  });

  it('creates rooms and joins the returned room id', async () => {
    const joinRoom = vi.fn();
    const clearRoomJoinError = vi.fn();
    useSenetStore.setState({ joinRoom, clearRoomJoinError } as never);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ room_id: 'abc-def-ghi' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    await act(async () => {
      await renderWithProviders(<Lobby onStartOfflineMode={vi.fn()} />);
      await Promise.resolve();
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Create New Room' }));

    await waitFor(() => {
      expect(joinRoom).toHaveBeenCalledWith('abc-def-ghi');
    });
    expect(clearRoomJoinError).toHaveBeenCalled();
  });

  it('normalizes join input and clears room errors when the input changes', async () => {
    const joinRoom = vi.fn();
    const clearRoomJoinError = vi.fn();
    useSenetStore.setState({
      clearRoomJoinError,
      joinRoom,
      roomJoinError: 'not_found',
    } as never);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await act(async () => {
      await renderWithProviders(<Lobby onStartOfflineMode={vi.fn()} />);
      await Promise.resolve();
    });

    const input = await screen.findByLabelText('Room Code');
    fireEvent.change(input, { target: { value: ' ABC-DEF-GHI ' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText('Room not found. Returning to the lobby.')).toBeInTheDocument();
    expect(clearRoomJoinError).toHaveBeenCalled();
    expect(joinRoom).toHaveBeenCalledWith('abc-def-ghi');
  });

  it('logs create-room failures without joining a room', async () => {
    const joinRoom = vi.fn();
    useSenetStore.setState({ joinRoom } as never);

    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, statusText: 'Server Error' });
    vi.stubGlobal('fetch', fetchMock);

    await renderWithProviders(<Lobby onStartOfflineMode={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Create New Room' }));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to create room:', 'Server Error');
    });
    expect(joinRoom).not.toHaveBeenCalled();
  });
});
