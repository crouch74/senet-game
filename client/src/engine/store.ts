import { create } from 'zustand';
import type { GameState, Ruleset } from './types';
import { createInitialState, getThrowResult, getLegalMoves, applyMove, autoPassIfNoMoves } from './logic';
import { MuseumRuleset, CommonRuleset, DefaultCustomRuleset } from './rules';

interface SenetStore extends GameState {
    // Actions
    throwSticks: () => void;
    movePiece: (pieceId: string) => void;
    changeRuleset: (rulesetId: string) => void;
    resetGame: () => void;
    passTurn: () => void;
    // UI helpers
    legalMoves: { pieceId: string; targetSquare: number }[];
}

export const useSenetStore = create<SenetStore>((set, get) => ({
    ...createInitialState(),
    legalMoves: [],

    throwSticks: () => {
        const state = get();
        if (state.winner || state.currentThrow) return;

        const throwRes = getThrowResult();
        set({ currentThrow: throwRes });

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

        const newState = applyMove(state, pieceId);
        set({ ...newState, legalMoves: [] });
    },

    passTurn: () => {
        const state = get();
        const newState = autoPassIfNoMoves(state);
        set({ ...newState, legalMoves: [] });
    },

    changeRuleset: (rulesetId: string) => {
        let newRuleset: Ruleset;
        if (rulesetId === 'museum') newRuleset = MuseumRuleset;
        else if (rulesetId === 'common') newRuleset = CommonRuleset;
        else newRuleset = DefaultCustomRuleset;

        console.log(`📜 Changed active ruleset to: ${newRuleset.name}`);

        set({ ...createInitialState(newRuleset), ruleset: newRuleset, legalMoves: [] });
    },

    resetGame: () => {
        set({ ...createInitialState(get().ruleset), legalMoves: [] });
    }
}));
