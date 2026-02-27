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
    const { currentThrow, currentPlayer, movePiece, legalMoves, setHoveredPieceId, hoveredPieceId } = useSenetStore();

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

    // Hide if in afterlife (Board will not render it, handled by Afterlife component)
    // but if it's position 0 (off-board start), keep it null for now
    if (piece.position === 31 || piece.position === 0) return null;

    return (
        <motion.div
            layout
            layoutId={`piece-${piece.id}`}
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
            onMouseEnter={() => canMove && setHoveredPieceId(piece.id)}
            onMouseLeave={() => setHoveredPieceId(null)}
            onClick={(e) => {
                e.stopPropagation();
                if (canMove && myLegalMove) {
                    setHoveredPieceId(null);
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
                    canMove && 'ring-2 ring-[#f3e5ab] shadow-[0_0_20px_rgba(243,229,171,0.6),inset_0_2px_4px_rgba(255,255,240,0.2)] z-10 scale-[1.15] -translate-y-1 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_4px_6px_rgba(212,175,55,0.4)]',
                    isCurrentPlayer && !canMove && 'ring-[0.5px] ring-royal-gold/50 shadow-[0_0_8px_rgba(212,175,55,0.2)]',
                    hoveredPieceId === piece.id && 'scale-[1.25] brightness-125 z-40 ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,0.8)]'
                )}
            >
                {/* Engraved inlay section */}
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#1a1110] to-[#0a0705] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center">
                    {/* SVG Emblem */}
                    <div
                        className={cn(
                            "w-[65%] h-[65%] mask-image-center transition-all duration-300",
                            piece.player === 'light' ? "bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#996515]" : "bg-gradient-to-br from-[#EAE0C8] via-[#FFFFF0] to-[#C9BFA1]"
                        )}
                        style={{
                            WebkitMaskImage: `url(/assets/royal/${piece.player === 'light' ? 'player_anubis.svg' : 'Sphinx.svg'})`,
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            WebkitMaskSize: 'contain',
                            maskImage: `url(/assets/royal/${piece.player === 'light' ? 'player_anubis.svg' : 'Sphinx.svg'})`,
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
