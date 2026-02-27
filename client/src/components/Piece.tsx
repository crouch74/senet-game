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
    const { currentThrow, currentPlayer, movePiece, legalMoves, setHoveredPieceId, hoveredPieceId, lastMove } = useSenetStore();

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
                    y: isCurrentPlayer && !canMove ? [0, -2, 0] : 0,
                    filter: lastMove?.pieceId === piece.id
                        ? (lastMove.isCapture
                            ? ["brightness(1) sepia(0) hue-rotate(0deg)", "brightness(2) sepia(1) hue-rotate(-50deg)", "brightness(1) sepia(0) hue-rotate(0deg)"]
                            : ["brightness(1)", "brightness(2)", "brightness(1)"])
                        : "brightness(1)"
                }}
                transition={{
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    filter: { duration: 0.5, ease: "easeOut" }
                }}
                className={cn(
                    "relative w-[70%] h-[70%] rounded-full flex items-center justify-center transition-all duration-300",
                    // Complex shadow for physical presence: drop shadow + rim highlight + vertical offset
                    "shadow-[0_12px_24px_-8px_rgba(0,0,0,0.9),0_1px_2px_rgba(255,255,255,0.2),inset_0_-6px_10px_rgba(0,0,0,0.7),inset_0_2px_5px_rgba(255,255,255,0.1)]",
                    // Polished dark stone/ebony body for both players
                    "bg-gradient-to-b from-[#3a2f2a] to-[#120c0a]",
                    canMove && 'ring-2 ring-[#f3e5ab] shadow-[0_0_25px_rgba(243,229,171,0.7),inset_0_2px_4px_rgba(255,255,240,0.3)] z-10 -translate-y-2 animate-[pulse_2.5s_ease-in-out_infinite] drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]',
                    isCurrentPlayer && !canMove && 'ring-[1px] ring-royal-gold/30 shadow-[0_2px_8px_rgba(0,0,0,0.5)]',
                    hoveredPieceId === piece.id && '-translate-y-3 brightness-125 z-40 ring-4 ring-white shadow-[0_15px_40px_rgba(255,255,255,0.6),0_20px_20px_-10px_rgba(0,0,0,0.8)]'
                )}
            >
                {/* Engraved inlay section */}
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#1a1110] to-[#0a0705] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center">
                    {/* SVG Emblem */}
                    <div
                        className={cn(
                            "w-[65%] h-[65%] mask-image-center transition-all duration-300 jitter-stroke",
                            piece.player === 'anubis' ? "bg-gradient-to-br from-[#f3e5ab] via-[#d4af37] to-[#996515]" : "bg-gradient-to-br from-[#EAE0C8] via-[#FFFFF0] to-[#C9BFA1]"
                        )}
                        style={{
                            WebkitMaskImage: `url(/assets/royal/${piece.player === 'anubis' ? 'player_anubis.svg' : 'Sphinx.svg'})`,
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            WebkitMaskSize: 'contain',
                            maskImage: `url(/assets/royal/${piece.player === 'anubis' ? 'player_anubis.svg' : 'Sphinx.svg'})`,
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
