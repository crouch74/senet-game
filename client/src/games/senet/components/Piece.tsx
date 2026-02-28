import { motion } from 'framer-motion'
import type { Piece as PieceType } from '../../../engine/types'
import type { LastMove } from '../../../engine/storeHelpers'
import { cn } from '../../../utils/cn'
import { playerAnubis, playerSphinx } from '../../../assets/royal'
import { MaskedSvgIcon } from '../../../components/common/MaskedSvgIcon'

interface PieceProps {
  canMove: boolean
  height: number
  isCurrentPlayer: boolean
  isHovered: boolean
  lastMove: LastMove | null
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  piece: PieceType
  width: number
  x: number
  y: number
}

export function Piece({
  canMove,
  height,
  isCurrentPlayer,
  isHovered,
  lastMove,
  onClick,
  onMouseEnter,
  onMouseLeave,
  piece,
  width,
  x,
  y,
}: PieceProps) {
  const playerIconPath = piece.player === 'anubis' ? playerAnubis : playerSphinx
  const playerTokenClass =
    piece.player === 'anubis' ? 'piece-token--anubis' : 'piece-token--sphinx'

  return (
    <motion.div
      layout
      layoutId={`piece-${piece.id}`}
      className={cn(
        'absolute flex items-center justify-center',
        canMove ? 'cursor-pointer' : 'cursor-default',
      )}
      style={{ width, height }}
      initial={{ x, y }}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <motion.div
        animate={{
          y: isCurrentPlayer && !canMove ? [0, -2, 0] : 0,
          filter:
            lastMove?.pieceId === piece.id
              ? lastMove.isCapture
                ? [
                  'brightness(1) sepia(0) hue-rotate(0deg)',
                  'brightness(2) sepia(1) hue-rotate(-50deg)',
                  'brightness(1) sepia(0) hue-rotate(0deg)',
                ]
                : ['brightness(1)', 'brightness(2)', 'brightness(1)']
              : 'brightness(1)',
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          filter: { duration: 0.5, ease: 'easeOut' },
        }}
        className={cn(
          'piece-token relative w-[70%] h-[70%] flex items-center justify-center transition-all duration-300',
          playerTokenClass,
          canMove &&
          'piece-token--movable z-10 -translate-y-2 animate-[pulse_2.5s_ease-in-out_infinite]',
          isCurrentPlayer &&
          !canMove &&
          'piece-token--current',
          isHovered &&
          'piece-token--hovered -translate-y-3 z-40',
        )}
      >
        <div className="piece-token__core absolute inset-[3px] flex items-center justify-center">
          <div className="piece-token__symbol-wrap">
            <MaskedSvgIcon
              src={playerIconPath}
              className="piece-token__symbol piece-token__symbol--cavity"
            />
            <MaskedSvgIcon
              src={playerIconPath}
              className="piece-token__symbol piece-token__symbol--shadow"
            />
            <MaskedSvgIcon
              src={playerIconPath}
              className="piece-token__symbol piece-token__symbol--base"
            />
            <MaskedSvgIcon
              src={playerIconPath}
              className="piece-token__symbol piece-token__symbol--edge"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
