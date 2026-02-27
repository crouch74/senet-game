import { create } from 'zustand';
import type { GameState, PlayerID } from './types';
import { createInitialState, getThrowResult, getLegalMoves, applyMove, autoPassIfNoMoves } from './logic';

let socket: WebSocket | null = null;
let connectionAttempt = 0;

type RoomJoinError = 'not_found' | 'full' | 'unavailable';

const normalizeRoomId = (roomId: string) => roomId.trim().toLowerCase();

const mapRoomJoinError = (message: unknown): RoomJoinError => {
    const lowered = typeof message === 'string' ? message.toLowerCase() : '';

    if (lowered.includes('does not exist')) return 'not_found';
    if (lowered.includes('full')) return 'full';
    return 'unavailable';
};

interface SenetStore extends GameState {
    // Online matches
    isOnline: boolean;
    isConnectingToRoom: boolean;
    isWaitingForOpponent: boolean;
    roomId: string | null;
    localPlayer: PlayerID | null;
    roomJoinError: RoomJoinError | null;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    clearRoomJoinError: () => void;
    syncState: (state: Partial<GameState>) => void;

    // Actions
    throwSticks: () => void;
    movePiece: (pieceId: string) => void;

    resetGame: () => void;
    passTurn: () => void;
    playRandomTurns: (turnsCount: number) => void;
    // UI helpers
    legalMoves: { pieceId: string; targetSquare: number }[];
    hoveredPieceId: string | null;
    setHoveredPieceId: (pieceId: string | null) => void;
    lastMove: { pieceId: string; from: number; to: number; isCapture?: boolean } | null;

    // UI Modals
    showGuide: boolean;
    setShowGuide: (show: boolean) => void;
}

export const useSenetStore = create<SenetStore>((set, get) => ({
    ...createInitialState(),
    legalMoves: [],
    hoveredPieceId: null,
    setHoveredPieceId: (id) => set({ hoveredPieceId: id }),
    lastMove: null,

    showGuide: false,
    setShowGuide: (show) => set({ showGuide: show }),

    // Online states
    isOnline: false,
    isConnectingToRoom: false,
    isWaitingForOpponent: false,
    roomId: null,
    localPlayer: null,
    roomJoinError: null,

    joinRoom: (roomId: string) => {
        const normalizedRoomId = normalizeRoomId(roomId);
        if (!normalizedRoomId) return;

        const currentAttempt = ++connectionAttempt;

        if (socket) {
            socket.close();
        }

        // Determine websocket url
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/match/${normalizedRoomId}`;

        socket = new WebSocket(wsUrl);
        set({
            isOnline: false,
            isConnectingToRoom: true,
            isWaitingForOpponent: true,
            roomId: normalizedRoomId,
            localPlayer: null,
            roomJoinError: null
        });

        socket.onopen = () => {
            if (currentAttempt !== connectionAttempt) return;
            console.log(`🌐 Joined room ${normalizedRoomId}`);
        };

        socket.onmessage = (event) => {
            if (currentAttempt !== connectionAttempt) return;
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
                set({
                    isOnline: true,
                    isConnectingToRoom: false,
                    isWaitingForOpponent: true,
                    roomId: normalizedRoomId,
                    localPlayer: data.player,
                    roomJoinError: null
                });
                console.log(`🎮 Playing as ${data.player} — waiting for opponent`);
            } else if (data.type === 'game_start') {
                set({ isConnectingToRoom: false, isWaitingForOpponent: false });
                console.log('⚔️ Both players connected — game started!');
            } else if (data.type === 'sync') {
                set({ ...data.state, legalMoves: [] });
            } else if (data.type === 'opponent_disconnected') {
                set({ isWaitingForOpponent: true });
                console.log('⚠️ Opponent disconnected — gameplay paused');
            } else if (data.type === 'error') {
                console.error('WebSocket Error:', data.message);
                set({ roomJoinError: mapRoomJoinError(data.message), isConnectingToRoom: false });
                socket?.close();
            }
        };

        socket.onerror = () => {
            if (currentAttempt !== connectionAttempt) return;
            set({ roomJoinError: 'unavailable', isConnectingToRoom: false });
        };

        socket.onclose = () => {
            if (currentAttempt !== connectionAttempt) return;
            set({
                isOnline: false,
                isConnectingToRoom: false,
                isWaitingForOpponent: false,
                roomId: null,
                localPlayer: null
            });
            socket = null;
        };
    },

    leaveRoom: () => {
        connectionAttempt += 1;
        if (socket) {
            socket.close();
            socket = null;
        }
        set({
            isOnline: false,
            isConnectingToRoom: false,
            isWaitingForOpponent: false,
            roomId: null,
            localPlayer: null,
            roomJoinError: null
        });
    },

    clearRoomJoinError: () => set({ roomJoinError: null }),

    syncState: (state: Partial<GameState>) => {
        if (get().isOnline && socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'sync', state }));
        }
    },

    throwSticks: () => {
        const state = get();
        if (state.winner || state.currentThrow) return;
        if (state.isOnline && (state.isWaitingForOpponent || state.currentPlayer !== state.localPlayer)) return;

        const throwRes = getThrowResult();
        const partialState: Partial<GameState> = { currentThrow: throwRes };
        set(partialState);
        get().syncState(partialState);

        // Automatically calculate legal moves to see if we need to auto-pass
        const stateAfterThrow = get();
        const legalMoves = getLegalMoves(stateAfterThrow);

        if (legalMoves.length === 0) {
            setTimeout(() => get().passTurn(), 1500); // UI delay before passing
        }

        set({ legalMoves });
    },

    movePiece: (pieceId: string) => {
        const state = get();
        if (!state.currentThrow) return;
        if (state.isOnline && (state.isWaitingForOpponent || state.currentPlayer !== state.localPlayer)) return;

        const newState = applyMove(state, pieceId);
        const oldPiece = state.board.find(p => p.id === pieceId);
        const newPiece = newState.board.find(p => p.id === pieceId);

        // Detect capture (if another piece moved)
        let capturedPieceId: string | null = null;
        newState.board.forEach(p => {
            const oldP = state.board.find(op => op.id === p.id);
            if (oldP && oldP.position !== p.position && p.id !== pieceId) {
                capturedPieceId = p.id;
            }
        });

        const partialState: Partial<GameState> = {
            board: newState.board,
            currentPlayer: newState.currentPlayer,
            currentThrow: newState.currentThrow,
            winner: newState.winner,
            historyLog: newState.historyLog
        };
        set({
            ...partialState,
            legalMoves: [],
            lastMove: oldPiece && newPiece ? {
                pieceId,
                from: oldPiece.position,
                to: newPiece.position,
                isCapture: !!capturedPieceId
            } : null
        });
        get().syncState(partialState);

        // Clear lastMove after some time
        setTimeout(() => set({ lastMove: null }), 2000);
    },

    passTurn: () => {
        const state = get();
        const newState = autoPassIfNoMoves(state);

        const partialState: Partial<GameState> = {
            currentPlayer: newState.currentPlayer,
            currentThrow: newState.currentThrow,
            historyLog: newState.historyLog,
            winner: newState.winner
        };
        set({ ...partialState, legalMoves: [] });
        get().syncState(partialState);
    },

    resetGame: () => {
        const state = get();
        if (state.isOnline) return; // Disallow resetting online games for now
        set({ ...createInitialState(state.ruleset), legalMoves: [] });
    },

    playRandomTurns: (turnsCount: number) => {
        const storeState = get();
        if (storeState.isOnline || storeState.winner) return;

        console.log(`🤖 Playing ${turnsCount} random turns...`);

        let state: GameState = {
            board: storeState.board,
            currentPlayer: storeState.currentPlayer,
            currentThrow: storeState.currentThrow,
            ruleset: storeState.ruleset,
            winner: storeState.winner,
            historyLog: storeState.historyLog
        };

        for (let i = 0; i < turnsCount; i++) {
            if (state.winner) break;

            if (!state.currentThrow) {
                const throwRes = getThrowResult();
                state = { ...state, currentThrow: throwRes };
            }

            const legalMoves = getLegalMoves(state);

            if (legalMoves.length === 0) {
                state = autoPassIfNoMoves(state);
            } else {
                const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
                state = applyMove(state, randomMove.pieceId);
            }
        }

        const partialState: Partial<GameState> = {
            board: state.board,
            currentPlayer: state.currentPlayer,
            currentThrow: state.currentThrow,
            winner: state.winner,
            historyLog: state.historyLog
        };
        set({
            ...partialState,
            legalMoves: state.currentThrow ? getLegalMoves(state) : [],
            lastMove: null
        });
        get().syncState(partialState);
        console.log(`✅ Finished playing random turns. Winner: ${state.winner || 'None'}`);
    }
}));
