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
                    "relative w-[70%] h-[70%] rounded-full shadow-[0_8px_15px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-300",
                    // Polished dark stone/ebony body for both players
                    "bg-gradient-to-b from-[#3a2f2a] to-[#120c0a]",
                    canMove && 'ring-[1px] ring-royal-gold shadow-[0_0_15px_rgba(212,175,55,0.4),inset_0_2px_4px_rgba(255,255,255,0.1)] z-10 scale-110 drop-shadow-[0_4px_4px_rgba(212,175,55,0.3)]',
                    isCurrentPlayer && !canMove && 'ring-[0.5px] ring-royal-gold/50 shadow-[0_0_8px_rgba(212,175,55,0.2)]'
                )}
            >
                {/* Engraved inlay section */}
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#1a1110] to-[#0a0705] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center">
                    {/* SVG Emblem */}
                    <div
                        className={cn(
                            "w-[65%] h-[65%] mask-image-center transition-all duration-300",
                            piece.player === 'light' ? "bg-royal-gold" : "bg-royal-ivory"
                        )}
                        style={{
                            WebkitMaskImage: `url(/assets/royal/${piece.player === 'light' ? 'player_anubis.svg' : 'house_30_horus_falcon.svg'})`,
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            WebkitMaskSize: 'contain',
                            maskImage: `url(/assets/royal/${piece.player === 'light' ? 'player_anubis.svg' : 'house_30_horus_falcon.svg'})`,
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            maskSize: 'contain',
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
