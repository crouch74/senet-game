export type PlayerID = 'anubis' | 'sphinx' | 'horus' | 'seth' | 'osiris' | 'isis';
export type PlayerType = 'ball' | 'lion' | 'peg' | 'senet_piece';
export type GameType = 'senet' | 'mehen' | 'hounds-and-jackals';
export type OfflineMode = 'play_and_pass' | 'vs_pc';
export type MehenOpponentLionMode = 'INVALID' | 'BLOCKED';
export type HoundsAndJackalsJumpType = 'good' | 'bad';

export interface Piece {
    id: string;
    player: PlayerID;
    type: PlayerType;
    position: number; // 0 means off-board (start), 30 means finished (hounds and jackals), 31 means borne off (senet), 60 means Mehen center
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
    sticksCount?: number; // number of sticks used, defaults to 4
    specialSquares: {
        [square: number]: {
            name: string;
            canBypass: boolean; // True if pieces can move past it without landing
            effect: 'none' | 'water' | 'extra_turn' | 'lock' | 'require_throw' | 'safe';
            requiredThrow?: number; // e.g. House 28 requires throw of 3
        }
    };
}

export type MehenCaptureMode = 'SEND_TO_START' | 'SWAP_POSITIONS';
export type MehenWinCondition = 'ALL_BALLS_AND_LION' | 'LION_ONLY' | 'BALLS_ONLY' | 'FIRST_PIECE_TO_CENTER';
export type MehenEventType = 'MOVE' | 'CAPTURE' | 'BLOCKED' | 'SAFE_LAND' | 'FINISH' | 'EXTRA_TURN' | 'WIN';
export type HoundsAndJackalsEventType = 'MOVE' | 'GOOD_JUMP' | 'BAD_JUMP' | 'BLOCKED' | 'FINISH' | 'WIN';

export interface MehenConfig {
    boardSize: number; // default 60
    ballsPerPlayer: number; // default 5
    exactFinish: boolean; // default true
    allowBounce: boolean; // default false
    lionBlocks: boolean; // default true
    captureMode: MehenCaptureMode; // default SEND_TO_START
    safeCells: number[]; // default [10, 20, 30, 40, 50]
    extraRollValues: number[]; // default [1, 5]
    winCondition: MehenWinCondition; // default ALL_BALLS_AND_LION
    requireExactCenterRoll: boolean; // default true
    opponentLionMode?: MehenOpponentLionMode;
}

export interface HoundsAndJackalsSpecialHole {
    type: HoundsAndJackalsJumpType;
    target: number;
    label: string;
    marker: string;
}

export interface HoundsAndJackalsConfig {
    trackLength: number;
    goalPosition: number;
    piecesPerPlayer: number;
    exactFinish: boolean;
    reserveEntry: 'any_roll_to_first_hole';
    throwMode: 'four_sticks_1_to_5';
    extraTurnValues: number[];
    specialHoles: Record<number, HoundsAndJackalsSpecialHole>;
}

export interface MehenMove {
    pieceId: string;
    player: PlayerID;
    roll: number;
    destination: number;
    targetSquare: number;
}

export interface ThrowResult {
    lightSidesUp: number; // 0 to sticksCount
    value: number; // calculated value (e.g. 1-4, 0=5 or 1-6, 0=12)
}

export interface HistoryEvent {
    key: string;
    params?: Record<string, unknown>;
    player?: PlayerID;

    // Mehen-specific logs requirement: "Every action must append: turn, player, roll, piece, from, to, eventType"
    turn?: number;
    roll?: number;
    piece?: string;
    pieceId?: string;
    from?: number;
    to?: number;
    eventType?: MehenEventType | HoundsAndJackalsEventType;
}

export interface GameState {
    gameType: GameType;
    board: Piece[];
    currentPlayer: PlayerID;
    currentThrow: ThrowResult | null;
    ruleset: Ruleset;
    houndsAndJackalsConfig?: HoundsAndJackalsConfig;
    mehenConfig?: MehenConfig;
    winner: PlayerID | null;
    historyLog: HistoryEvent[];

    turnIndex?: number;
    players?: PlayerID[];
    boardSize?: number;
    safeCells?: number[];
    lastRoll?: number | null;
}
