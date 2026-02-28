import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../engine/store'
import {
  throwSticksStoreSelector,
  useShallowSelector,
} from '../engine/selectors'
import { cn } from '../utils/cn'
import { useThrowSticksState } from '../hooks/useThrowSticksState'

export function ThrowSticks() {
  const { t } = useTranslation()
  const {
    currentPlayer,
    currentThrow,
    isAutoRolling,
    isOnline,
    throwSticks,
    winner,
  } = useSenetStore(useShallowSelector(throwSticksStoreSelector))
  const { handleThrow, isMyTurn, isThrowing, stickLayouts } =
    useThrowSticksState({
      currentPlayer,
      currentThrow,
      isAutoRolling,
      throwSticks,
      winner,
    })

  return (
    <div className="flex flex-col items-center p-4 bg-[var(--ui-panel-bg)] backdrop-blur-sm rounded-sm border-[1px] border-royal-gold/30 shadow-[0_10px_20px_rgba(0,0,0,0.6),inset_0_0_10px_var(--ui-header-shadow-inset)] relative overflow-hidden h-full w-full group">
      <div className="absolute top-2 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-royal-gold to-transparent opacity-60" />
      <div className="absolute bottom-2 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-royal-gold to-transparent opacity-60" />

      <div className="text-base sm:text-xl text-center font-serif text-royal-ivory font-bold tracking-[0.15em] sm:tracking-widest uppercase mb-4 drop-shadow-sm opacity-90 z-10 px-2">
        {t('throw.turn', { player: t(`hud.players.${currentPlayer}`) })}
      </div>

      <div className="relative w-full h-40 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          {isThrowing ? (
            <motion.div
              key="throwing-sticks"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, -5, 5, 0],
              }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="flex gap-2"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={`throwing-stick-${index}`}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 90, 180, 270, 360],
                  }}
                  transition={{
                    y: { duration: 0.3, repeat: Infinity },
                    rotate: {
                      duration: 0.5,
                      repeat: Infinity,
                      ease: 'linear',
                    },
                  }}
                  className="w-4 h-20 rounded-full bg-[var(--ui-stick-light)] border-2 border-[var(--ui-stick-light-border)] shadow-xl"
                />
              ))}
            </motion.div>
          ) : currentThrow && stickLayouts.length > 0 ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {stickLayouts.map((layout, index) => (
                <motion.div
                  key={`stick-${index}`}
                  initial={{
                    x: 0,
                    y: -200,
                    rotate: 720,
                    opacity: 0,
                    scale: 1.5,
                  }}
                  animate={{
                    x: layout.x,
                    y: layout.y,
                    rotate: layout.rotate,
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 12,
                    delay: index * 0.05,
                  }}
                  style={{ zIndex: layout.zIndex }}
                  className={cn(
                    'absolute w-6 h-28 rounded-full shadow-2xl border-2 overflow-hidden',
                    layout.isLight
                      ? 'bg-[var(--ui-stick-light)] border-[var(--ui-stick-light-border)] shadow-[inset_0_0_15px_rgba(255,255,255,0.8),0_10px_20px_rgba(0,0,0,0.4)]'
                      : 'bg-[var(--ui-stick-dark)] border-black shadow-[inset_0_0_15px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.4)]',
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay" />
                  {layout.isLight ? (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent transform -skew-x-12 animate-[shimmer_2s_ease-out]" />
                  ) : (
                    <div className="w-full h-full rounded-full flex flex-col items-center justify-evenly py-3 relative z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-royal-gold/80 shadow-[0_0_4px_rgba(212,175,55,1)]" />
                      <div className="w-2 h-6 rounded-full bg-royal-gold/80 shadow-[0_0_4px_rgba(212,175,55,1)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-royal-gold/80 shadow-[0_0_4px_rgba(212,175,55,1)]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : isMyTurn ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleThrow}
              className={cn(
                'flex items-center gap-4 group cursor-pointer relative z-20',
                winner && 'pointer-events-none opacity-50',
              )}
              disabled={Boolean(winner) || isThrowing}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`idle-stick-${index}`}
                  className="w-6 h-24 rounded-full bg-[var(--ui-stick-light)] border-2 border-royal-gold/60 shadow-[0_5px_15px_rgba(0,0,0,0.2),inset_0_2px_5px_rgba(255,255,255,0.5)] group-hover:bg-[var(--ui-stick-light-hover)] group-hover:border-royal-gold transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </div>
              ))}
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 pointer-events-none"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={`waiting-stick-${index}`}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                    ease: 'easeInOut',
                  }}
                  className="w-6 h-24 rounded-full bg-[var(--ui-stick-waiting)] border-2 border-sand/10 shadow-[0_5px_10px_rgba(0,0,0,0.3)]"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 h-12 flex items-center justify-center z-10">
        {currentThrow && !isThrowing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-royal-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-serif">
              {t('throw.moves', { value: currentThrow.value })}
            </div>
            {currentThrow.value === 5 && (
              <div className="text-xs text-royal-blue uppercase font-bold tracking-[0.2em] mt-2 opacity-90">
                {t('throw.perfect_throw')}
              </div>
            )}
          </motion.div>
        ) : (
          <div
            className={cn(
              'font-bold uppercase tracking-[0.12em] sm:tracking-[0.2em] drop-shadow-md text-sm sm:text-lg -mt-2 transition-transform duration-300 text-center px-2 break-words',
              isMyTurn
                ? 'text-royal-gold animate-pulse group-hover:scale-105'
                : 'text-sand/40 animate-pulse text-sm',
            )}
          >
            {winner
              ? t('throw.game_over')
              : isMyTurn
                ? t('throw.click_to_throw')
                : isOnline
                  ? t('throw.waiting_for_opponent')
                  : t('throw.waiting_for_computer')}
          </div>
        )}
      </div>
    </div>
  )
}
