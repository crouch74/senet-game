import { useEffect, useMemo, useRef, useState } from 'react'
import { useSenetStore } from '../../../../engine/store'
import {
  boardStoreSelector,
  useShallowSelector,
} from '../../../../engine/selectors'
import { isLocalTurnState, type LastMove } from '../../../../engine/storeHelpers'
import type { Piece, PlayerID, Ruleset } from '../../../../engine/types'
import { getSquareNumber } from '../../../../utils/grid'
import { getHouseIcon, type HouseIcon } from './houseIcons'

interface BoardDimensions {
  height: number
  width: number
}

type SpecialSquareInfo = Ruleset['specialSquares'][number] | undefined

export interface BoardSquareModel {
  currentPlayer: PlayerID
  icon: HouseIcon | null
  isActionableMove: boolean
  isHoveredTarget: boolean
  isLegalMove: boolean
  isRecentlyActivated: boolean
  number: number
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  specialInfo: SpecialSquareInfo
}

export interface BoardPieceModel {
  canMove: boolean
  height: number
  isCurrentPlayer: boolean
  isHovered: boolean
  lastMove: LastMove | null
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  piece: Piece
  width: number
  x: number
  y: number
}

const SQUARE_NUMBERS = Array.from({ length: 30 }, (_, index) =>
  getSquareNumber(Math.floor(index / 10), index % 10),
)

const getBoardPosition = (position: number, dimensions: BoardDimensions) => {
  const cellWidth = dimensions.width / 10
  const cellHeight = dimensions.height / 3

  let row = 0
  let col = 0
  if (position > 0 && position <= 10) {
    row = 0
    col = position - 1
  } else if (position > 10 && position <= 20) {
    row = 1
    col = 20 - position
  } else if (position > 20 && position <= 30) {
    row = 2
    col = position - 21
  }

  return {
    x: col * cellWidth,
    y: row * cellHeight,
    width: cellWidth,
    height: cellHeight,
  }
}

export function useBoardViewModel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<BoardDimensions>({
    width: 0,
    height: 0,
  })
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
    ruleset,
    setHoveredPieceId,
  } = useSenetStore(useShallowSelector(boardStoreSelector))

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const isLocalTurn = isLocalTurnState({
    currentPlayer,
    isConnectingToRoom,
    isOnline,
    isWaitingForOpponent,
    localPlayer,
    offlineHumanPlayer,
    offlineMode,
  })

  const legalMovesByTargetSquare = useMemo(
    () => new Map(legalMoves.map((move) => [move.targetSquare, move])),
    [legalMoves],
  )
  const legalMovesByPieceId = useMemo(
    () => new Map(legalMoves.map((move) => [move.pieceId, move])),
    [legalMoves],
  )

  const squareModels = useMemo<BoardSquareModel[]>(
    () =>
      SQUARE_NUMBERS.map((number) => {
        const move = legalMovesByTargetSquare.get(number)
        const isLegalMove = move !== undefined
        const isActionableMove = isLocalTurn && isLegalMove
        const isSpecial = number >= 26 && number <= 30

        return {
          number,
          currentPlayer,
          icon: getHouseIcon(number),
          isActionableMove,
          isHoveredTarget:
            isActionableMove &&
            hoveredPieceId !== null &&
            move?.pieceId === hoveredPieceId,
          isLegalMove,
          isRecentlyActivated:
            lastMove?.to === number && (isSpecial || number === 15),
          specialInfo: ruleset.specialSquares[number],
          onMouseEnter: () => {
            if (!isActionableMove || !move) return
            setHoveredPieceId(move.pieceId)
          },
          onMouseLeave: () => {
            if (isActionableMove) {
              setHoveredPieceId(null)
            }
          },
          onClick: () => {
            if (!isActionableMove || !move) return
            setHoveredPieceId(null)
            movePiece(move.pieceId)
          },
        }
      }),
    [
      currentPlayer,
      hoveredPieceId,
      isLocalTurn,
      lastMove,
      legalMovesByTargetSquare,
      movePiece,
      ruleset.specialSquares,
      setHoveredPieceId,
    ],
  )

  const pieceModels = useMemo<BoardPieceModel[]>(
    () =>
      board
        .filter((piece) => piece.position > 0 && piece.position <= 30)
        .map((piece) => {
          const boardPosition = getBoardPosition(piece.position, dimensions)
          const canMove =
            dimensions.width > 0 &&
            dimensions.height > 0 &&
            isLocalTurn &&
            legalMovesByPieceId.has(piece.id) &&
            Boolean(currentThrow)

          return {
            ...boardPosition,
            piece,
            canMove,
            isCurrentPlayer: piece.player === currentPlayer,
            isHovered: hoveredPieceId === piece.id,
            lastMove,
            onMouseEnter: () => {
              if (canMove) {
                setHoveredPieceId(piece.id)
              }
            },
            onMouseLeave: () => {
              setHoveredPieceId(null)
            },
            onClick: () => {
              if (!canMove) return
              setHoveredPieceId(null)
              movePiece(piece.id)
            },
          }
        }),
    [
      board,
      currentPlayer,
      currentThrow,
      dimensions,
      hoveredPieceId,
      isLocalTurn,
      lastMove,
      legalMovesByPieceId,
      movePiece,
      setHoveredPieceId,
    ],
  )

  return {
    containerRef,
    pieceModels,
    squareModels,
  }
}
