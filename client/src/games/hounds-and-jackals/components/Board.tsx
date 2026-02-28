import { useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../../../engine/store'
import {
  boardStoreSelector,
  useShallowSelector,
} from '../../../engine/selectors'
import { cn } from '../../../utils/cn'
import { getPieceLabel, getPlayerLabel } from '../../../utils/gameLabels'
import { isLocalTurnState } from '../../../engine/storeHelpers'
import {
  HOUNDS_AND_JACKALS_CONFIG,
  HOUNDS_AND_JACKALS_GOAL,
  HOUNDS_AND_JACKALS_LANES,
  HOUNDS_AND_JACKALS_RESERVES,
  type HoundsAndJackalsVisualHole,
} from '../boardMetadata'

const BOARD_OUTLINE =
  'M21.4 96.2 L22.3 58.4 Q15.7 45.8 16.3 32.9 Q16.9 18.6 27.4 11.6 Q37.5 4.7 49.8 3.2 Q63.4 4.9 73.1 12.4 Q83.4 19.7 83.7 33.6 Q83.9 46 77.6 58.2 L78.6 95.4 Z'
const BOARD_INTERIOR =
  'M28.5 95.1 L27.8 61.8 Q22.1 47.3 22.6 34.1 Q23 22.1 30.3 15.9 Q39.4 8.8 49.9 7.1 Q61.4 8.8 69.8 16 Q77.4 22.4 77.3 34.2 Q77.2 47.2 71.7 61.9 L72.5 95 Z'

const RESERVE_OFFSETS = [
  { x: -4.8, y: 0.2 },
  { x: -2.2, y: -3.6 },
  { x: 0.6, y: -0.8 },
  { x: 3.4, y: -3.2 },
  { x: 1.8, y: 2.4 },
]

function buildLinkPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  direction: 'left' | 'right',
) {
  const inwardX =
    direction === 'left'
      ? Math.max(start.x, end.x) + 3.4
      : Math.min(start.x, end.x) - 3.4
  const upperY = Math.min(start.y, end.y) + 0.8
  const lowerY = Math.max(start.y, end.y) - 0.8
  return `M ${start.x} ${start.y} C ${inwardX} ${upperY} ${inwardX} ${lowerY} ${end.x} ${end.y}`
}

function HoleGlyph({ kind }: { kind: 'favor' | 'setback' }) {
  if (kind === 'favor') {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
        <path
          d="M7 18h10M8.5 16.5V8.4M15.5 16.5V8.4M8.5 8.4l3.5-2.2 3.5 2.2M6.5 11.5h11"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        d="M9 5.5v12.8M14.8 7.2l-5.8 5.4M14.8 11.5l-5.8 5.4M7 18.3h10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function PegMedallion({ player }: { player: 'anubis' | 'sphinx' }) {
  if (player === 'anubis') {
    return (
      <svg viewBox="0 0 28 28" className="h-full w-full" aria-hidden="true">
        <path
          d="M8.2 18.8c.4-4 2-7.1 5.6-9.5 1.7-1.1 3.2-2.6 3.8-4.3.7.8 1.1 1.8 1.1 3 0 2-1 3.8-2.6 5.2 1.6.4 2.8 1.4 3.4 3 .5 1.3.6 2.4.4 3.7-2.6-.9-5.2-1.3-7.8-1.3-1.4 0-2.7.1-3.9.2z"
          fill="currentColor"
        />
        <path
          d="M12.1 8.4 9.8 6m6-.6 1.7-2.4m-3 9.2c-.1 1.1.2 2.2.8 3.1"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 28 28" className="h-full w-full" aria-hidden="true">
      <path
        d="M8.5 19.4c.8-2.3 2.1-4.3 4-5.8 1.5-1.2 2.6-2.6 3.3-4.6 1 1.2 1.5 2.6 1.4 4.2 1.3.4 2.3 1.3 2.8 2.7.4 1.3.5 2.4.2 3.8-3.2-.8-5.5-1.2-7.1-1.2-1.7 0-3.2.3-4.6.9z"
        fill="currentColor"
      />
      <path
        d="M18.4 9.3 20.9 6m-10 7.6c1.2-.1 2.2-.6 3-1.4m2.5 5.5c-.1-.9-.4-1.8-.9-2.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function getHoleAriaLabel(
  t: ReturnType<typeof useTranslation>['t'],
  hole: HoundsAndJackalsVisualHole,
  player: 'anubis' | 'sphinx',
  target: number | undefined,
) {
  const playerLabel = getPlayerLabel(t, 'hounds-and-jackals', player)
  if (hole.symbol === 'favor' && typeof target === 'number') {
    return t('games.hounds-and-jackals.board.hole_label_favor', {
      number: hole.position,
      player: playerLabel,
      target,
    })
  }

  if (hole.symbol === 'setback' && typeof target === 'number') {
    return t('games.hounds-and-jackals.board.hole_label_setback', {
      number: hole.position,
      player: playerLabel,
      target,
    })
  }

  return t('games.hounds-and-jackals.board.hole_label', {
    number: hole.position,
    player: playerLabel,
  })
}

export function Board() {
  const { t } = useTranslation()
  const svgId = useId().replace(/:/g, '')
  const [hoveredHoleKey, setHoveredHoleKey] = useState<string | null>(null)
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

  const { connectedGrooveKeys, connectedHoleKeys } = useMemo(() => {
    const grooveKeys = new Set<string>()
    const holeKeys = new Set<string>()

    if (!hoveredHoleKey) {
      return { connectedGrooveKeys: grooveKeys, connectedHoleKeys: holeKeys }
    }

    ;(['anubis', 'sphinx'] as const).forEach((player) => {
      Object.entries(config.specialHoles).forEach(([source, specialHole]) => {
        const sourceKey = `${player}-${source}`
        const targetKey = `${player}-${specialHole.target}`
        const grooveKey = `${player}-${source}-${specialHole.target}`

        if (hoveredHoleKey === sourceKey || hoveredHoleKey === targetKey) {
          holeKeys.add(sourceKey)
          holeKeys.add(targetKey)
          grooveKeys.add(grooveKey)
        }
      })
    })

    return { connectedGrooveKeys: grooveKeys, connectedHoleKeys: holeKeys }
  }, [config.specialHoles, hoveredHoleKey])

  const boardWearFilterId = `${svgId}-board-wear`
  const grooveWearFilterId = `${svgId}-groove-wear`
  const boardShadeId = `${svgId}-board-shade`
  const boardEdgeId = `${svgId}-board-edge`

  return (
    <div className="hounds-jackals-scene relative w-full max-w-6xl mx-auto overflow-hidden rounded-[2.6rem] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="hounds-jackals-scene__table absolute inset-0" />

      <div className="relative mx-auto max-w-5xl [transform:perspective(1800px)_rotateX(0.8deg)]">
        <div className="hounds-jackals-board__frame absolute inset-0 rounded-[2rem]" />

        <div className="hounds-jackals-board relative overflow-hidden rounded-[1.7rem] shadow-[0_22px_55px_rgba(0,0,0,0.58)]">
          <div className="hounds-jackals-board__surface absolute inset-0 pointer-events-none" />

          <svg
            viewBox="0 0 100 100"
            className="relative block h-auto w-full"
            role="img"
            aria-label={t('games.hounds-and-jackals.board.aria_label')}
          >
            <defs>
            <filter id={boardWearFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.02 0.028"
                numOctaves="3"
                seed="19"
                result="artifactNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="artifactNoise"
                scale="0.9"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter id={grooveWearFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.042"
                numOctaves="3"
                seed="7"
                result="grooveNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="grooveNoise"
                scale="0.52"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <linearGradient id={boardShadeId} x1="16%" y1="12%" x2="84%" y2="92%">
              <stop offset="0%" stopColor="var(--hj-board-surface-light)" />
              <stop offset="52%" stopColor="var(--hj-board-surface-mid)" />
              <stop offset="100%" stopColor="var(--hj-board-surface-dark)" />
            </linearGradient>
            <linearGradient id={boardEdgeId} x1="18%" y1="14%" x2="82%" y2="90%">
              <stop offset="0%" stopColor="var(--hj-board-edge-light)" />
              <stop offset="100%" stopColor="var(--hj-board-edge-shadow)" />
            </linearGradient>
            </defs>

          <path
            d={BOARD_OUTLINE}
            fill={`url(#${boardEdgeId})`}
            className="hounds-jackals-board__outline"
            filter={`url(#${boardWearFilterId})`}
          />
          <path
            d={BOARD_INTERIOR}
            fill={`url(#${boardShadeId})`}
            className="hounds-jackals-board__body"
          />

          {(['anubis', 'sphinx'] as const).flatMap((player) =>
            Object.entries(config.specialHoles).map(([source, specialHole]) => {
              const start = HOUNDS_AND_JACKALS_LANES[player].find(
                (hole) => hole.position === Number(source),
              )
              const end = HOUNDS_AND_JACKALS_LANES[player].find(
                (hole) => hole.position === specialHole.target,
              )
              if (!start || !end) return null

              const groovePath = buildLinkPath(
                start,
                end,
                player === 'anubis' ? 'left' : 'right',
              )

              return (
                <g
                  key={`${player}-${source}-${specialHole.target}`}
                  className={cn(
                    'hounds-jackals-board__groove',
                    connectedGrooveKeys.has(`${player}-${source}-${specialHole.target}`) &&
                      'hounds-jackals-board__groove--hovered',
                    specialHole.type === 'good'
                      ? 'hounds-jackals-board__groove--favor'
                      : 'hounds-jackals-board__groove--setback',
                  )}
                  >
                  <path
                    d={groovePath}
                    className="hounds-jackals-board__groove-base"
                    filter={`url(#${grooveWearFilterId})`}
                  />
                  <path d={groovePath} className="hounds-jackals-board__groove-abrasion" />
                  <path d={groovePath} className="hounds-jackals-board__groove-highlight" />
                  <path d={groovePath} className="hounds-jackals-board__groove-pigment" />
                </g>
              )
            }),
          )}

          {(['anubis', 'sphinx'] as const).map((player) => {
            const reserve = HOUNDS_AND_JACKALS_RESERVES[player]
            const reserveLabel = t('games.hounds-and-jackals.board.reserve_pit_label', {
              player:
                player === 'anubis'
                  ? t('games.hounds-and-jackals.board.reserve_hound')
                  : t('games.hounds-and-jackals.board.reserve_jackal'),
            })

            return (
              <g key={`${player}-reserve`}>
                <title>{reserveLabel}</title>
                <circle
                  cx={reserve.x}
                  cy={reserve.y}
                  r="8.3"
                  className="hounds-jackals-board__reserve-shadow"
                />
                <circle
                  cx={reserve.x}
                  cy={reserve.y}
                  r="7.2"
                  className="hounds-jackals-board__reserve-pit"
                />
                <circle
                  cx={reserve.x}
                  cy={reserve.y}
                  r="5.15"
                  className="hounds-jackals-board__reserve-core"
                />
              </g>
            )
          })}

          <g>
            <title>{t('games.hounds-and-jackals.board.goal_hole_label')}</title>
            <circle
              cx={HOUNDS_AND_JACKALS_GOAL.x}
              cy={HOUNDS_AND_JACKALS_GOAL.y}
              r="6.5"
              className="hounds-jackals-board__goal"
            />
            <circle
              cx={HOUNDS_AND_JACKALS_GOAL.x}
              cy={HOUNDS_AND_JACKALS_GOAL.y}
              r="4.15"
              className="hounds-jackals-board__goal-inner"
            />
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
                const holeKey = `${player}-${hole.position}`
                const isConnectionHovered = connectedHoleKeys.has(holeKey)

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
                      setHoveredHoleKey(holeKey)
                      if (targetPieceId) {
                        setHoveredPieceId(targetPieceId)
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredHoleKey(null)
                      if (targetPieceId) {
                        setHoveredPieceId(null)
                      }
                    }}
                    className={cn(
                      'hounds-jackals-hole absolute -translate-x-1/2 -translate-y-1/2',
                      isLegalMove ? 'cursor-pointer hounds-jackals-hole--legal' : 'cursor-default',
                      hole.holeVariant === 'goal-adjacent' && 'hounds-jackals-hole--goal-adjacent',
                      hole.holeVariant === 'special' && 'hounds-jackals-hole--special',
                      Math.abs(hole.x - 50) > 15 && 'hounds-jackals-hole--peripheral',
                      hole.symbol === 'favor' && 'hounds-jackals-hole--favor',
                      hole.symbol === 'setback' && 'hounds-jackals-hole--setback',
                      hole.wearLevel === 'medium' && 'hounds-jackals-hole--wear-medium',
                      hole.wearLevel === 'heavy' && 'hounds-jackals-hole--wear-heavy',
                      isHoveredTarget && 'hounds-jackals-hole--hovered',
                      isConnectionHovered && 'hounds-jackals-hole--connection-hovered',
                      lastMove?.to === hole.position && 'hounds-jackals-hole--last-move',
                    )}
                    style={{
                      height: '7.2%',
                      left: `${hole.x}%`,
                      top: `${hole.y}%`,
                      width: '7.2%',
                    }}
                    aria-label={getHoleAriaLabel(t, hole, player, specialHole?.target)}
                  >
                    <span className="hounds-jackals-hole__dust" aria-hidden="true" />
                    <span className="hounds-jackals-hole__well" aria-hidden="true" />
                    <span className="hounds-jackals-hole__rim" aria-hidden="true" />
                    {hole.symbol ? (
                      <span className="hounds-jackals-hole__glyph" aria-hidden="true">
                        <HoleGlyph kind={hole.symbol} />
                      </span>
                    ) : null}
                  </button>
                )
              }),
            )}

            {board
              .filter((piece) => piece.position < config.goalPosition)
              .map((piece) => {
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
              const reserveOffset =
                RESERVE_OFFSETS[Math.max(reserveIndex, 0)] ?? { x: 0, y: 0 }
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
                      'hounds-jackals-peg absolute -translate-x-1/2 -translate-y-1/2 z-20 h-[13.6%] w-[10.1%]',
                      lanePlayer === 'anubis'
                        ? 'hounds-jackals-peg--hound'
                        : 'hounds-jackals-peg--jackal',
                      piece.position === 0 && 'hounds-jackals-peg--reserve',
                      canMove && 'cursor-pointer hounds-jackals-peg--movable',
                      !canMove && 'cursor-default',
                      isHovered && 'hounds-jackals-peg--hovered',
                      lastMove?.pieceId === piece.id && 'hounds-jackals-peg--last-move',
                    )}
                    aria-label={`${getPlayerLabel(t, 'hounds-and-jackals', piece.player)} ${getPieceLabel(t, 'hounds-and-jackals', piece.type)} ${ordinal}`}
                  >
                    <span className="hounds-jackals-peg__shadow" aria-hidden="true" />
                    <span className="hounds-jackals-peg__stem" aria-hidden="true" />
                    <span className="hounds-jackals-peg__head" aria-hidden="true">
                      <span className="hounds-jackals-peg__medallion">
                        <PegMedallion player={lanePlayer} />
                      </span>
                    </span>
                  </motion.button>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
