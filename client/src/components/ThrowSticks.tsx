import { motion } from 'framer-motion';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';

export function ThrowSticks() {
    const { currentThrow, throwSticks, currentPlayer, winner } = useSenetStore();

    const handleThrow = () => {
        if (!currentThrow && !winner) {
            throwSticks();
            // Simple clicking sound could go here
        }
    };

    return (
        <div className="flex flex-col items-center mt-8 p-6 bg-ebony/40 rounded-xl border border-sand/10 shadow-lg">
            <div className="text-xl font-serif text-sand mb-4">
                {currentPlayer.toUpperCase()}'S TURN
            </div>

            <div className="flex gap-4 min-h-[120px] items-center justify-center">
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
                                "w-6 h-24 rounded-full shadow-lg border-2",
                                i < currentThrow.lightSidesUp
                                    ? "bg-sand border-amber-200" // Light side up
                                    : "bg-ebony border-stone-700" // Dark side up
                            )}
                        >
                            {i < currentThrow.lightSidesUp ? (
                                <div className="w-full h-full rounded-full opacity-30 bg-amber-800/10" />
                            ) : (
                                <div className="w-full h-full rounded-full flex flex-col items-center justify-evenly py-2">
                                    <div className="w-1 h-1 rounded-full bg-sand/20" />
                                    <div className="w-1 h-3 rounded-full bg-sand/20" />
                                    <div className="w-1 h-1 rounded-full bg-sand/20" />
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
                                className="w-6 h-24 rounded-full bg-ochre/80 border-2 border-amber-900 shadow-xl group-hover:bg-sand transition-colors"
                            />
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
                        <div className="text-3xl font-bold text-gold drop-shadow-md">
                            MOVES: {currentThrow.value}
                        </div>
                        {currentThrow.value === 5 && (
                            <div className="text-sm text-sand/70 uppercase tracking-widest mt-1">
                                Perfect Throw
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="text-sand/50 uppercase tracking-widest animate-pulse">
                        {winner ? 'Game Over' : 'Click sticks to throw'}
                    </div>
                )}
            </div>
        </div>
    );
}
