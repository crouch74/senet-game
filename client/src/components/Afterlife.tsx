import { useTranslation } from 'react-i18next';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '../utils/format';

export function Afterlife() {
    const { board } = useSenetStore();
    const { t } = useTranslation();

    const borneOffPieces = board.filter(p => p.position === 31);
    const lightPieces = borneOffPieces.filter(p => p.player === 'light');
    const darkPieces = borneOffPieces.filter(p => p.player === 'dark');

    return (
        <div className="flex flex-col items-center p-4 bg-[#1A1110]/60 backdrop-blur-md rounded-sm border-[2px] border-royal-gold/40 shadow-[0_15px_35px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden w-64 h-full group transition-all duration-500 hover:border-royal-gold/60">
            {/* Title */}
            <h3 className="text-royal-gold font-serif text-sm font-bold tracking-[0.3em] uppercase mb-4 border-b border-royal-gold/20 pb-2 w-full text-center">
                {t('afterlife.title', { defaultValue: 'Afterlife' })}
            </h3>

            {/* Box Interior */}
            <div className="flex-1 w-full bg-black/40 rounded-sm p-4 shadow-inner flex flex-wrap content-start gap-3 relative overflow-y-auto custom-scrollbar">
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
                                "bg-gradient-to-b from-[#3a2f2a] to-[#120c0a] border border-royal-gold/20",
                                piece.player === 'light' ? "shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "shadow-[0_0_10px_rgba(255,255,240,0.3)]"
                            )}
                        >
                            <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-[#1a1110] to-[#0a0705] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
                                {/* Soul shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-[shimmer_4s_infinite_linear]" />
                                <div
                                    className={cn(
                                        "w-[60%] h-[60%] mask-image-center",
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
                    ))}
                </AnimatePresence>
            </div>

            {/* Counters */}
            <div className="mt-4 flex justify-between w-full px-1">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-royal-gold uppercase tracking-widest font-bold mb-1 opacity-70">{t('hud.players.light')}</span>
                    <div className="text-xl font-serif text-royal-gold font-bold">
                        {formatNumber(lightPieces.length)}
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-royal-gold/20 self-center" />
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-royal-ivory uppercase tracking-widest font-bold mb-1 opacity-70">{t('hud.players.dark')}</span>
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
