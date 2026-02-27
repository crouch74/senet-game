import { useTranslation } from 'react-i18next';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';
import { formatNumber } from '../utils/format';
import { withBasePath } from '../utils/urls';

interface SquareProps {
    number: number;
}

export function Square({ number }: SquareProps) {
    const {
        ruleset,
        legalMoves,
        currentPlayer,
        hoveredPieceId,
        setHoveredPieceId,
        movePiece,
        lastMove,
        isOnline,
        localPlayer,
        offlineMode,
        offlineHumanPlayer
    } = useSenetStore();
    const { t, i18n } = useTranslation();
    const specialInfo = ruleset.specialSquares[number];

    const isLegalMove = legalMoves.some(m => m.targetSquare === number);
    const isLocalTurn = isOnline
        ? currentPlayer === localPlayer
        : offlineMode === 'vs_pc'
            ? currentPlayer === offlineHumanPlayer
            : true;
    const isActionableMove = isLocalTurn && isLegalMove;
    const isHoveredTarget = isActionableMove && hoveredPieceId && legalMoves.some(m => m.pieceId === hoveredPieceId && m.targetSquare === number);
    const isSpecial = number >= 26 && number <= 30;
    const isRecentlyActivated = lastMove?.to === number && (isSpecial || number === 15);

    const getHouseIcon = () => {
        switch (number) {
            case 15: return { type: 'svg', val: withBasePath('assets/royal/house_26_ankh.svg'), color: 'bg-royal-blue', repeat: 1 };
            case 26: return { type: 'text', val: '𓄤 𓄤 𓄤', color: 'text-royal-green drop-shadow-[0_0_8px_rgba(55,139,110,0.6)]' };
            case 27: return { type: 'svg', val: withBasePath('assets/royal/house_27_water_n35.svg'), color: 'bg-royal-blue', repeat: 3, stack: true };
            case 28: return { type: 'svg', val: withBasePath('assets/royal/house_28_maat_feather.svg'), color: 'bg-royal-ivory', repeat: 3 };
            case 29: return { type: 'svg', val: withBasePath('assets/royal/house_29_sun_disk.svg'), color: 'bg-royal-gold', repeat: 2, stack: true };
            case 30: return { type: 'svg', val: withBasePath('assets/royal/house_30_horus_falcon.svg'), color: 'bg-royal-gold', repeat: 1 };
            default: return null;
        }
    };

    const icon = getHouseIcon();

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center aspect-square group box-border",
                "bg-[var(--ui-square-base)] transition-all duration-500",
                isRecentlyActivated && "z-30 bg-[var(--ui-square-active)] scale-[1.05] ring-2 ring-white/50 shadow-[0_0_40px_rgba(255,255,255,0.4)] animate-pulse",
                // Depth: inner shadow + bevel look
                "border-[0.5px] border-black/80",
                "shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.4),inset_0_0_10px_rgba(0,0,0,0.7)]",
                "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-black/20 after:to-white/5 after:pointer-events-none",
                isActionableMove && cn(
                    "cursor-pointer",
                    currentPlayer === 'anubis'
                        ? "ring-1 ring-royal-gold/40 shadow-[inset_0_0_30px_rgba(212,175,55,0.2)]"
                        : "ring-1 ring-royal-ivory/40 shadow-[inset_0_0_30px_rgba(255,255,240,0.2)]"
                ),
                isHoveredTarget && cn(
                    "z-20 scale-[1.02] bg-[var(--ui-square-hover)]",
                    currentPlayer === 'anubis'
                        ? "ring-2 ring-royal-gold shadow-[0_10px_30px_rgba(212,175,55,0.4),inset_0_0_40px_rgba(212,175,55,0.2)]"
                        : "ring-2 ring-royal-ivory shadow-[0_10px_30px_rgba(255,255,240,0.4),inset_0_0_40px_rgba(255,255,240,0.2)]"
                )
            )}
            onMouseEnter={() => {
                if (isActionableMove) {
                    const move = legalMoves.find(m => m.targetSquare === number);
                    if (move) setHoveredPieceId(move.pieceId);
                }
            }}
            onMouseLeave={() => {
                if (isActionableMove) setHoveredPieceId(null);
            }}
            onClick={() => {
                if (isActionableMove) {
                    const move = legalMoves.find(m => m.targetSquare === number);
                    if (move) {
                        setHoveredPieceId(null);
                        movePiece(move.pieceId);
                    }
                }
            }}
        >
            {/* Embedded Special Square Inlay Border */}
            {isSpecial && (
                <div className="absolute inset-[3px] border-[0.5px] border-[var(--ui-square-special-border)] pointer-events-none mix-blend-overlay" />
            )}

            {/* Number - Brightened by 10% (from 30 to 40) */}
            <div className="absolute top-1 left-[6px] text-[10px] text-royal-ivory/40 font-mono z-10 pointer-events-none">
                {formatNumber(number)}
            </div>

            {/* Icon Inlay */}
            {icon && icon.type === 'text' && (
                <div className={cn(
                    "text-3xl opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]",
                    icon.color || "text-royal-ivory/40"
                )}>
                    {icon.val}
                </div>
            )}

            {icon && icon.type === 'svg' && (
                <div className={cn(
                    "relative group-hover:scale-105 transition-transform duration-500 opacity-90",
                    (icon.repeat || 1) > 1
                        ? (icon.stack
                            ? "w-[45%] h-[80%] flex flex-col items-center justify-center gap-0.5"
                            : "w-4/5 h-[45%] flex flex-row items-center justify-center gap-1")
                        : "w-3/5 h-3/5"
                )}>
                    {Array.from({ length: icon.repeat || 1 }).map((_, i) => (
                        <div key={i} className={cn("relative w-full h-full", (icon.repeat || 1) === 1 && "absolute inset-0")}>
                            <div
                                className={cn(
                                    "absolute inset-0 mask-image-center transition-all duration-700",
                                    icon.color,
                                    isLegalMove && "bg-royal-ivory drop-shadow-[0_0_5px_rgba(255,255,240,0.8)]" // Glow bright if legal move
                                )}
                                style={{
                                    WebkitMaskImage: `url(${icon.val})`,
                                    WebkitMaskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    maskImage: `url(${icon.val})`,
                                    maskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    maskSize: 'contain',
                                }}
                            >
                                {/* Shimmer/Specular effects inside the mask */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-300" />
                                <div className="absolute -inset-full animate-[shimmer_3s_infinite_linear] bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 opacity-0 group-hover:opacity-100" />
                            </div>
                            {/* Shadow/Bevel Rim underneath the inlay - deepened for "Inlaid Fill" effect */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-60 mix-blend-multiply translate-y-[1.5px] blur-[0.5px]"
                                style={{
                                    WebkitMaskImage: `url(${icon.val})`,
                                    WebkitMaskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    backgroundColor: 'black'
                                }}
                            />
                            {/* Inner Highlight for depth */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay -translate-y-[0.5px]"
                                style={{
                                    WebkitMaskImage: `url(${icon.val})`,
                                    WebkitMaskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    backgroundColor: 'white'
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Legal Move Glow Line path overlay */}
            {isLegalMove && (
                <div className={cn(
                    "absolute inset-x-0 bottom-1 h-[2px] animate-pulse transition-all duration-300",
                    currentPlayer === 'anubis'
                        ? "bg-gradient-to-r from-transparent via-royal-gold to-transparent shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                        : "bg-gradient-to-r from-transparent via-royal-ivory to-transparent shadow-[0_0_12px_rgba(255,255,240,0.8)]",
                    isHoveredTarget && "h-[4px] bottom-0 opacity-100 via-white shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                )} />
            )}

            {/* Luxury Tooltip */}
            {specialInfo && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 flex justify-center z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                        className="w-[240px] shrink-0 p-3 bg-[var(--ui-tooltip-bg)] border-[2px] border-royal-gold shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-[var(--ui-tooltip-text)] text-xs rounded-sm text-start"
                        dir={i18n.language === 'ar-EG' ? 'rtl' : 'ltr'}
                    >
                        <div className="flex items-center gap-2 border-b border-royal-gold/20 pb-2 mb-2">
                            {icon && icon.type === 'svg' && (
                                <img src={icon.val} alt="icon" className="w-5 h-5 opacity-80" />
                            )}
                            <div className="font-bold text-royal-gold drop-shadow-sm uppercase tracking-wider text-sm">{t(`square.names.${number}`)}</div>
                        </div>

                        {/* Game Effect */}
                        <div className="mb-2">
                            <div className="font-serif font-bold text-[var(--ui-tooltip-accent)] mb-0.5">{t('square.effect', { effect: t(`square.effects.${specialInfo.effect}`) })}</div>
                            {specialInfo.requiredThrow && <div className="font-serif text-[var(--ui-tooltip-text)] opacity-80">{t('square.requires_throw', { num: formatNumber(specialInfo.requiredThrow) })}</div>}
                            {!specialInfo.canBypass && <div className="text-royal-blue font-bold text-[10px] uppercase mt-0.5 opacity-90">{t('square.cannot_bypass')}</div>}
                        </div>

                        {/* Afterlife Context */}
                        <div className="border-t border-royal-gold/20 pt-2 mt-2">
                            <div className="text-[10px] text-royal-gold font-bold uppercase tracking-widest mb-1 opacity-80">{t('square.lore')}</div>
                            <div className="font-serif text-[var(--ui-tooltip-text)] opacity-70 italic leading-relaxed">{t(`square.contexts.${number}`)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
