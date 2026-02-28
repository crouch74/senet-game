import type { Ruleset } from '../../../engine/types'

export const HoundsAndJackalsRuleset: Ruleset = {
  id: 'hounds-and-jackals-standard',
  name: 'Papyrus of the Fifty-Eight Holes',
  description:
    'A house reconstruction of Hounds and Jackals using five pegs per side, marked shortcut and setback holes, exact finishing, and four throw sticks.',
  captureMode: 'none',
  protectedAdjacency: false,
  protectedAdjacencyCount: 0,
  blockadeLength: 0,
  extraThrowConditions: [],
  bearingOffRequirements: 'exact',
  sticksCount: 4,
  specialSquares: {},
}
