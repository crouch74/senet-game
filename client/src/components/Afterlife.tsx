import { useTranslation } from 'react-i18next';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '../utils/format';

export function Afterlife() {
    const { board } = useSenetStore();
    const { t } = useTranslation();

    const borneOffPieces = board.filter(p => p.position === 31);
    const lightPieces = borneOffPieces.filter(p => p.player === 'anubis');
    const darkPieces = borneOffPieces.filter(p => p.player === 'sphinx');

    return (
        <div className="flex flex-col items-center p-4 bg-[var(--ui-header-inner-bg)] backdrop-blur-md rounded-sm border-[2px] border-royal-gold/40 shadow-[0_15px_35px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden w-full sm:w-64 max-w-full h-full min-h-56 group transition-all duration-500 hover:border-royal-gold/60">
            {/* Title */}
            <h3 className="text-royal-gold font-serif text-sm font-bold tracking-[0.3em] uppercase mb-4 border-b border-royal-gold/20 pb-2 w-full text-center">
                {t('afterlife.title', { defaultValue: 'Afterlife' })}
            </h3>

            {/* Box Interior */}
            <div className="flex-1 w-full bg-[var(--ui-panel-strong-bg)] rounded-sm p-4 shadow-inner flex flex-wrap content-start gap-3 relative overflow-y-auto custom-scrollbar">
                {borneOffPieces.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 italic text-xs text-royal-ivory text-center px-4">
                        <span className="text-3xl mb-2">𓅓</span>
                        {t('afterlife.empty', { defaultValue: 'No souls have passed yet...' })}
                    </div>
                )}

                <AnimatePresence>
                    {borneOffPieces.map((piece, idx) => (
                        <motion.div
                            key={piece.id}
                            layoutId={`piece-${piece.id}`}
                            initial={{ scale: 0, opacity: 0, rotate: -45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: idx * 0.05
                            }}
                            className={cn(
                                "relative w-10 h-10 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.1)] flex items-center justify-center transition-all duration-300",
                                // Dark stone/ebony body
                                "bg-gradient-to-b from-[var(--ui-piece-shell-from)] to-[var(--ui-piece-shell-to)] border border-royal-gold/20",
                                piece.player === 'anubis' ? "shadow-[0_0_10px_var(--ui-piece-glow-anubis)]" : "shadow-[0_0_10px_var(--ui-piece-glow-sphinx)]"
                            )}
                        >
                            <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-[var(--ui-piece-core-from)] to-[var(--ui-piece-core-to)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
                                {/* Soul shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-[shimmer_4s_infinite_linear]" />
                                <div
                                    className={cn(
                                        "w-[60%] h-[60%] mask-image-center",
                                        piece.player === 'anubis'
                                            ? "bg-gradient-to-br from-[var(--ui-piece-emblem-anubis-from)] via-[var(--ui-piece-emblem-anubis-via)] to-[var(--ui-piece-emblem-anubis-to)]"
                                            : "bg-gradient-to-br from-[var(--ui-piece-emblem-sphinx-from)] via-[var(--ui-piece-emblem-sphinx-via)] to-[var(--ui-piece-emblem-sphinx-to)]"
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
                    ))}
                </AnimatePresence>
            </div>

            {/* Counters */}
            <div className="mt-4 flex justify-between w-full px-1">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-royal-gold uppercase tracking-widest font-bold mb-1 opacity-70">{t('hud.players.anubis')}</span>
                    <div className="text-xl font-serif text-royal-gold font-bold">
                        {formatNumber(lightPieces.length)}
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-royal-gold/20 self-center" />
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-royal-ivory uppercase tracking-widest font-bold mb-1 opacity-70">{t('hud.players.sphinx')}</span>
                    <div className="text-xl font-serif text-royal-ivory font-bold">
                        {formatNumber(darkPieces.length)}
                    </div>
                </div>
            </div>

            {/* Decorative Edge Detail */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-royal-gold/40" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-royal-gold/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-royal-gold/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-royal-gold/40" />
        </div>
    );
}
