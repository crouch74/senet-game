import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';

export function ThrowSticks() {
    const { currentThrow, throwSticks, currentPlayer, winner } = useSenetStore();
    const { t } = useTranslation();

    const handleThrow = () => {
        if (!currentThrow && !winner) {
            throwSticks();
        }
    };

    return (
        <div className="flex flex-col items-center mt-8 p-6 bg-[#fcf8ed] rounded-sm border-[2px] border-royal-gold/80 shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(212,175,55,0.05)] relative overflow-hidden max-w-lg mx-auto w-full">
            {/* Lotus/Gold decorative borders */}
            <div className="absolute top-2 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-royal-gold to-transparent opacity-60" />
            <div className="absolute bottom-2 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-royal-gold to-transparent opacity-60" />

            <div className="text-xl font-serif text-[#1a1110] font-bold tracking-widest uppercase mb-6 drop-shadow-sm">
                {t('throw.turn', { player: t(`hud.players.${currentPlayer}`) })}
            </div>

            <div className="flex gap-4 min-h-[120px] items-center justify-center relative">
                {currentThrow ? (
                    // Show the result
                    Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                            key={`stick-${i}`}
                            initial={{ y: -50, rotate: -180, opacity: 0 }}
                            animate={{ y: 0, rotate: 0, opacity: 1 }}
                            transition={{
                                type: 'spring',
                                bounce: 0.5,
                                duration: 0.6,
                                delay: i * 0.1
                            }}
                            className={cn(
                                "w-6 h-24 rounded-full shadow-lg border-2 relative overflow-hidden",
                                i < currentThrow.lightSidesUp
                                    ? "bg-[#e8e2d2] border-royal-gold/40 shadow-[inset_0_0_10px_rgba(255,255,255,0.8)]" // Light side up (Ivory)
                                    : "bg-[#1a1110] border-black shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]" // Dark side up (Ebony)
                            )}
                        >
                            {/* Material texture/shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay" />
                            {i < currentThrow.lightSidesUp ? (
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent transform -skew-x-12 animate-[shimmer_2s_ease-out]" />
                            ) : (
                                <div className="w-full h-full rounded-full flex flex-col items-center justify-evenly py-2 relative z-10">
                                    {/* Gold inlaid details on dark side */}
                                    <div className="w-1.5 h-1.5 rounded-full bg-royal-gold/80 shadow-[0_0_2px_rgba(212,175,55,1)]" />
                                    <div className="w-1.5 h-4 rounded-full bg-royal-gold/80 shadow-[0_0_2px_rgba(212,175,55,1)]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-royal-gold/80 shadow-[0_0_2px_rgba(212,175,55,1)]" />
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    // Idle state (waiting to throw)
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleThrow}
                        className="flex items-center gap-4 group cursor-pointer"
                        disabled={!!winner}
                    >
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={`idle-stick-${i}`}
                                className="w-6 h-24 rounded-full bg-[#d3ccb8] border-2 border-royal-gold/60 shadow-[0_5px_15px_rgba(0,0,0,0.2),inset_0_2px_5px_rgba(255,255,255,0.5)] group-hover:bg-[#fcf8ed] group-hover:border-royal-gold transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            </div>
                        ))}
                    </motion.button>
                )}
            </div>

            <div className="mt-8 h-12 flex items-center justify-center">
                {currentThrow ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="text-4xl font-bold text-royal-gold drop-shadow-sm font-serif">
                            {t('throw.moves', { value: currentThrow.value })}
                        </div>
                        {currentThrow.value === 5 && (
                            <div className="text-xs text-royal-blue uppercase font-bold tracking-[0.2em] mt-2 opacity-90">
                                {t('throw.perfect_throw')}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="text-[#1a1110]/50 font-bold uppercase tracking-[0.2em] animate-pulse">
                        {winner ? t('throw.game_over') : t('throw.click_to_throw')}
                    </div>
                )}
            </div>
        </div>
    );
}
