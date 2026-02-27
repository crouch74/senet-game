import { motion } from 'framer-motion';
import type { Piece as PieceType } from '../engine/types';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';

interface PieceProps {
    piece: PieceType;
    // Passing the board geometry lets the piece position itself absolutely
    containerWidth: number;
    containerHeight: number;
}

export function Piece({ piece, containerWidth, containerHeight }: PieceProps) {
    const { currentThrow, currentPlayer, movePiece, legalMoves } = useSenetStore();

    // Find cell width/height
    const cellW = containerWidth / 10;
    const cellH = containerHeight / 3;

    // Find row/col of the square number (1-30) to position
    let row = 0, col = 0;
    if (piece.position > 0 && piece.position <= 10) {
        row = 0; col = piece.position - 1;
    } else if (piece.position > 10 && piece.position <= 20) {
        row = 1; col = 20 - piece.position;
    } else if (piece.position > 20 && piece.position <= 30) {
        row = 2; col = piece.position - 21;
    }

    // Position is center of that cell
    const x = col * cellW;
    const y = row * cellH;

    const isCurrentPlayer = piece.player === currentPlayer;

    // Can this piece move?
    const myLegalMove = legalMoves.find(m => m.pieceId === piece.id);
    const canMove = !!myLegalMove && !!currentThrow;

    // Hide if borne off or in afterlife
    if (piece.position === 31 || piece.position === 0) return null;

    return (
        <motion.div
            layout
            className={cn(
                "absolute flex items-center justify-center cursor-pointer",
            )}
            style={{
                width: cellW,
                height: cellH,
            }}
            initial={{ x, y }}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => {
                if (canMove && myLegalMove) {
                    movePiece(piece.id);
                }
            }}
        >
            <motion.div
                animate={{
                    y: isCurrentPlayer && !canMove ? [0, -2, 0] : 0
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={cn(
                    "w-[60%] h-[60%] rounded-full shadow-xl flex items-center justify-center border-2",
                    piece.player === 'light'
                        ? 'bg-amber-100 border-amber-200'
                        : 'bg-stone-800 border-stone-600',
                    canMove && 'ring-4 ring-gold shadow-[0_0_15px_rgba(212,175,55,0.6)] z-10 scale-110'
                )}
            >
                <div className={cn(
                    "w-1/2 h-1/2 rounded-full opacity-30",
                    piece.player === 'light' ? 'bg-amber-800' : 'bg-stone-400'
                )} />
            </motion.div>
        </motion.div>
    );
}
