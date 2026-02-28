import type {
  HoundsAndJackalsConfig,
  HoundsAndJackalsSpecialHole,
  PlayerID,
} from '../../engine/types'

export interface BoardPoint {
  x: number
  y: number
}

export interface HoundsAndJackalsVisualHole extends BoardPoint {
  marker?: string
  position: number
}

const LEFT_LANE_BASE: BoardPoint[] = [
  { x: 39, y: 85 },
  { x: 33, y: 80 },
  { x: 29, y: 75 },
  { x: 26, y: 69 },
  { x: 24, y: 63 },
  { x: 22, y: 57 },
  { x: 21, y: 51 },
  { x: 20.5, y: 45 },
  { x: 21, y: 39 },
  { x: 22, y: 33 },
  { x: 24, y: 28 },
  { x: 27, y: 23 },
  { x: 31, y: 19 },
  { x: 35, y: 16 },
  { x: 40, y: 13.5 },
  { x: 44, y: 12.5 },
  { x: 47, y: 12 },
  { x: 44, y: 18 },
  { x: 41.5, y: 24 },
  { x: 40, y: 31 },
  { x: 39, y: 38 },
  { x: 38.5, y: 45 },
  { x: 38.5, y: 52 },
  { x: 39, y: 59 },
  { x: 40, y: 66 },
  { x: 41.5, y: 73 },
  { x: 43.5, y: 79 },
  { x: 46, y: 84 },
  { x: 48, y: 88.5 },
]

const SPECIAL_HOLES: Record<number, HoundsAndJackalsSpecialHole> = {
  6: { type: 'good', target: 15, label: 'Nefer Basin', marker: 'nfr' },
  8: { type: 'bad', target: 4, label: 'Broken Reed', marker: 'ret' },
  13: { type: 'good', target: 20, label: 'Palm Shade', marker: 'nfr' },
  18: { type: 'bad', target: 11, label: 'Loose Sand', marker: 'ret' },
  24: { type: 'bad', target: 16, label: 'River Bend', marker: 'ret' },
  26: { type: 'good', target: 29, label: 'Shen Favor', marker: 'nfr' },
}

export const HOUNDS_AND_JACKALS_CONFIG: HoundsAndJackalsConfig = {
  trackLength: 29,
  goalPosition: 30,
  piecesPerPlayer: 5,
  exactFinish: true,
  reserveEntry: 'any_roll_to_first_hole',
  throwMode: 'four_sticks_1_to_5',
  extraTurnValues: [],
  specialHoles: SPECIAL_HOLES,
}

function mirrorPoint(point: BoardPoint): BoardPoint {
  return { x: 100 - point.x, y: point.y }
}

function buildLane(player: 'anubis' | 'sphinx') {
  const points = player === 'anubis' ? LEFT_LANE_BASE : LEFT_LANE_BASE.map(mirrorPoint)

  return points.map((point, index) => ({
    position: index + 1,
    x: point.x,
    y: point.y,
    marker: SPECIAL_HOLES[index + 1]?.marker,
  }))
}

export const HOUNDS_AND_JACKALS_LANES: Record<'anubis' | 'sphinx', HoundsAndJackalsVisualHole[]> = {
  anubis: buildLane('anubis'),
  sphinx: buildLane('sphinx'),
}

export const HOUNDS_AND_JACKALS_GOAL: BoardPoint = { x: 50, y: 8 }
export const HOUNDS_AND_JACKALS_RESERVES: Record<'anubis' | 'sphinx', BoardPoint> = {
  anubis: { x: 30, y: 96 },
  sphinx: { x: 70, y: 96 },
}

export const HOUNDS_AND_JACKALS_TRACK_PLAYERS: PlayerID[] = ['anubis', 'sphinx']

export function getLaneHole(
  player: 'anubis' | 'sphinx',
  position: number,
) {
  return HOUNDS_AND_JACKALS_LANES[player].find((hole) => hole.position === position)
}
