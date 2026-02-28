import type { GameState, Piece, ThrowResult } from '../../../engine/types';
import { CommonRuleset } from './rules';
import type { Ruleset } from '../../../engine/types';

const toGameStateSnapshot = (gameState: GameState): GameState => ({
    gameType: gameState.gameType,
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    currentThrow: gameState.currentThrow,
    ruleset: gameState.ruleset,
    winner: gameState.winner,
    historyLog: gameState.historyLog,
});

const cloneGameState = (gameState: GameState): GameState => structuredClone(toGameStateSnapshot(gameState));
const cloneBoard = (board: Piece[]): Piece[] => structuredClone(board);

export const INITIAL_BOARD: Piece[] = [
    // Senet usually starts with pieces alternating on the first 10 squares
    // e.g., Anubis, Sphinx, Anubis, Sphinx...
    { id: 'L1', player: 'anubis', position: 1, type: 'senet_piece' },
    { id: 'D1', player: 'sphinx', position: 2, type: 'senet_piece' },
    { id: 'L2', player: 'anubis', position: 3, type: 'senet_piece' },
    { id: 'D2', player: 'sphinx', position: 4, type: 'senet_piece' },
    { id: 'L3', player: 'anubis', position: 5, type: 'senet_piece' },
    { id: 'D3', player: 'sphinx', position: 6, type: 'senet_piece' },
    { id: 'L4', player: 'anubis', position: 7, type: 'senet_piece' },
    { id: 'D4', player: 'sphinx', position: 8, type: 'senet_piece' },
    { id: 'L5', player: 'anubis', position: 9, type: 'senet_piece' },
    { id: 'D5', player: 'sphinx', position: 10, type: 'senet_piece' },
];

export function createInitialState(ruleset: Ruleset = CommonRuleset): GameState {
    return {
        gameType: 'senet',
        board: cloneBoard(INITIAL_BOARD),
        currentPlayer: 'anubis',
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

    // Special constraint for the last 3 squares (Houses 28, 29, 30)
    const currentSquareDetails = gameState.ruleset.specialSquares[piece.position];
    if (currentSquareDetails?.effect === 'require_throw') {
        if (steps !== currentSquareDetails.requiredThrow) {
            return { valid: false, reason: `Requires exactly a throw of ${currentSquareDetails.requiredThrow} to bear off. Cannot move between the last 3 houses.` };
        }
    }

    if (targetSquare > 30) {
        // Bearing off logic
        if (gameState.ruleset.bearingOffRequirements === 'exact' && targetSquare !== 31) {
            return { valid: false, reason: "Requires exact throw to bear off" };
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

    // Check House of Beauty (26) rules
    if (gameState.ruleset.specialSquares[26] && !gameState.ruleset.specialSquares[26].canBypass) {
        if (piece.position < 26 && targetSquare > 26) {
            return { valid: false, reason: "Cannot bypass the House of Beauty (Square 26)" };
        }
    }

    // Check target occupancy
    if (targetSquare <= 30) {
        const occupant = gameState.board.find(p => p.position === targetSquare);
        if (occupant) {
            if (occupant.player === piece.player) {
                return { valid: false, reason: "Target square occupied by own piece" };
            }

            // Safe house check
            const targetSquareDetails = gameState.ruleset.specialSquares[targetSquare];
            if (targetSquareDetails?.effect === 'safe') {
                return { valid: false, reason: "Target piece is in a safe house" };
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
    const newState = cloneGameState(gameState);
    const piece = newState.board.find(p => p.id === pieceId)!;

    const endSquare = targetSquare > 30 ? 31 : targetSquare; // 31 is borne off

    // Check for capture
    if (endSquare <= 30) {
        const occupant = newState.board.find(p => p.position === endSquare && p.player !== piece.player);
        if (occupant) {
            if (newState.ruleset.captureMode === 'swap') {
                occupant.position = piece.position; // Swap places
                newState.historyLog.push({
                    key: 'history.captured_swapped',
                    params: { pos: piece.position },
                    player: newState.currentPlayer
                });
            } else if (newState.ruleset.captureMode === 'remove') {
                occupant.position = 0; // Removing puts it to 0 (off board / rebirth start)
            }
        }
    }

    piece.position = endSquare;
    newState.historyLog.push({
        key: piece.position === 31 ? 'history.moved_to_afterlife' : 'history.moved_to',
        params: piece.position === 31 ? undefined : { pos: endSquare },
        player: newState.currentPlayer
    });

    // Apply Special Squares
    if (endSquare <= 30) {
        const special = newState.ruleset.specialSquares[endSquare];
        if (special) {
            if (special.effect === 'water') {
                // Move to rebirth immediately
                let targetPos = 15;

                // If 15 is occupied, go backwards to find the first empty square
                if (newState.board.some(p => p.position === 15 && p.id !== piece.id)) {
                    targetPos = 1; // Fallback to 1
                    for (let sq = 14; sq >= 1; sq--) {
                        if (!newState.board.some(p => p.position === sq)) {
                            targetPos = sq;
                            break;
                        }
                    }
                }

                piece.position = targetPos;

                newState.historyLog.push({
                    key: 'history.washed_back',
                    player: newState.currentPlayer
                });
            }
        }
    }

    // Check Win Condition
    const currentPieces = newState.board.filter(p => p.player === newState.currentPlayer);
    if (currentPieces.every(p => p.position === 31)) {
        newState.winner = newState.currentPlayer;
        newState.historyLog.push({
            key: 'history.wins',
            params: { player: newState.currentPlayer },
            player: newState.currentPlayer
        });
        return newState;
    }

    // Check extra throw
    const earnsExtraThrow = newState.ruleset.extraThrowConditions.includes(throwValue);

    if (!earnsExtraThrow) {
        newState.currentPlayer = newState.currentPlayer === 'anubis' ? 'sphinx' : 'anubis';
    } else {
        newState.historyLog.push({
            key: 'history.extra_throw',
            player: newState.currentPlayer
        });
    }

    newState.currentThrow = null; // Consume throw

    return newState;
}

export function autoPassIfNoMoves(gameState: GameState): GameState {
    if (!gameState.currentThrow) return gameState;
    const moves = getLegalMoves(gameState);
    if (moves.length === 0) {
        const newState = cloneGameState(gameState);
        newState.historyLog.push({
            key: 'history.no_moves',
            params: { player: newState.currentPlayer },
            player: newState.currentPlayer
        });
        newState.currentPlayer = newState.currentPlayer === 'anubis' ? 'sphinx' : 'anubis';
        newState.currentThrow = null;
        return newState;
    }
    return gameState;
}
