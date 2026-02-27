import { describe, expect, it, vi } from 'vitest';
import {
  buildMatchWebSocketUrl,
  createMatchConnectionManager,
  mapRoomJoinError,
  normalizeRoomId,
} from './network';

class MockWebSocket {
  static OPEN = 1;

  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onopen: ((event: Event) => void) | null = null;
  public readyState = 0;
  public send = vi.fn();
  public close = vi.fn(() => {
    this.readyState = 3;
    this.onclose?.(new CloseEvent('close'));
  });

  constructor(public readonly url: string) {}

  emitOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event('open'));
  }

  emitMessage(data: unknown) {
    this.onmessage?.({ data } as MessageEvent);
  }

  emitError() {
    this.onerror?.(new Event('error'));
  }

  emitClose() {
    this.readyState = 3;
    this.onclose?.(new CloseEvent('close'));
  }
}

describe('network', () => {
  it('normalizes room ids and maps known room errors', () => {
    expect(normalizeRoomId(' ABC-DEF-GHI ')).toBe('abc-def-ghi');
    expect(mapRoomJoinError('Room does not exist')).toBe('not_found');
    expect(mapRoomJoinError('Room is full')).toBe('full');
    expect(mapRoomJoinError('something else')).toBe('unavailable');
  });

  it('builds websocket urls from the current location', () => {
    expect(
      buildMatchWebSocketUrl(
        { protocol: 'https:', host: 'example.com' },
        'Abc-Def-Ghi',
      ),
    ).toBe('wss://example.com/api/match/abc-def-ghi');
  });

  it('routes websocket lifecycle messages to the provided handlers', () => {
    const sockets: MockWebSocket[] = [];
    const manager = createMatchConnectionManager({
      createSocket: (url) => {
        const socket = new MockWebSocket(url);
        sockets.push(socket);
        return socket as unknown as WebSocket;
      },
      getLocation: () => ({ protocol: 'http:', host: 'localhost:5173' }),
    });

    const handlers = {
      onClose: vi.fn(),
      onError: vi.fn(),
      onGameStart: vi.fn(),
      onInit: vi.fn(),
      onOpen: vi.fn(),
      onOpponentDisconnected: vi.fn(),
      onSync: vi.fn(),
    };

    manager.connect(' ABC-DEF-GHI ', handlers);
    const socket = sockets[0];

    expect(socket.url).toBe('ws://localhost:5173/api/match/abc-def-ghi');

    socket.emitOpen();
    socket.emitMessage(JSON.stringify({ type: 'init', player: 'anubis' }));
    socket.emitMessage(
      JSON.stringify({
        type: 'game_start',
        opening_player: 'sphinx',
        opening_rolls: { anubis: 1, sphinx: 4 },
      }),
    );
    socket.emitMessage(JSON.stringify({ type: 'sync', state: { currentPlayer: 'sphinx' } }));
    socket.emitMessage(JSON.stringify({ type: 'opponent_disconnected' }));

    socket.readyState = MockWebSocket.OPEN;
    manager.syncState({ winner: 'anubis' });

    expect(handlers.onOpen).toHaveBeenCalledWith('abc-def-ghi');
    expect(handlers.onInit).toHaveBeenCalledWith('anubis');
    expect(handlers.onGameStart).toHaveBeenCalledWith({
      openingPlayer: 'sphinx',
      openingRolls: { anubis: 1, sphinx: 4 },
    });
    expect(handlers.onSync).toHaveBeenCalledWith({ currentPlayer: 'sphinx' });
    expect(handlers.onOpponentDisconnected).toHaveBeenCalled();
    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'sync', state: { winner: 'anubis' } }),
    );
  });

  it('closes sockets on server error and ignores stale connections', () => {
    const sockets: MockWebSocket[] = [];
    const manager = createMatchConnectionManager({
      createSocket: (url) => {
        const socket = new MockWebSocket(url);
        sockets.push(socket);
        return socket as unknown as WebSocket;
      },
      getLocation: () => ({ protocol: 'http:', host: 'localhost:5173' }),
    });

    const handlers = {
      onClose: vi.fn(),
      onError: vi.fn(),
      onGameStart: vi.fn(),
      onInit: vi.fn(),
      onOpen: vi.fn(),
      onOpponentDisconnected: vi.fn(),
      onSync: vi.fn(),
    };

    manager.connect('abc-def-ghi', handlers);
    manager.connect('jkl-mno-pqr', handlers);

    sockets[0].emitOpen();
    expect(handlers.onOpen).not.toHaveBeenCalledWith('abc-def-ghi');

    sockets[1].emitMessage(JSON.stringify({ type: 'error', message: 'Room is full' }));
    expect(handlers.onError).toHaveBeenCalledWith('Room is full');
    expect(sockets[1].close).toHaveBeenCalled();

    manager.disconnect();
    expect(sockets[1].close).toHaveBeenCalledTimes(1);
  });

  it('maps socket errors to unavailable and invalid payloads to an error callback', () => {
    const socket = new MockWebSocket('ws://localhost/api/match/abc-def-ghi');
    const manager = createMatchConnectionManager({
      createSocket: () => socket as unknown as WebSocket,
      getLocation: () => ({ protocol: 'http:', host: 'localhost' }),
    });
    const onError = vi.fn();

    manager.connect('abc-def-ghi', {
      onClose: vi.fn(),
      onError,
      onGameStart: vi.fn(),
      onInit: vi.fn(),
      onOpen: vi.fn(),
      onOpponentDisconnected: vi.fn(),
      onSync: vi.fn(),
    });

    socket.emitMessage('not json');
    socket.emitError();

    expect(onError).toHaveBeenNthCalledWith(1, 'Invalid server payload');
    expect(onError).toHaveBeenNthCalledWith(2, 'unavailable');
  });

  it('ignores unknown messages and avoids syncing when the socket is not open', () => {
    const socket = new MockWebSocket('ws://localhost/api/match/abc-def-ghi');
    const onError = vi.fn();
    const onSync = vi.fn();
    const manager = createMatchConnectionManager({
      createSocket: () => socket as unknown as WebSocket,
      getLocation: () => ({ protocol: 'http:', host: 'localhost' }),
    });

    manager.connect('abc-def-ghi', {
      onClose: vi.fn(),
      onError,
      onGameStart: vi.fn(),
      onInit: vi.fn(),
      onOpen: vi.fn(),
      onOpponentDisconnected: vi.fn(),
      onSync,
    });

    manager.syncState({ winner: 'anubis' });
    socket.emitMessage(JSON.stringify({ foo: 'bar' }));
    socket.emitMessage(JSON.stringify({ type: 'unknown' }));

    expect(socket.send).not.toHaveBeenCalled();
    expect(onSync).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('closes an active socket when disconnect is called directly', () => {
    const socket = new MockWebSocket('ws://localhost/api/match/abc-def-ghi');
    const manager = createMatchConnectionManager({
      createSocket: () => socket as unknown as WebSocket,
      getLocation: () => ({ protocol: 'http:', host: 'localhost' }),
    });

    manager.connect('abc-def-ghi', {
      onClose: vi.fn(),
      onError: vi.fn(),
      onGameStart: vi.fn(),
      onInit: vi.fn(),
      onOpen: vi.fn(),
      onOpponentDisconnected: vi.fn(),
      onSync: vi.fn(),
    });

    manager.disconnect();
    expect(socket.close).toHaveBeenCalledTimes(1);
  });
});
