import type { GameState, Piece, ThrowResult } from './types';
import { MuseumRuleset } from './rules';
import type { Ruleset } from './types';

export const INITIAL_BOARD: Piece[] = [
    // Senet usually starts with pieces alternating on the first 10 squares
    // e.g., Light, Dark, Light, Dark...
    { id: 'L1', player: 'light', position: 1 },
    { id: 'D1', player: 'dark', position: 2 },
    { id: 'L2', player: 'light', position: 3 },
    { id: 'D2', player: 'dark', position: 4 },
    { id: 'L3', player: 'light', position: 5 },
    { id: 'D3', player: 'dark', position: 6 },
    { id: 'L4', player: 'light', position: 7 },
    { id: 'D4', player: 'dark', position: 8 },
    { id: 'L5', player: 'light', position: 9 },
    { id: 'D5', player: 'dark', position: 10 },
];

export function createInitialState(ruleset: Ruleset = MuseumRuleset): GameState {
    return {
        board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
        currentPlayer: 'light',
        currentThrow: null,
        ruleset,
        winner: null,
        historyLog: [{ key: 'history.game_started' }]
    };
}

// Stick probabilities
// 4 sticks with 1 flat side, 1 curved side. Assuming 50/50 for ease
export function getThrowResult(): ThrowResult {
    let lightCount = 0;
    for (let i = 0; i < 4; i++) {
        if (Math.random() > 0.5) lightCount++;
    }

    // Customary senet scoring:
    // 1 light side = 1
    // 2 light sides = 2
    // 3 light sides = 3
    // 4 light sides = 4
    // 0 light sides = 5
    return {
        lightSidesUp: lightCount,
        value: lightCount === 0 ? 5 : lightCount
    };
}

export function isValidMove(gameState: GameState, pieceId: string, steps: number): { valid: boolean; reason?: string, targetSquare?: number } {
    if (gameState.winner) return { valid: false, reason: 'Game is over' };

    const piece = gameState.board.find(p => p.id === pieceId);
    if (!piece) return { valid: false, reason: 'Piece not found' };
    if (piece.player !== gameState.currentPlayer) return { valid: false, reason: "Not your piece" };
    if (piece.position === 31) return { valid: false, reason: "Piece already borne off" };

    const targetSquare = piece.position + steps;

    // Check backward moves (requires some rulesets, but keeping it simple for now: only forward, unless blocked? Usually Senet allows some backward if no forward.)
    // We'll enforce strictly forward unless 27 (Water) happens.

    if (targetSquare > 30) {
        // Bearing off logic
        if (gameState.ruleset.bearingOffRequirements === 'exact' && targetSquare !== 31) {
            return { valid: false, reason: "Requires exact throw to bear off" };
        }
        // Check if House 30 requires a specific throw
        const currentSquareDetails = gameState.ruleset.specialSquares[piece.position];
        if (currentSquareDetails?.effect === 'require_throw' && steps !== currentSquareDetails.requiredThrow) {
            return { valid: false, reason: `Requires a throw of ${currentSquareDetails.requiredThrow} to move` };
        }
    }

    // Check blockades
    if (gameState.ruleset.blockadeLength > 0 && targetSquare <= 30) {
        let opponentBlockLength = 0;
        for (let sq = piece.position + 1; sq <= Math.min(targetSquare, 30); sq++) {
            const occupant = gameState.board.find(p => p.position === sq);
            if (occupant && occupant.player !== piece.player) {
                opponentBlockLength++;
                if (opponentBlockLength >= gameState.ruleset.blockadeLength) {
                    return { valid: false, reason: "Blocked by an opponent's blockade" };
                }
            } else {
                opponentBlockLength = 0;
            }
        }
    }

    // Check House of Happiness (26) rules
    if (gameState.ruleset.specialSquares[26] && !gameState.ruleset.specialSquares[26].canBypass) {
        if (piece.position < 26 && targetSquare > 26) {
            return { valid: false, reason: "Cannot bypass the House of Happiness (Square 26)" };
        }
    }

    // Check target occupancy
    if (targetSquare <= 30) {
        const occupant = gameState.board.find(p => p.position === targetSquare);
        if (occupant) {
            if (occupant.player === piece.player) {
                return { valid: false, reason: "Target square occupied by own piece" };
            }

            // Protected adjacency check
            if (gameState.ruleset.protectedAdjacency) {
                const adjacentEnemyLeft = gameState.board.find(p => p.position === targetSquare - 1 && p.player === occupant.player);
                const adjacentEnemyRight = gameState.board.find(p => p.position === targetSquare + 1 && p.player === occupant.player);
                if (adjacentEnemyLeft || adjacentEnemyRight) {
                    return { valid: false, reason: "Target piece is protected" };
                }
            }
        }
    }

    return { valid: true, targetSquare };
}

export function getLegalMoves(gameState: GameState): { pieceId: string, targetSquare: number }[] {
    if (!gameState.currentThrow) return [];

    const moves: { pieceId: string, targetSquare: number }[] = [];
    const pieces = gameState.board.filter(p => p.player === gameState.currentPlayer && p.position < 31);

    for (const p of pieces) {
        const check = isValidMove(gameState, p.id, gameState.currentThrow.value);
        if (check.valid && check.targetSquare !== undefined) {
            moves.push({ pieceId: p.id, targetSquare: check.targetSquare });
        }
    }

    return moves;
}

export function applyMove(gameState: GameState, pieceId: string): GameState {
    if (!gameState.currentThrow) return gameState;
    const throwValue = gameState.currentThrow.value;

    const validation = isValidMove(gameState, pieceId, throwValue);
    if (!validation.valid || validation.targetSquare === undefined) return gameState;

    const targetSquare = validation.targetSquare;
    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    const piece = newState.board.find(p => p.id === pieceId)!;

    let endSquare = targetSquare > 30 ? 31 : targetSquare; // 31 is borne off

    // Check for capture
    if (endSquare <= 30) {
        const occupant = newState.board.find(p => p.position === endSquare && p.player !== piece.player);
        if (occupant) {
            if (newState.ruleset.captureMode === 'swap') {
                occupant.position = piece.position; // Swap places
                newState.historyLog.push({ key: 'history.captured_swapped', params: { pos: piece.position } });
            } else if (newState.ruleset.captureMode === 'remove') {
                occupant.position = 0; // Removing puts it to 0 (off board / rebirth start)
            }
        }
    }

    piece.position = endSquare;
    newState.historyLog.push({
        key: piece.position === 31 ? 'history.moved_to_afterlife' : 'history.moved_to',
        params: piece.position === 31 ? undefined : { pos: endSquare }
    });

    // Apply Special Squares
    if (endSquare <= 30) {
        const special = newState.ruleset.specialSquares[endSquare];
        if (special) {
            if (special.effect === 'water') {
                // Move to rebirth immediately
                piece.position = 15;
                // If 15 is occupied, what happens? Usually they have to go back further or they just go to 15. We assume 15 is available or swaps.
                // Let's just move to 15 for now.
                newState.historyLog.push({ key: 'history.washed_back' });
            }
        }
    }

    // Check Win Condition
    const currentPieces = newState.board.filter(p => p.player === newState.currentPlayer);
    if (currentPieces.every(p => p.position === 31)) {
        newState.winner = newState.currentPlayer;
        newState.historyLog.push({ key: 'history.wins', params: { player: newState.currentPlayer } });
        return newState;
    }

    // Check extra throw
    const earnsExtraThrow = newState.ruleset.extraThrowConditions.includes(throwValue);

    if (!earnsExtraThrow) {
        newState.currentPlayer = newState.currentPlayer === 'light' ? 'dark' : 'light';
    } else {
        newState.historyLog.push({ key: 'history.extra_throw' });
    }

    newState.currentThrow = null; // Consume throw

    return newState;
}

export function autoPassIfNoMoves(gameState: GameState): GameState {
    if (!gameState.currentThrow) return gameState;
    const moves = getLegalMoves(gameState);
    if (moves.length === 0) {
        const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
        newState.historyLog.push({ key: 'history.no_moves', params: { player: newState.currentPlayer } });
        newState.currentPlayer = newState.currentPlayer === 'light' ? 'dark' : 'light';
        newState.currentThrow = null;
        return newState;
    }
    return gameState;
}
