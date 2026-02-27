import { create } from 'zustand';
import type { GameState, PlayerID } from './types';
import { createInitialState, getThrowResult, getLegalMoves, applyMove, autoPassIfNoMoves } from './logic';

let socket: WebSocket | null = null;

interface SenetStore extends GameState {
    // Online matches
    isOnline: boolean;
    isWaitingForOpponent: boolean;
    roomId: string | null;
    localPlayer: PlayerID | null;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
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
    isWaitingForOpponent: false,
    roomId: null,
    localPlayer: null,

    joinRoom: (roomId: string) => {
        if (socket) {
            socket.close();
        }

        // Determine websocket url
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/match/${roomId}`;

        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log(`🌐 Joined room ${roomId}`);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
                set({ isOnline: true, isWaitingForOpponent: true, roomId, localPlayer: data.player });
                console.log(`🎮 Playing as ${data.player} — waiting for opponent`);
            } else if (data.type === 'game_start') {
                set({ isWaitingForOpponent: false });
                console.log('⚔️ Both players connected — game started!');
            } else if (data.type === 'sync') {
                set({ ...data.state, legalMoves: [] });
            } else if (data.type === 'opponent_disconnected') {
                set({ isWaitingForOpponent: true });
                console.log('⚠️ Opponent disconnected — gameplay paused');
            } else if (data.type === 'error') {
                console.error('WebSocket Error:', data.message);
                socket?.close();
                set({ isOnline: false, isWaitingForOpponent: false, roomId: null, localPlayer: null });
            }
        };

        socket.onclose = () => {
            set({ isOnline: false, isWaitingForOpponent: false, roomId: null, localPlayer: null });
            socket = null;
        };
    },

    leaveRoom: () => {
        if (socket) {
            socket.close();
            socket = null;
        }
        set({ isOnline: false, isWaitingForOpponent: false, roomId: null, localPlayer: null });
    },

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
