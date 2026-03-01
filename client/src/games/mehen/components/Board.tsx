import type { Piece as PieceType } from '../../../engine/types'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../../../engine/store'
import { boardStoreSelector, useShallowSelector } from '../../../engine/selectors'
import { cn } from '../../../utils/cn'
import { formatNumber } from '../../../utils/format'
import { getPlayerAppearance } from '../../../utils/playerAppearance'
import { MaskedSvgIcon } from '../../../components/common/MaskedSvgIcon'
import { Piece } from './Piece'

const CENTER = 400
const BASE_RADIUS = 315
const MIN_RADIUS = 72
const VIEWBOX_SIZE = 800

const getSpiralPosition = (index: number, boardSize: number) => {
  const progress = boardSize <= 1 ? 1 : (index - 1) / (boardSize - 1)
  const turns = 4.75
  const angle = progress * Math.PI * 2 * turns - Math.PI / 2
  const radius = BASE_RADIUS - (BASE_RADIUS - MIN_RADIUS) * progress

  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  }
}

const toPercent = (value: number) => `${(value / VIEWBOX_SIZE) * 100}%`

const buildSpiralPath = (points: Array<{ x: number; y: number }>) =>
  points
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')

const getStackOffset = (index: number, total: number) => {
  if (total <= 1) return { x: 0, y: 0 }

  const radius = total === 2 ? 12 : 16
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

const getHeartOffset = (index: number, total: number) => {
  if (total <= 1) return { x: 0, y: 0 }

  const radius = total <= 3 ? 18 : total <= 5 ? 28 : 34
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

const getNodeVariation = (index: number) => {
  const widthOffset = (((index * 17) % 7) - 3) * 0.8
  const heightOffset = (((index * 11) % 5) - 2) * 0.75
  const rotation = (((index * 13) % 9) - 4) * 0.55
  const opacity = 0.68 + (((index * 19) % 4) * 0.05)
  const numberOpacity = 0.72 + (((index * 7) % 5) - 2) * 0.03
  const bevel = 22 + (((index * 5) % 4) - 1) * 2
  return {
    bevel,
    height: 30 + heightOffset,
    numberOpacity,
    opacity,
    rotation,
    width: 38 + widthOffset,
  }
}

const getTravelSquares = (
  from: number,
  to: number,
  boardSize: number,
  roll?: number,
) => {
  if (from <= 0) return [to]
  if (typeof roll !== 'number' || roll <= 0) {
    if (to >= from) {
      return Array.from({ length: to - from }, (_, index) => from + index + 1)
    }
    return [to]
  }

  const visited: number[] = []
  let cursor = from
  let direction = 1

  for (let step = 0; step < roll; step += 1) {
    cursor += direction
    if (cursor > boardSize) {
      cursor = boardSize - 1
      direction = -1
    }
    visited.push(cursor)
  }

  return visited.length > 0 ? visited : [to]
}

function MehenCenterSigil() {
  return (
    <svg viewBox="0 0 120 120" className="mehen-board__serpent-sigil" aria-hidden="true">
      <defs>
        <filter id="mehen-relief-wear" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="2"
            seed="17"
            result="wearNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wearNoise"
            scale="1.05"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g className="mehen-board__relief mehen-board__relief--shadow" transform="translate(1.75 2)">
        <path
          d="M60 16c10 0 19 5 24 14 2 3 2 7-1 10-4 4-10 6-23 6-13 0-19-2-23-6-3-3-3-7-1-10 5-9 14-14 24-14z"
          className="mehen-board__serpent-head"
          filter="url(#mehen-relief-wear)"
        />
        <path
          d="M60 34c-25 0-45 20-45 44 0 10 3 20 9 28 5 6 11 9 18 9 8 0 16-3 22-9 7-6 10-13 10-21 0-8-4-12-10-12-7 0-11 4-13 11-2 7-8 12-15 12-8 0-14-6-14-15 0-19 15-34 36-34 13 0 24 4 32 12"
          className="mehen-board__serpent-curve"
          filter="url(#mehen-relief-wear)"
        />
        <circle cx="60" cy="60" r="15.5" className="mehen-board__sun-disk" filter="url(#mehen-relief-wear)" />
      </g>
      <g className="mehen-board__relief mehen-board__relief--base">
        <path
          d="M60 16c10 0 19 5 24 14 2 3 2 7-1 10-4 4-10 6-23 6-13 0-19-2-23-6-3-3-3-7-1-10 5-9 14-14 24-14z"
          className="mehen-board__serpent-head"
          filter="url(#mehen-relief-wear)"
        />
        <path
          d="M60 34c-25 0-45 20-45 44 0 10 3 20 9 28 5 6 11 9 18 9 8 0 16-3 22-9 7-6 10-13 10-21 0-8-4-12-10-12-7 0-11 4-13 11-2 7-8 12-15 12-8 0-14-6-14-15 0-19 15-34 36-34 13 0 24 4 32 12"
          className="mehen-board__serpent-curve"
          filter="url(#mehen-relief-wear)"
        />
        <circle cx="60" cy="60" r="15.5" className="mehen-board__sun-disk" filter="url(#mehen-relief-wear)" />
        <path d="M49 30c3 2 7 3 11 3s8-1 11-3" className="mehen-board__serpent-brow" />
        <path d="M44 52c5-4 10-6 16-6 6 0 12 2 17 6" className="mehen-board__serpent-inner-arc" />
      </g>
      <g className="mehen-board__relief mehen-board__relief--highlight" transform="translate(-1.1 -1.2)">
        <path
          d="M60 16c10 0 19 5 24 14 2 3 2 7-1 10-4 4-10 6-23 6-13 0-19-2-23-6-3-3-3-7-1-10 5-9 14-14 24-14z"
          className="mehen-board__serpent-head"
          filter="url(#mehen-relief-wear)"
        />
        <path
          d="M60 34c-25 0-45 20-45 44 0 10 3 20 9 28 5 6 11 9 18 9 8 0 16-3 22-9 7-6 10-13 10-21 0-8-4-12-10-12-7 0-11 4-13 11-2 7-8 12-15 12-8 0-14-6-14-15 0-19 15-34 36-34 13 0 24 4 32 12"
          className="mehen-board__serpent-curve"
          filter="url(#mehen-relief-wear)"
        />
        <circle cx="60" cy="60" r="15.5" className="mehen-board__sun-disk" filter="url(#mehen-relief-wear)" />
      </g>
      <g className="mehen-board__relief mehen-board__relief--marks">
        <path d="M68 24l5 2" className="mehen-board__chisel-mark" />
        <path d="M31 72l4 3" className="mehen-board__chisel-mark" />
        <path d="M79 81l-3 4" className="mehen-board__chisel-mark" />
        <path d="M55 88l6 1" className="mehen-board__chisel-mark" />
      </g>
    </svg>
  )
}

export function Board() {
  const { t } = useTranslation()
  const movePiece = useSenetStore((state) => state.movePiece)
  const safeCells = useSenetStore((state) => state.mehenConfig?.safeCells ?? [10, 20, 30, 40, 50])
  const { board, boardSize, currentPlayer, legalMoves, lastMove } = useSenetStore(
    useShallowSelector(boardStoreSelector),
  )
  const totalSquares = boardSize ?? 60
  const squares = Array.from({ length: totalSquares }, (_, index) => index + 1)
  const squareData = squares.map((num) => {
    const pos = getSpiralPosition(num, totalSquares)
    return {
      isGoal: num === totalSquares,
      isLegal: legalMoves.some((move: { targetSquare: number }) => move.targetSquare === num),
      isSafe: safeCells.includes(num),
      metrics: getNodeVariation(num),
      num,
      pos,
    }
  })
  const spiralPath = buildSpiralPath(squareData.map(({ pos }) => pos))
  const offBoardPieces = board.filter((piece) => piece.position === 0)
  const reservePlayers = [...new Set(offBoardPieces.map((piece) => piece.player))]

  const positionedPieces = board
    .filter((piece) => piece.position > 0 && piece.position < totalSquares)
    .map((piece) => ({ piece, peers: board.filter((candidate) => candidate.position === piece.position) }))
  const heartPieces = board
    .filter((piece) => piece.position === totalSquares)
    .map((piece) => ({ piece, peers: board.filter((candidate) => candidate.position === totalSquares) }))

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <div className="mehen-board relative w-full aspect-square rounded-full overflow-hidden">
        <div className="mehen-board__patina absolute inset-0 pointer-events-none" />
        <div className="mehen-board__grain absolute inset-0 pointer-events-none" />
        <div className="mehen-board__micrograin absolute inset-0 pointer-events-none" />
        <div className="mehen-board__vignette absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-95">
          <svg viewBox="0 0 800 800" className="h-full w-full fill-none">
            <defs>
              <filter id="mehen-rim-wear" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.006 0.008"
                  numOctaves="2"
                  seed="11"
                  result="rimNoise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="rimNoise"
                  scale="3.2"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
              <filter id="mehen-track-wear" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.014"
                  numOctaves="2"
                  seed="7"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="2.2"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
            <circle
              cx="400"
              cy="400"
              r="377"
              stroke="var(--mehen-rim-shadow)"
              strokeWidth="18"
              filter="url(#mehen-rim-wear)"
            />
            <circle
              cx="396"
              cy="396"
              r="372"
              stroke="var(--mehen-rim-highlight)"
              strokeWidth="8"
              filter="url(#mehen-rim-wear)"
            />
            <circle
              cx="401"
              cy="399"
              r="368"
              stroke="var(--mehen-rim-patina)"
              strokeWidth="5"
              strokeDasharray="30 48 18 55 36 60"
              filter="url(#mehen-rim-wear)"
            />
            <circle
              cx="398"
              cy="401"
              r="374"
              stroke="var(--mehen-rim-glint)"
              strokeWidth="3"
              strokeDasharray="65 75 28 52"
              filter="url(#mehen-rim-wear)"
            />
            <path
              d={spiralPath}
              stroke="var(--mehen-track-shadow)"
              strokeWidth="64"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#mehen-track-wear)"
              transform="translate(3.4 4.8)"
            />
            <path
              d={spiralPath}
              stroke="var(--mehen-track-highlight)"
              strokeWidth="58"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#mehen-track-wear)"
              transform="translate(-2.6 -3.2)"
            />
            <path
              d={spiralPath}
              stroke="var(--mehen-track-mid)"
              strokeWidth="54"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#mehen-track-wear)"
            />
            <path
              d={spiralPath}
              stroke="var(--mehen-track-wear-shadow)"
              strokeWidth="51"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="180 38 124 56 220 72"
              filter="url(#mehen-track-wear)"
            />
            <path
              d={spiralPath}
              stroke="var(--mehen-track-ridge)"
              strokeWidth="46"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#mehen-track-wear)"
            />
            <path
              d={spiralPath}
              stroke="var(--mehen-track-glint)"
              strokeWidth="41"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="205 65 140 58 88 42"
              filter="url(#mehen-track-wear)"
              transform="translate(-1.8 -2.2)"
            />
            <circle
              cx="400"
              cy="400"
              r="95"
              stroke="var(--mehen-center-ring-shadow)"
              strokeWidth="10"
              filter="url(#mehen-track-wear)"
            />
            <circle
              cx="396"
              cy="396"
              r="90"
              stroke="var(--mehen-center-ring-highlight)"
              strokeWidth="4"
              filter="url(#mehen-track-wear)"
            />
          </svg>
        </div>

        <div className="relative w-full h-full">
          {squareData.map(({ num, pos, isLegal, isGoal, isSafe, metrics }) => {
            const nodeWidth = isGoal ? metrics.width + 4.5 : metrics.width
            const nodeHeight = isGoal ? metrics.height + 4 : metrics.height

            return (
              <div
                key={`sq-${num}`}
                className={cn(
                  'mehen-node absolute flex items-center justify-center transition-all',
                  isGoal && 'mehen-node--goal',
                  isSafe && 'mehen-node--safe',
                  isLegal && 'mehen-node--legal',
                )}
                style={{
                  height: nodeHeight,
                  left: toPercent(pos.x),
                  opacity: metrics.opacity,
                  top: toPercent(pos.y),
                  transform: `translate(-50%, -50%) rotate(${metrics.rotation}deg)`,
                  ['--mehen-node-bevel' as string]: `${metrics.bevel}%`,
                  ['--mehen-number-opacity' as string]: metrics.numberOpacity,
                  width: nodeWidth,
                }}
              >
                {isSafe ? <span className="mehen-node__safe-mark" aria-hidden="true" /> : null}
                <span className="mehen-node__number">
                  {formatNumber(num)}
                </span>
              </div>
            )
          })}

          {positionedPieces.map(({ piece, peers }) => {
            const pos = getSpiralPosition(piece.position, totalSquares)
            const stackIndex = peers.findIndex((candidate) => candidate.id === piece.id)
            const offset = getStackOffset(stackIndex, peers.length)
            const movementSquares =
              lastMove?.pieceId === piece.id
                ? getTravelSquares(lastMove.from, lastMove.to, totalSquares, lastMove.roll)
                : null
            const pathX = movementSquares?.map((square) => {
              const point = getSpiralPosition(square, totalSquares)
              return `calc(${toPercent(point.x)} + ${offset.x}px)`
            })
            const pathY = movementSquares?.map((square) => {
              const point = getSpiralPosition(square, totalSquares)
              return `calc(${toPercent(point.y)} + ${offset.y}px)`
            })

            return (
              <Piece
                key={piece.id}
                piece={piece as PieceType}
                pathX={pathX}
                pathY={pathY}
                x={`calc(${toPercent(pos.x)} + ${offset.x}px)`}
                y={`calc(${toPercent(pos.y)} + ${offset.y}px)`}
                width={piece.type === 'lion' ? 44 : 36}
                height={piece.type === 'lion' ? 44 : 36}
                zone="spiral"
              />
            )
          })}

          {heartPieces.map(({ piece, peers }) => {
            const stackIndex = peers.findIndex((candidate) => candidate.id === piece.id)
            const offset = getHeartOffset(stackIndex, peers.length)
            const heartX = `calc(${toPercent(CENTER)} + ${offset.x}px)`
            const heartY = `calc(${toPercent(CENTER)} + ${offset.y}px)`
            const movementSquares =
              lastMove?.pieceId === piece.id
                ? getTravelSquares(lastMove.from, lastMove.to, totalSquares, lastMove.roll)
                : null
            const pathX = movementSquares
              ? [
                ...movementSquares.map((square) => toPercent(getSpiralPosition(square, totalSquares).x)),
                heartX,
              ]
              : undefined
            const pathY = movementSquares
              ? [
                ...movementSquares.map((square) => toPercent(getSpiralPosition(square, totalSquares).y)),
                heartY,
              ]
              : undefined

            return (
              <Piece
                key={piece.id}
                piece={piece as PieceType}
                pathX={pathX}
                pathY={pathY}
                x={heartX}
                y={heartY}
                width={piece.type === 'lion' ? 44 : 36}
                height={piece.type === 'lion' ? 44 : 36}
                zone="heart"
              />
            )
          })}

          <div className="mehen-board__center absolute inset-[40.25%] flex items-center justify-center text-center">
            <div
              className="mehen-board__center-core rounded-[46%] px-4 py-3 backdrop-blur-[1px]"
              aria-label={`${t('games.mehen.board.center_title')} - ${t('games.mehen.board.center_subtitle')}`}
            >
              <MehenCenterSigil />
              <div className="sr-only">
                {t('games.mehen.board.center_title')} - {t('games.mehen.board.center_subtitle')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-royal-gold/20 bg-ui-panel-strong-bg/90 p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-royal-gold/10 pb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-royal-gold/80">
              {t('games.mehen.board.reserve_title')}
            </div>
            <div className="mt-1 text-sm text-sand/75">
              {t('games.mehen.board.reserve_subtitle')}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
	          {reservePlayers.map((player) => {
            const appearance = getPlayerAppearance(player, 'mehen')
            const playerPieces = offBoardPieces.filter((piece) => piece.player === player)

            return (
              <div
                key={player}
                className="rounded-xl border border-royal-gold/10 bg-black/10 p-3"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full', appearance.accentClassName)} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-sand/85">
                    {t(`hud.players.${player}`)}
                  </span>
                </div>

	                <div className="flex flex-wrap gap-2">
	                  {playerPieces.map((piece) => {
                      const isClickable =
                        piece.player === currentPlayer &&
                        legalMoves.some((move) => move.pieceId === piece.id)

                      return (
		                    <button
		                      key={piece.id}
		                      type="button"
		                      disabled={!isClickable}
		                      onClick={() => {
                          if (!isClickable) return
                          movePiece(piece.id)
                        }}
                        aria-label={`${t(`hud.players.${piece.player}`)} ${piece.type === 'lion' ? t('games.mehen.board.lion') : t('games.mehen.board.ball')}`}
		                      className={cn(
		                        'relative flex h-12 w-12 items-center justify-center transition-transform',
                          isClickable
                            ? 'cursor-pointer hover:scale-[1.03]'
                            : 'cursor-default opacity-55 saturate-[0.82]',
		                      )}
		                      title={piece.type === 'lion' ? t('games.mehen.board.lion') : t('games.mehen.board.ball')}
		                    >
	                      <div
	                        className={cn(
	                          'piece-token mehen-token relative flex h-full w-full items-center justify-center',
                          appearance.tokenClassName,
                          piece.type === 'lion' ? 'mehen-token--lion' : 'mehen-token--ball',
                        )}
                      >
                        <div className="piece-token__core absolute inset-[3px] flex items-center justify-center">
                          <div
                            className={cn(
                              'piece-token__symbol-wrap',
                              piece.type !== 'lion' && 'piece-token__symbol-wrap--small',
                            )}
                          >
                            <MaskedSvgIcon
                              src={appearance.iconPath}
                              className="piece-token__symbol piece-token__symbol--cavity"
                            />
                            <MaskedSvgIcon
                              src={appearance.iconPath}
                              className="piece-token__symbol piece-token__symbol--shadow"
                            />
                            <MaskedSvgIcon
                              src={appearance.iconPath}
                              className="piece-token__symbol piece-token__symbol--base"
                            />
                            <MaskedSvgIcon
                              src={appearance.iconPath}
                              className="piece-token__symbol piece-token__symbol--edge"
                            />
                          </div>
                        </div>
                      </div>
	                      {piece.type === 'lion' ? (
	                        <span className="absolute -mt-7 ms-7 rounded-full border border-[#a8874d] bg-[#17110c] px-1 text-[9px] text-[#d8b56e] shadow-[0_2px_5px_rgba(0,0,0,0.45)]">
	                          L
	                        </span>
	                      ) : null}
	                    </button>
                      )
                    })}
	                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
