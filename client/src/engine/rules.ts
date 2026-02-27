import type { Ruleset } from './types';

export const CommonRuleset: Ruleset = {
    id: 'common',
    name: 'Common Reconstruction (Detailed)',
    description: 'A richer ruleset with protected pairs, blockades, and swap-capture logic matching widely-circulated rules.',
    captureMode: 'swap',
    protectedAdjacency: true,
    protectedAdjacencyCount: 2,
    blockadeLength: 3,
    extraThrowConditions: [1, 4, 5],
    bearingOffRequirements: 'exact',
    specialSquares: {
        15: { name: 'House of Rebirth', canBypass: true, effect: 'none' },
        26: { name: 'House of Happiness', canBypass: false, effect: 'none' },
        27: { name: 'House of Water', canBypass: true, effect: 'water' },
        28: { name: 'House of Three Truths', canBypass: true, effect: 'require_throw', requiredThrow: 3 },
        29: { name: 'House of Re-Atoum', canBypass: true, effect: 'require_throw', requiredThrow: 2 },
        30: { name: 'House of Horus', canBypass: true, effect: 'require_throw', requiredThrow: 1 }
    }
};
