import { motion } from 'framer-motion'
import type { Piece as PieceType } from '../../../engine/types'
import { cn } from '../../../utils/cn'
import { MaskedSvgIcon } from '../../../components/common/MaskedSvgIcon'
import { useSenetStore } from '../../../engine/store'
import { getPlayerAppearance } from '../../../utils/playerAppearance'

interface PieceProps {
    piece: PieceType
    pathX?: Array<number | string>
    pathY?: Array<number | string>
    x: number | string
    y: number | string
    width: number
    height: number
    zone?: 'spiral' | 'heart'
}

export function Piece({ piece, pathX, pathY, x, y, width, height, zone = 'spiral' }: PieceProps) {
    const movePiece = useSenetStore((state: { movePiece: (id: string) => void }) => state.movePiece)
    const canMove = useSenetStore((state) =>
        state.legalMoves.some((move) => move.pieceId === piece.id),
    )
    const appearance = getPlayerAppearance(piece.player, 'mehen')
    const isLion = piece.type === 'lion'

    return (
        <motion.div
            layoutId={`piece-${piece.id}`}
            data-piece-id={piece.id}
            data-piece-zone={zone}
            className={cn(
                "absolute z-50 flex items-center justify-center",
                canMove ? "cursor-pointer" : "cursor-default pointer-events-none",
            )}
            style={{ width, height, left: x, top: y, x: "-50%", y: "-50%" }}
            initial={false}
            animate={{
                left: pathX && pathX.length > 1 ? pathX : x,
                top: pathY && pathY.length > 1 ? pathY : y,
            }}
            transition={
                pathX && pathX.length > 1
                    ? {
                        duration: Math.max(0.18, (pathX.length - 1) * 0.12),
                        ease: 'easeInOut',
                        times: pathX.map((_, index) =>
                            pathX.length === 1 ? 1 : index / (pathX.length - 1),
                        ),
                    }
                    : { type: 'spring', stiffness: 300, damping: 30 }
            }
            whileHover={canMove ? { y: -2, scale: 1.04 } : undefined}
            onClick={(event) => {
                if (!canMove) return
                event.stopPropagation()
                movePiece(piece.id)
            }}
        >
            <div
                className={cn(
                    "piece-token mehen-token relative flex h-full w-full items-center justify-center transition-all duration-300",
                    appearance.tokenClassName,
                    isLion ? "mehen-token--lion" : "mehen-token--ball",
                    piece.isProtected && "mehen-token--protected",
                    canMove && "piece-token--movable",
                )}
            >
                <div className="piece-token__core absolute inset-[3px] flex items-center justify-center">
                    <div
                        className={cn(
                            "piece-token__symbol-wrap",
                            !isLion && "piece-token__symbol-wrap--small",
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
                {isLion && (
                    <div className="mehen-token__crest" aria-hidden="true">
                        𓃭
                    </div>
                )}
            </div>
        </motion.div>
    )
}
