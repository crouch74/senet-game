import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  boardStoreSelector,
  useShallowSelector,
} from '../../../engine/selectors'
import { useSenetStore } from '../../../engine/store'
import { isLocalTurnState } from '../../../engine/storeHelpers'
import { cn } from '../../../utils/cn'
import { getPieceLabel, getPlayerLabel } from '../../../utils/gameLabels'
import {
  getSquareForProgress,
  getTravelSquareIds,
  UR_BOARD_SQUARES,
  type UrBoardSquare,
  type UrSquareId,
} from '../boardMetadata'
import { isValidMove } from '../engine/logic'
import { UrTileMotif } from './tileMotifs'

const getUrPlayer = (player: 'anubis' | 'sphinx') => player

const getLaneTranslationKey = (square: UrBoardSquare) => {
  if (square.lane === 'top-private') return 'games.ur.board.lanes.top_private'
  if (square.lane === 'bottom-private') return 'games.ur.board.lanes.bottom_private'
  return 'games.ur.board.lanes.shared'
}

export function Board() {
  const { t } = useTranslation()
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null)
  const [hoveredSquareId, setHoveredSquareId] = useState<UrSquareId | null>(null)
  const [openTooltipSquareId, setOpenTooltipSquareId] = useState<UrSquareId | null>(null)
  const winner = useSenetStore((state) => state.winner)
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
    moveError,
    offlineHumanPlayer,
    offlineMode,
    ruleset,
    setHoveredPieceId,
    setMoveError,
    urConfig,
  } = useSenetStore(useShallowSelector(boardStoreSelector))

  const isLocalTurn = isLocalTurnState({
    currentPlayer,
    isConnectingToRoom,
    isOnline,
    isWaitingForOpponent,
    localPlayer,
    offlineHumanPlayer,
    offlineMode,
  })

  const validationState = useMemo(
    () =>
      ({
        gameType: 'ur',
        board,
        currentPlayer,
        currentThrow,
        ruleset,
        urConfig,
        winner,
        historyLog: [],
      }) as const,
    [board, currentPlayer, currentThrow, ruleset, urConfig, winner],
  )

  const piecesById = useMemo(
    () => new Map(board.map((piece) => [piece.id, piece])),
    [board],
  )

  const legalMovesByPieceId = useMemo(
    () => new Map(legalMoves.map((move) => [move.pieceId, move.targetSquare])),
    [legalMoves],
  )

  const activePieceId = selectedPieceId ?? hoveredPieceId
  const activePiece = activePieceId ? piecesById.get(activePieceId) : undefined
  const activeTargetSquare =
    activePieceId !== null ? legalMovesByPieceId.get(activePieceId) : undefined
  const activeTargetSquareId =
    activePiece && activeTargetSquare !== undefined && activeTargetSquare < 15
      ? getSquareForProgress(
          getUrPlayer(activePiece.player as 'anubis' | 'sphinx'),
          activeTargetSquare,
        )
      : null
  const previewSquareIds = new Set<UrSquareId>(
    activePiece && activeTargetSquare !== undefined
      ? getTravelSquareIds(
          getUrPlayer(activePiece.player as 'anubis' | 'sphinx'),
          activePiece.position,
          activeTargetSquare,
        )
      : [],
  )

  const legalTargetSquareIds = useMemo(
    () =>
      new Set(
        legalMoves
          .map((move) => {
            const piece = piecesById.get(move.pieceId)
            if (!piece || move.targetSquare >= 15) return null
            return getSquareForProgress(
              getUrPlayer(piece.player as 'anubis' | 'sphinx'),
              move.targetSquare,
            )
          })
          .filter((value): value is UrSquareId => value !== null),
      ),
    [legalMoves, piecesById],
  )

  const lastMoveSquareId = useMemo(() => {
    if (!lastMove) return null
    const movedPiece = piecesById.get(lastMove.pieceId)
    if (!movedPiece || lastMove.to >= 15) return null
    return getSquareForProgress(
      getUrPlayer(movedPiece.player as 'anubis' | 'sphinx'),
      lastMove.to,
    )
  }, [lastMove, piecesById])

  const piecesOnSquares = useMemo(() => {
    const map = new Map<UrSquareId, typeof board[number]>()
    board.forEach((piece) => {
      if (piece.position <= 0 || piece.position >= 15) return
      const squareId = getSquareForProgress(
        getUrPlayer(piece.player as 'anubis' | 'sphinx'),
        piece.position,
      )
      if (squareId) {
        map.set(squareId, piece)
      }
    })
    return map
  }, [board])

  const reservePieces = useMemo(
    () => ({
      anubis: board.filter(
        (piece) => piece.player === 'anubis' && piece.position === 0,
      ),
      sphinx: board.filter(
        (piece) => piece.player === 'sphinx' && piece.position === 0,
      ),
    }),
    [board],
  )

  useEffect(() => {
    if (!currentThrow) {
      setSelectedPieceId(null)
      setHoveredPieceId(null)
    }
  }, [currentThrow, setHoveredPieceId])

  useEffect(() => {
    if (selectedPieceId && !legalMovesByPieceId.has(selectedPieceId)) {
      setSelectedPieceId(null)
    }
  }, [legalMovesByPieceId, selectedPieceId])

  const handlePieceClick = (pieceId: string) => {
    if (!isLocalTurn) return

    const roll = currentThrow?.value ?? 0
    const validation = isValidMove(validationState as never, pieceId, roll, currentPlayer)
    if (!validation.valid) {
      setMoveError(validation.reason ?? 'no_legal_move_for_roll')
      return
    }

    setMoveError(null)
    if (selectedPieceId === pieceId) {
      setSelectedPieceId(null)
      setHoveredPieceId(null)
      movePiece(pieceId)
      return
    }

    setSelectedPieceId(pieceId)
    setHoveredPieceId(pieceId)
  }

  const handleSquareClick = (squareId: UrSquareId) => {
    const candidateIds = legalMoves
      .filter((move) => {
        const piece = piecesById.get(move.pieceId)
        if (!piece || move.targetSquare >= 15) return false
        return (
          getSquareForProgress(
            getUrPlayer(piece.player as 'anubis' | 'sphinx'),
            move.targetSquare,
          ) === squareId
        )
      })
      .map((move) => move.pieceId)

    const preferredPieceId =
      selectedPieceId && candidateIds.includes(selectedPieceId)
        ? selectedPieceId
        : hoveredPieceId && candidateIds.includes(hoveredPieceId)
          ? hoveredPieceId
          : candidateIds.length === 1
            ? candidateIds[0]
            : null

    if (preferredPieceId) {
      setMoveError(null)
      setSelectedPieceId(null)
      setHoveredPieceId(null)
      movePiece(preferredPieceId)
      return
    }

    setOpenTooltipSquareId((currentId) => (currentId === squareId ? null : squareId))
  }

  const renderTooltip = (squareId: UrSquareId, type: 'exit' | 'private' | 'rosette' | 'shared') => {
    const isVisible = openTooltipSquareId === squareId || hoveredSquareId === squareId
    return (
      <div
        className={cn('ur-tooltip', isVisible && 'ur-tooltip--visible')}
        role="tooltip"
      >
        <p className="ur-tooltip__title">
          {t(`games.ur.board.tooltip.${type}.title`)}
        </p>
        <p className="ur-tooltip__body">
          {t(`games.ur.board.tooltip.${type}.body`)}
        </p>
      </div>
    )
  }

  const getSquareAriaLabel = (square: UrBoardSquare) =>
    [
      t(getLaneTranslationKey(square)),
      t(`games.ur.board.tooltip.${square.tooltipType}.title`),
      t(`games.ur.board.tooltip.${square.tooltipType}.body`),
    ].join('. ')

  return (
    <div className="ur-board-scene w-full max-w-6xl">
      <div className="ur-board-scene__reserve ur-board-scene__reserve--top">
        <div className="ur-board-scene__reserve-head">
          <span>{t('games.ur.board.reserve_label')}</span>
          <span>{t('games.ur.players.sphinx')}</span>
        </div>
        <div className="ur-board-scene__reserve-grid">
          {reservePieces.sphinx.map((piece) => {
            const isLegal = legalMovesByPieceId.has(piece.id)
            return (
              <button
                key={piece.id}
                type="button"
                className={cn(
                  'ur-piece ur-piece--stone ur-piece--reserve',
                  isLegal && 'ur-piece--legal',
                  hoveredPieceId === piece.id && 'ur-piece--selected',
                )}
                onMouseEnter={() => {
                  if (isLegal) setHoveredPieceId(piece.id)
                }}
                onMouseLeave={() => {
                  if (!selectedPieceId) setHoveredPieceId(null)
                }}
                onClick={() => handlePieceClick(piece.id)}
                aria-label={`${getPlayerLabel(t, 'ur', piece.player)} ${getPieceLabel(t, 'ur', piece.type)}`}
              >
                <span className="ur-piece__core" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="ur-board-frame">
        <div
          className="ur-board"
          role="img"
          aria-label={t('games.ur.board.aria_label')}
        >
          <div className="ur-board__lane-panel ur-board__lane-panel--top-left" />
          <div className="ur-board__lane-panel ur-board__lane-panel--top-right" />
          <div className="ur-board__lane-panel ur-board__lane-panel--shared" />
          <div className="ur-board__lane-panel ur-board__lane-panel--bottom-left" />
          <div className="ur-board__lane-panel ur-board__lane-panel--bottom-right" />
          {UR_BOARD_SQUARES.map((square) => {
            const piece = piecesOnSquares.get(square.id)
            const isLegalTarget = legalTargetSquareIds.has(square.id)
            const isActiveTarget = activeTargetSquareId === square.id
            const isPreviewed = previewSquareIds.has(square.id)
            const isTooltipOpen =
              openTooltipSquareId === square.id || hoveredSquareId === square.id

            return (
              <div
                key={square.id}
                className={cn(
                  'ur-square',
                  square.lane === 'shared' && 'ur-square--shared-road',
                  square.lane !== 'shared' && 'ur-square--private-road',
                  square.isRosette && 'ur-square--rosette',
                  isLegalTarget && 'ur-square--legal',
                  isActiveTarget && 'ur-square--active',
                  isPreviewed && 'ur-square--preview',
                  lastMoveSquareId === square.id && 'ur-square--last-move',
                  isTooltipOpen && 'ur-square--tooltip-open',
                )}
                style={{
                  gridColumnStart: square.col + 1,
                  gridRowStart: square.row + 1,
                  ['--ur-tile-inset' as string]: `${square.tileInset}rem`,
                  ['--ur-tile-rotation' as string]: `${square.tileRotationDeg}deg`,
                  ['--ur-wear-opacity' as string]: square.wear.toString(),
                }}
              >
                <button
                  type="button"
                  className="ur-square__surface"
                  onClick={() => handleSquareClick(square.id)}
                  onMouseEnter={() => setHoveredSquareId(square.id)}
                  onMouseLeave={() => setHoveredSquareId(null)}
                  onFocus={() => setHoveredSquareId(square.id)}
                  onBlur={() => setHoveredSquareId(null)}
                  aria-label={getSquareAriaLabel(square)}
                />
                <div className="ur-square__tile" aria-hidden="true">
                  <UrTileMotif square={square} />
                </div>
                {piece ? (
                  <button
                    type="button"
                    className={cn(
                      'ur-piece',
                      piece.player === 'anubis' ? 'ur-piece--shell' : 'ur-piece--stone',
                      legalMovesByPieceId.has(piece.id) && 'ur-piece--legal',
                      (selectedPieceId === piece.id || hoveredPieceId === piece.id) &&
                        'ur-piece--selected',
                      lastMove?.pieceId === piece.id && 'ur-piece--last-move',
                    )}
                    onMouseEnter={() => {
                      if (legalMovesByPieceId.has(piece.id)) setHoveredPieceId(piece.id)
                    }}
                    onMouseLeave={() => {
                      if (!selectedPieceId) setHoveredPieceId(null)
                    }}
                    onFocus={() => {
                      if (legalMovesByPieceId.has(piece.id)) setHoveredPieceId(piece.id)
                    }}
                    onBlur={() => {
                      if (!selectedPieceId) setHoveredPieceId(null)
                    }}
                    onClick={() => handlePieceClick(piece.id)}
                    aria-label={`${getPlayerLabel(t, 'ur', piece.player)} ${getPieceLabel(t, 'ur', piece.type)}`}
                  >
                    <span className="ur-piece__core" />
                  </button>
                ) : null}
                {renderTooltip(square.id, square.tooltipType)}
                {isTooltipOpen ? <div className="ur-square__focus-ring" /> : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="ur-board-scene__reserve ur-board-scene__reserve--bottom">
        <div className="ur-board-scene__reserve-head">
          <span>{t('games.ur.board.reserve_label')}</span>
          <span>{t('games.ur.players.anubis')}</span>
        </div>
        <div className="ur-board-scene__reserve-grid">
          {reservePieces.anubis.map((piece) => {
            const isLegal = legalMovesByPieceId.has(piece.id)
            return (
              <button
                key={piece.id}
                type="button"
                className={cn(
                  'ur-piece ur-piece--shell ur-piece--reserve',
                  isLegal && 'ur-piece--legal',
                  hoveredPieceId === piece.id && 'ur-piece--selected',
                )}
                onMouseEnter={() => {
                  if (isLegal) setHoveredPieceId(piece.id)
                }}
                onMouseLeave={() => {
                  if (!selectedPieceId) setHoveredPieceId(null)
                }}
                onClick={() => handlePieceClick(piece.id)}
                aria-label={`${getPlayerLabel(t, 'ur', piece.player)} ${getPieceLabel(t, 'ur', piece.type)}`}
              >
                <span className="ur-piece__core" />
              </button>
            )
          })}
        </div>
      </div>

      {moveError ? (
        <div className="ur-board-scene__error" aria-live="polite">
          {t(`games.ur.illegal.${moveError}`)}
        </div>
      ) : null}
    </div>
  )
}
