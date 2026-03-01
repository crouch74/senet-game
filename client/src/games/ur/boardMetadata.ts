import type { PlayerID } from '../../engine/types'

export type UrSquareId =
  | 't3'
  | 't2'
  | 't1'
  | 't0'
  | 't6'
  | 't7'
  | 'm0'
  | 'm1'
  | 'm2'
  | 'm3'
  | 'm4'
  | 'm5'
  | 'm6'
  | 'm7'
  | 'b3'
  | 'b2'
  | 'b1'
  | 'b0'
  | 'b6'
  | 'b7'

export interface UrBoardSquare {
  col: number
  id: UrSquareId
  isRosette: boolean
  lane: 'top-private' | 'shared' | 'bottom-private'
  motif:
    | 'eye'
    | 'star-cluster'
    | 'checker-lattice'
    | 'stepped-chevron'
    | 'rosette'
  row: number
  tileInset: number
  tileRotationDeg: number
  tooltipType: 'exit' | 'private' | 'rosette' | 'shared'
  wear: number
}

export const UR_PLAYER_PATHS: Record<'anubis' | 'sphinx', UrSquareId[]> = {
  anubis: ['b3', 'b2', 'b1', 'b0', 'm0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'b7', 'b6'],
  sphinx: ['t3', 't2', 't1', 't0', 'm0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 't7', 't6'],
}

export const UR_PROGRESS_BY_PLAYER: Record<'anubis' | 'sphinx', Record<UrSquareId, number>> = {
  anubis: UR_PLAYER_PATHS.anubis.reduce(
    (accumulator, squareId, index) => ({
      ...accumulator,
      [squareId]: index + 1,
    }),
    {} as Record<UrSquareId, number>,
  ),
  sphinx: UR_PLAYER_PATHS.sphinx.reduce(
    (accumulator, squareId, index) => ({
      ...accumulator,
      [squareId]: index + 1,
    }),
    {} as Record<UrSquareId, number>,
  ),
}

export const UR_BOARD_SQUARES: UrBoardSquare[] = [
  { id: 't3', row: 0, col: 0, lane: 'top-private', motif: 'star-cluster', isRosette: false, tileInset: 0.32, tileRotationDeg: -0.35, wear: 0.22, tooltipType: 'private' },
  { id: 't2', row: 0, col: 1, lane: 'top-private', motif: 'eye', isRosette: false, tileInset: 0.28, tileRotationDeg: 0.24, wear: 0.18, tooltipType: 'private' },
  { id: 't1', row: 0, col: 2, lane: 'top-private', motif: 'checker-lattice', isRosette: false, tileInset: 0.31, tileRotationDeg: -0.18, wear: 0.16, tooltipType: 'private' },
  { id: 't0', row: 0, col: 3, lane: 'top-private', motif: 'rosette', isRosette: true, tileInset: 0.27, tileRotationDeg: 0.12, wear: 0.2, tooltipType: 'rosette' },
  { id: 't6', row: 0, col: 6, lane: 'top-private', motif: 'rosette', isRosette: true, tileInset: 0.29, tileRotationDeg: -0.22, wear: 0.24, tooltipType: 'rosette' },
  { id: 't7', row: 0, col: 7, lane: 'top-private', motif: 'stepped-chevron', isRosette: false, tileInset: 0.3, tileRotationDeg: 0.32, wear: 0.19, tooltipType: 'exit' },
  { id: 'm0', row: 1, col: 0, lane: 'shared', motif: 'eye', isRosette: false, tileInset: 0.33, tileRotationDeg: -0.26, wear: 0.42, tooltipType: 'shared' },
  { id: 'm1', row: 1, col: 1, lane: 'shared', motif: 'star-cluster', isRosette: false, tileInset: 0.29, tileRotationDeg: 0.18, wear: 0.48, tooltipType: 'shared' },
  { id: 'm2', row: 1, col: 2, lane: 'shared', motif: 'checker-lattice', isRosette: false, tileInset: 0.32, tileRotationDeg: -0.12, wear: 0.46, tooltipType: 'shared' },
  { id: 'm3', row: 1, col: 3, lane: 'shared', motif: 'rosette', isRosette: true, tileInset: 0.26, tileRotationDeg: 0.08, wear: 0.4, tooltipType: 'rosette' },
  { id: 'm4', row: 1, col: 4, lane: 'shared', motif: 'stepped-chevron', isRosette: false, tileInset: 0.31, tileRotationDeg: -0.16, wear: 0.51, tooltipType: 'shared' },
  { id: 'm5', row: 1, col: 5, lane: 'shared', motif: 'checker-lattice', isRosette: false, tileInset: 0.34, tileRotationDeg: 0.22, wear: 0.47, tooltipType: 'shared' },
  { id: 'm6', row: 1, col: 6, lane: 'shared', motif: 'eye', isRosette: false, tileInset: 0.3, tileRotationDeg: -0.28, wear: 0.44, tooltipType: 'shared' },
  { id: 'm7', row: 1, col: 7, lane: 'shared', motif: 'stepped-chevron', isRosette: false, tileInset: 0.32, tileRotationDeg: 0.15, wear: 0.45, tooltipType: 'shared' },
  { id: 'b3', row: 2, col: 0, lane: 'bottom-private', motif: 'stepped-chevron', isRosette: false, tileInset: 0.3, tileRotationDeg: 0.28, wear: 0.2, tooltipType: 'private' },
  { id: 'b2', row: 2, col: 1, lane: 'bottom-private', motif: 'star-cluster', isRosette: false, tileInset: 0.33, tileRotationDeg: -0.24, wear: 0.24, tooltipType: 'private' },
  { id: 'b1', row: 2, col: 2, lane: 'bottom-private', motif: 'eye', isRosette: false, tileInset: 0.28, tileRotationDeg: 0.16, wear: 0.18, tooltipType: 'private' },
  { id: 'b0', row: 2, col: 3, lane: 'bottom-private', motif: 'rosette', isRosette: true, tileInset: 0.26, tileRotationDeg: -0.1, wear: 0.22, tooltipType: 'rosette' },
  { id: 'b6', row: 2, col: 6, lane: 'bottom-private', motif: 'rosette', isRosette: true, tileInset: 0.29, tileRotationDeg: 0.22, wear: 0.25, tooltipType: 'rosette' },
  { id: 'b7', row: 2, col: 7, lane: 'bottom-private', motif: 'checker-lattice', isRosette: false, tileInset: 0.31, tileRotationDeg: -0.3, wear: 0.21, tooltipType: 'exit' },
]

export const UR_EMPTY_CELLS = [
  { row: 0, col: 4 },
  { row: 0, col: 5 },
  { row: 2, col: 4 },
  { row: 2, col: 5 },
]

export const getProgressForSquare = (
  player: 'anubis' | 'sphinx',
  squareId: UrSquareId,
) => UR_PROGRESS_BY_PLAYER[player][squareId]

export const getSquareForProgress = (
  player: 'anubis' | 'sphinx',
  progress: number,
) => {
  if (progress <= 0 || progress > UR_PLAYER_PATHS[player].length) return null
  return UR_PLAYER_PATHS[player][progress - 1]
}

export const getTravelSquareIds = (
  player: 'anubis' | 'sphinx',
  from: number,
  to: number,
) => {
  if (to <= 0 || to >= 15) {
    if (from > 0 && from < 15) {
      return UR_PLAYER_PATHS[player].slice(from, UR_PLAYER_PATHS[player].length)
    }
    return []
  }

  if (from <= 0) {
    return [getSquareForProgress(player, to)].filter((value): value is UrSquareId => value !== null)
  }

  return UR_PLAYER_PATHS[player].slice(from, to)
}

export const getOccupancyKey = (player: PlayerID, progress: number) =>
  progress >= 5 && progress <= 12 ? `shared-${progress}` : `${player}-${progress}`
