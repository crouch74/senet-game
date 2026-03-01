import type { Ruleset } from '../../../engine/types'

export const UrRuleset: Ruleset = {
  id: 'ur-finkel',
  name: 'The Royal Game of Ur',
  description:
    'A Finkel-style reconstruction with seven counters, four binary dice, safe rosettes, capture on the king’s road, and exact bear-off.',
  captureMode: 'remove',
  protectedAdjacency: false,
  protectedAdjacencyCount: 0,
  blockadeLength: 0,
  extraThrowConditions: [],
  bearingOffRequirements: 'exact',
  sticksCount: 4,
  specialSquares: {
    4: {
      name: 'Western Rosette',
      canBypass: true,
      effect: 'extra_turn',
    },
    8: {
      name: 'King’s Road Rosette',
      canBypass: true,
      effect: 'safe',
    },
    14: {
      name: 'Eastern Rosette',
      canBypass: true,
      effect: 'extra_turn',
    },
  },
}
