import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../../../engine/store'
import {
  boardStoreSelector,
  useShallowSelector,
} from '../../../engine/selectors'
import { cn } from '../../../utils/cn'
import { getPlayerAppearance } from '../../../utils/playerAppearance'
import { getPieceLabel, getPlayerLabel } from '../../../utils/gameLabels'
import { isLocalTurnState } from '../../../engine/storeHelpers'
import {
  HOUNDS_AND_JACKALS_CONFIG,
  HOUNDS_AND_JACKALS_GOAL,
  HOUNDS_AND_JACKALS_LANES,
  HOUNDS_AND_JACKALS_RESERVES,
} from '../boardMetadata'

const RESERVE_OFFSETS = [
  { x: -5, y: 0 },
  { x: -2.5, y: -4 },
  { x: 0, y: 1 },
  { x: 2.5, y: -4 },
  { x: 5, y: 0 },
]

function buildLinkPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  direction: 'left' | 'right',
) {
  const controlX = direction === 'left' ? start.x - 9 : start.x + 9
  const controlY = (start.y + end.y) / 2
  return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`
}

export function Board() {
  const { t } = useTranslation()
  const {
    board,
    currentPlayer,
    currentThrow,
    hoveredPieceId,
    isConnectingToRoom,
    isOnline,
    isWaitingForOpponent,
    lastMove,
    legalMoves,
    localPlayer,
    movePiece,
    offlineHumanPlayer,
    offlineMode,
    setHoveredPieceId,
  } = useSenetStore(useShallowSelector(boardStoreSelector))
  const config = useSenetStore(
    (state) => state.houndsAndJackalsConfig ?? HOUNDS_AND_JACKALS_CONFIG,
  )

  const isLocalTurn = isLocalTurnState({
    currentPlayer,
    isConnectingToRoom,
    isOnline,
    isWaitingForOpponent,
    localPlayer,
    offlineHumanPlayer,
    offlineMode,
  })

  const legalMovesByPieceId = useMemo(
    () => new Map(legalMoves.map((move) => [move.pieceId, move.targetSquare])),
    [legalMoves],
  )
  const legalMovesByTarget = useMemo(
    () =>
      legalMoves.reduce<Record<number, string[]>>((accumulator, move) => {
        accumulator[move.targetSquare] = [
          ...(accumulator[move.targetSquare] ?? []),
          move.pieceId,
        ]
        return accumulator
      }, {}),
    [legalMoves],
  )

  const pickMoveForTarget = (targetSquare: number) => {
    const candidateIds = legalMovesByTarget[targetSquare] ?? []
    if (candidateIds.length === 0) return null
    if (hoveredPieceId && candidateIds.includes(hoveredPieceId)) {
      return hoveredPieceId
    }
    return candidateIds[0]
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto border-[10px] sm:border-[12px] md:border-[16px] border-ui-board-frame rounded-2xl bg-ui-board-frame shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(0,0,0,0.8)] p-[2px] sm:p-[3px] md:p-[4px] overflow-hidden [filter:url(#jitter)]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-ui-board-overlay to-ui-board-overlay-edge mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-[1rem]" />

      <div className="relative bg-ui-board-ivory rounded-[1rem] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-auto block"
          role="img"
          aria-label={t('games.hounds-and-jackals.board.aria_label')}
        >
          <defs>
            <linearGradient id="axe-head" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,248,220,0.98)" />
              <stop offset="55%" stopColor="rgba(214,189,132,0.95)" />
              <stop offset="100%" stopColor="rgba(124,87,38,0.95)" />
            </linearGradient>
            <linearGradient id="link-good" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(212,175,55,0.95)" />
              <stop offset="100%" stopColor="rgba(141,110,42,0.85)" />
            </linearGradient>
            <linearGradient id="link-bad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(109,154,178,0.9)" />
              <stop offset="100%" stopColor="rgba(64,98,121,0.85)" />
            </linearGradient>
          </defs>

          <path
            d="M22 96 L22 58 Q16 46 16 33 Q16 19 27 12 Q37 5 50 3 Q63 5 73 12 Q84 19 84 33 Q84 46 78 58 L78 96 Z"
            fill="url(#axe-head)"
            stroke="rgba(80,51,16,0.55)"
            strokeWidth="1.2"
          />
          <path
            d="M28 96 L28 62 Q22 47 22 34 Q22 22 30 16 Q39 9 50 7 Q61 9 70 16 Q78 22 78 34 Q78 47 72 62 L72 96 Z"
            fill="rgba(255,251,237,0.38)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.4"
          />

          <g opacity="0.18" stroke="rgba(97,63,16,0.55)" strokeWidth="0.35">
            <path d="M50 15 L50 55" />
            <path d="M47.5 18 Q50 10 52.5 18" />
            <path d="M44 30 Q50 26 56 30" />
            <path d="M42 37 Q50 33 58 37" />
            <circle cx="50" cy="61" r="5.8" fill="none" />
            <circle cx="50" cy="61" r="3.2" fill="none" />
          </g>

          {(['anubis', 'sphinx'] as const).flatMap((player) =>
            Object.entries(config.specialHoles).map(([source, specialHole]) => {
              const start = HOUNDS_AND_JACKALS_LANES[player].find(
                (hole) => hole.position === Number(source),
              )
              const end = HOUNDS_AND_JACKALS_LANES[player].find(
                (hole) => hole.position === specialHole.target,
              )
              if (!start || !end) return null

              return (
                <path
                  key={`${player}-${source}-${specialHole.target}`}
                  d={buildLinkPath(start, end, player === 'anubis' ? 'left' : 'right')}
                  fill="none"
                  stroke={specialHole.type === 'good' ? 'url(#link-good)' : 'url(#link-bad)'}
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeDasharray={specialHole.type === 'good' ? undefined : '1.25 1.35'}
                  opacity="0.8"
                />
              )
            }),
          )}

          {(['anubis', 'sphinx'] as const).map((player) => {
            const reserve = HOUNDS_AND_JACKALS_RESERVES[player]
            const labelKey =
              player === 'anubis'
                ? 'games.hounds-and-jackals.board.reserve_hound'
                : 'games.hounds-and-jackals.board.reserve_jackal'

            return (
              <g key={`${player}-reserve`}>
                <circle
                  cx={reserve.x}
                  cy={reserve.y}
                  r="8"
                  fill="rgba(58,34,12,0.22)"
                  stroke="rgba(109,76,31,0.45)"
                  strokeWidth="0.55"
                />
                <text
                  x={reserve.x}
                  y={reserve.y + 11}
                  textAnchor="middle"
                  fontSize="2.3"
                  letterSpacing="0.6"
                  fill="rgba(74,48,15,0.88)"
                >
                  {t(labelKey)}
                </text>
              </g>
            )
          })}

          <g>
            <circle
              cx={HOUNDS_AND_JACKALS_GOAL.x}
              cy={HOUNDS_AND_JACKALS_GOAL.y}
              r="6"
              fill="rgba(247,220,111,0.95)"
              stroke="rgba(122,84,20,0.75)"
              strokeWidth="0.75"
            />
            <circle
              cx={HOUNDS_AND_JACKALS_GOAL.x}
              cy={HOUNDS_AND_JACKALS_GOAL.y}
              r="3.2"
              fill="none"
              stroke="rgba(122,84,20,0.55)"
              strokeWidth="0.5"
            />
            <text
              x={50}
              y={18.6}
              textAnchor="middle"
              fontSize="2.4"
              letterSpacing="0.8"
              fill="rgba(85,53,15,0.92)"
            >
              {t('games.hounds-and-jackals.board.goal_title')}
            </text>
          </g>
        </svg>

        <div className="absolute inset-0">
          {(['anubis', 'sphinx'] as const).flatMap((player) =>
            HOUNDS_AND_JACKALS_LANES[player].map((hole) => {
              const targetPieceId =
                isLocalTurn && currentPlayer === player
                  ? pickMoveForTarget(hole.position)
                  : null
              const isLegalMove = Boolean(targetPieceId)
              const isHoveredTarget =
                hoveredPieceId !== null &&
                (legalMovesByTarget[hole.position] ?? []).includes(hoveredPieceId)
              const specialHole = config.specialHoles[hole.position]

              return (
                <button
                  key={`${player}-hole-${hole.position}`}
                  type="button"
                  onClick={() => {
                    if (!targetPieceId) return
                    setHoveredPieceId(null)
                    movePiece(targetPieceId)
                  }}
                  onMouseEnter={() => {
                    if (!targetPieceId) return
                    setHoveredPieceId(targetPieceId)
                  }}
                  onMouseLeave={() => {
                    if (!targetPieceId) return
                    setHoveredPieceId(null)
                  }}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200',
                    isLegalMove
                      ? 'cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.35)]'
                      : 'cursor-default pointer-events-none',
                    specialHole?.type === 'good'
                      ? 'bg-amber-50/80 border-amber-700/40'
                      : specialHole?.type === 'bad'
                        ? 'bg-sky-100/70 border-sky-900/25'
                        : 'bg-ebony/14 border-ebony/20',
                    isLegalMove && 'ring-2 ring-royal-gold/30',
                    isHoveredTarget && 'scale-110 ring-4 ring-royal-gold/30',
                    lastMove?.to === hole.position && 'ring-4 ring-royal-gold/35',
                  )}
                  style={{
                    left: `${hole.x}%`,
                    top: `${hole.y}%`,
                    width: '7.2%',
                    height: '7.2%',
                  }}
                  aria-label={t('games.hounds-and-jackals.board.hole_label', {
                    player: getPlayerLabel(t, 'hounds-and-jackals', player),
                    number: hole.position,
                  })}
                >
                  {hole.marker ? (
                    <span
                      className={cn(
                        'text-[0.5rem] sm:text-[0.62rem] font-bold tracking-[0.18em] uppercase',
                        specialHole?.type === 'good'
                          ? 'text-amber-900/90'
                          : 'text-sky-950/85',
                      )}
                    >
                      {hole.marker}
                    </span>
                  ) : null}
                </button>
              )
            }),
          )}

          {board
            .filter((piece) => piece.position < config.goalPosition)
            .map((piece) => {
              const appearance = getPlayerAppearance(piece.player)
              const canMove =
                isLocalTurn &&
                Boolean(currentThrow) &&
                legalMovesByPieceId.has(piece.id)
              const isHovered = hoveredPieceId === piece.id
              const lanePlayer = piece.player as 'anubis' | 'sphinx'
              const reserveIndex = board
                .filter(
                  (candidate) =>
                    candidate.player === piece.player &&
                    candidate.position === 0 &&
                    candidate.id <= piece.id,
                )
                .length - 1
              const reserveBase = HOUNDS_AND_JACKALS_RESERVES[lanePlayer]
              const reserveOffset = RESERVE_OFFSETS[Math.max(reserveIndex, 0)] ?? { x: 0, y: 0 }
              const laneHole =
                piece.position === 0
                  ? null
                  : HOUNDS_AND_JACKALS_LANES[lanePlayer].find(
                    (hole) => hole.position === piece.position,
                  )
              const x = laneHole ? laneHole.x : reserveBase.x + reserveOffset.x
              const y = laneHole ? laneHole.y : reserveBase.y + reserveOffset.y
              const ordinal = piece.id.split('-').at(-1)

              return (
                <motion.button
                  key={piece.id}
                  type="button"
                  layoutId={`piece-${piece.id}`}
                  initial={false}
                  animate={{ left: `${x}%`, top: `${y}%` }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!canMove) return
                    setHoveredPieceId(null)
                    movePiece(piece.id)
                  }}
                  onMouseEnter={() => {
                    if (!canMove) return
                    setHoveredPieceId(piece.id)
                  }}
                  onMouseLeave={() => {
                    if (!canMove) return
                    setHoveredPieceId(null)
                  }}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 h-[7.8%] w-[7.8%] rounded-full border-[2px] transition-all duration-300 z-20',
                    canMove ? 'cursor-pointer' : 'cursor-default',
                    appearance.tokenClassName,
                    canMove && 'piece-token--movable',
                    isHovered && 'scale-110 -translate-y-[55%]',
                    lastMove?.pieceId === piece.id && 'ring-4 ring-royal-gold/35',
                  )}
                  aria-label={`${getPlayerLabel(t, 'hounds-and-jackals', piece.player)} ${getPieceLabel(t, 'hounds-and-jackals', piece.type)} ${ordinal}`}
                >
                  <div className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_40%),linear-gradient(145deg,rgba(255,244,214,0.95),rgba(143,103,41,0.98))] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(61,35,7,0.5)]" />
                  <div className="absolute inset-0 flex items-center justify-center text-[0.62rem] sm:text-xs font-bold tracking-[0.18em] text-ebony">
                    {piece.player === 'anubis' ? 'H' : 'J'}
                  </div>
                </motion.button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
