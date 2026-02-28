import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, RotateCcw, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../engine/store'
import {
  gameOverSelector,
  useShallowSelector,
} from '../engine/selectors'
import { cn } from '../utils/cn'
import { createLogger } from '../services/logger'
import { getIsWinner } from './gameOver/winnerStatus'

interface GameOverProps {
  onReturnToLobby: () => void
}

const logger = createLogger('Game')

const PARTICLES = Array.from({ length: 20 }, (_, index) => ({
  leftPct: (index * 37) % 100,
  duration: 5 + (index % 5),
  delay: (index % 7) * 0.55,
}))

export function GameOver({ onReturnToLobby }: GameOverProps) {
  const {
    isOnline,
    localPlayer,
    offlineHumanPlayer,
    offlineMode,
    resetGame,
    winner,
  } = useSenetStore(useShallowSelector(gameOverSelector))
  const { t } = useTranslation()

  useEffect(() => {
    if (winner) {
      logger.info(`Journey through the Duat completed. Winner: ${winner}`)
    }
  }, [winner])

  if (!winner) return null

  const isWinner = getIsWinner({
    isOnline,
    localPlayer,
    offlineHumanPlayer,
    offlineMode,
    winner,
  })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ebony/90 backdrop-blur-md"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((particle, index) => (
            <motion.div
              key={index}
              className="absolute w-2 h-2 bg-gold/20 rounded-full"
              style={{ left: `${particle.leftPct}%` }}
              initial={{ y: '110vh' }}
              animate={{
                y: '-10vh',
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.2 }}
          className="relative max-w-lg w-full bg-ui-gameover-surface border-2 border-royal-gold/50 rounded-xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_var(--ui-piece-glow-anubis)] text-center overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, var(--ui-gameover-pattern-dot) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-royal-gold/10 border-2 border-royal-gold mb-6 shadow-[0_0_20px_var(--ui-piece-glow-anubis)]"
          >
            <Trophy className="w-10 h-10 text-royal-gold" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-serif text-royal-gold mb-2 tracking-widest uppercase">
            {t('throw.game_over')}
          </h1>

          <h2 className="text-2xl font-bold text-sand mb-6 tracking-tight">
            {t('throw.ascension')}
          </h2>

          <div className="space-y-4 mb-10">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'text-3xl font-bold px-6 py-2 rounded-lg border',
                  winner === 'anubis'
                    ? 'bg-royal-gold/20 border-royal-gold text-royal-gold'
                    : 'bg-royal-ebony/40 border-royal-gold/30 text-sand',
                )}
              >
                {t(`hud.players.${winner}`)}{' '}
                {t('app.wins', { defaultValue: 'WINS' })}
              </div>
            </div>

            <p className="text-sand/70 italic text-lg max-w-sm mx-auto leading-relaxed">
              {isWinner ? t('throw.victory_message') : t('throw.defeat_message')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <button
              onClick={resetGame}
              className="flex items-center justify-center gap-2 bg-royal-gold hover:bg-gold text-ui-turn-pill-foreground font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              {t('throw.play_again')}
            </button>

            <button
              onClick={onReturnToLobby}
              className="flex items-center justify-center gap-2 bg-ui-gameover-secondary-bg hover:bg-ui-gameover-secondary-bg-hover text-sand border border-sand/20 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            >
              <Home className="w-5 h-5" />
              {t('throw.return_to_lobby')}
            </button>
          </div>

          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-royal-gold/30 rounded-tl-xl p-2">
            <div className="w-full h-full border-t border-l border-royal-gold/10" />
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-royal-gold/30 rounded-tr-xl p-2">
            <div className="w-full h-full border-t border-r border-royal-gold/10" />
          </div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-royal-gold/30 rounded-bl-xl p-2">
            <div className="w-full h-full border-b border-l border-royal-gold/10" />
          </div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-royal-gold/30 rounded-br-xl p-2">
            <div className="w-full h-full border-b border-r border-royal-gold/10" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
