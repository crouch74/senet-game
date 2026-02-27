export type PlayerID = 'light' | 'dark';

export interface Piece {
    id: string;
    player: PlayerID;
    position: number; // 0 means off-board (start), 31 means borne off, 1-30 are board squares
    isProtected?: boolean;
}

export interface Ruleset {
    id: string;
    name: string;
    description: string;
    // Options
    captureMode: 'swap' | 'remove' | 'none';
    protectedAdjacency: boolean;
    protectedAdjacencyCount: number; // 2 means pair protects
    blockadeLength: number; // usually 3
    extraThrowConditions: number[]; // e.g., throw of 1, 4, 5 gives extra turn
    bearingOffRequirements: 'exact' | 'any'; // Does a piece need exact throw to bear off from houses 26-30?
    specialSquares: {
        [square: number]: {
            name: string;
            canBypass: boolean; // True if pieces can move past it without landing
            effect: 'none' | 'water' | 'extra_turn' | 'lock' | 'require_throw' | 'safe';
            requiredThrow?: number; // e.g. House 28 requires throw of 3
        }
    };
}

export interface ThrowResult {
    lightSidesUp: number; // 0 to 4
    value: number; // 1 to 5 (or sometimes 0 light sides = 5 points)
}

export interface HistoryEvent {
    key: string;
    params?: Record<string, any>;
    player?: PlayerID;
}

export interface GameState {
    board: Piece[];
    currentPlayer: PlayerID;
    currentThrow: ThrowResult | null;
    ruleset: Ruleset;
    winner: PlayerID | null;
    historyLog: HistoryEvent[];
}
