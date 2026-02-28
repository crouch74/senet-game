import { motion } from 'framer-motion'
import type { Piece as PieceType } from '../engine/types'
import type { LastMove } from '../engine/storeHelpers'
import { cn } from '../utils/cn'
import { playerAnubis, playerSphinx } from '../assets/royal'
import { MaskedSvgIcon } from './common/MaskedSvgIcon'

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
          'relative w-[70%] h-[70%] rounded-full flex items-center justify-center transition-all duration-300',
          'shadow-[0_12px_24px_-8px_rgba(0,0,0,0.9),0_1px_2px_rgba(255,255,255,0.2),inset_0_-6px_10px_rgba(0,0,0,0.7),inset_0_2px_5px_rgba(255,255,255,0.1)]',
          'bg-gradient-to-b from-[var(--ui-piece-shell-from)] to-[var(--ui-piece-shell-to)]',
          canMove &&
            'ring-2 ring-[var(--ui-piece-legal-ring)] shadow-[0_0_25px_var(--ui-piece-glow-anubis),inset_0_2px_4px_var(--ui-piece-legal-inner)] z-10 -translate-y-2 animate-[pulse_2.5s_ease-in-out_infinite] drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]',
          isCurrentPlayer &&
            !canMove &&
            'ring-[1px] ring-royal-gold/30 shadow-[0_2px_8px_rgba(0,0,0,0.5)]',
          isHovered &&
            '-translate-y-3 brightness-125 z-40 ring-4 ring-white shadow-[0_15px_40px_rgba(255,255,255,0.6),0_20px_20px_-10px_rgba(0,0,0,0.8)]',
        )}
      >
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[var(--ui-piece-core-from)] to-[var(--ui-piece-core-to)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <MaskedSvgIcon
            src={playerIconPath}
            className={cn(
              'w-[65%] h-[65%] transition-all duration-300 jitter-stroke',
              piece.player === 'anubis'
                ? 'bg-gradient-to-br from-[var(--ui-piece-emblem-anubis-from)] via-[var(--ui-piece-emblem-anubis-via)] to-[var(--ui-piece-emblem-anubis-to)]'
                : 'bg-gradient-to-br from-[var(--ui-piece-emblem-sphinx-from)] via-[var(--ui-piece-emblem-sphinx-via)] to-[var(--ui-piece-emblem-sphinx-to)]',
            )}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
