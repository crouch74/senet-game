import { describe, expect, it, vi } from 'vitest';
import {
  getInitialPermalinkState,
  getOfflineModeFromPath,
  getOfflineModePermalinkPath,
  getRoomCodeFromPath,
  getRoomPermalinkPath,
  setLobbyPath,
  setOfflineModePath,
  setRoomPath,
} from './permalinks';

describe('permalinks', () => {
  it('parses room and offline permalinks and derives initial app state', () => {
    expect(getRoomCodeFromPath('/room/AbC-DeF-GhI')).toBe('abc-def-ghi');
    expect(getOfflineModeFromPath('/mode/vs-pc')).toBe('vs_pc');
    expect(getInitialPermalinkState('/ur', '')).toEqual({
      roomCode: null,
      offlineMode: null,
      showLobby: true,
      gameType: 'ur',
    });
    expect(getInitialPermalinkState('/mode/pass-and-play', '')).toEqual({
      roomCode: null,
      offlineMode: 'play_and_pass',
      showLobby: false,
      gameType: null,
    });
    expect(getInitialPermalinkState('/', '')).toEqual({
      roomCode: null,
      offlineMode: null,
      showLobby: false,
      gameType: null,
    });
  });

  it('builds and applies permalink paths through history.replaceState', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');

    expect(getRoomPermalinkPath('AbC-DeF-GhI')).toBe('/senet/room/abc-def-ghi');
    expect(getOfflineModePermalinkPath('vs_pc')).toBe('/senet/mode/vs-pc');
    expect(getRoomPermalinkPath('AbC-DeF-GhI', 'ur')).toBe('/ur/room/abc-def-ghi');
    expect(getOfflineModePermalinkPath('vs_pc', 'ur')).toBe('/ur/mode/vs-pc');

    setRoomPath('abc-def-ghi');
    setOfflineModePath('play_and_pass');
    setLobbyPath();

    expect(replaceState).toHaveBeenNthCalledWith(1, {}, '', '/senet/room/abc-def-ghi');
    expect(replaceState).toHaveBeenNthCalledWith(2, {}, '', '/senet/mode/pass-and-play');
    expect(replaceState).toHaveBeenNthCalledWith(3, {}, '', '/senet');
  });
});
