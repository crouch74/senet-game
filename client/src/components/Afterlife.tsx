import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../engine/store'
import {
  afterlifeSelector,
  useShallowSelector,
} from '../engine/selectors'
import { cn } from '../utils/cn'
import { formatNumber } from '../utils/format'
import { playerAnubis, playerSphinx } from '../assets/royal'
import { MaskedSvgIcon } from './common/MaskedSvgIcon'

export function Afterlife() {
  const { board } = useSenetStore(useShallowSelector(afterlifeSelector))
  const { t } = useTranslation()

  const borneOffPieces = board.filter((piece) => piece.position === 31)
  const lightPieces = borneOffPieces.filter((piece) => piece.player === 'anubis')
  const darkPieces = borneOffPieces.filter((piece) => piece.player === 'sphinx')

  return (
    <div className="flex flex-col items-center p-4 bg-ui-header-inner-bg backdrop-blur-md rounded-sm border-[2px] border-royal-gold/40 shadow-[0_15px_35px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden w-full sm:w-64 max-w-full h-full min-h-56 group transition-all duration-500 hover:border-royal-gold/60">
      <h3 className="text-royal-gold font-serif text-sm font-bold tracking-[0.3em] uppercase mb-4 border-b border-royal-gold/20 pb-2 w-full text-center">
        {t('afterlife.title', { defaultValue: 'Afterlife' })}
      </h3>

      <div className="flex-1 w-full bg-ui-panel-strong-bg rounded-sm p-4 shadow-inner flex flex-wrap content-start gap-3 relative overflow-y-auto custom-scrollbar">
        {borneOffPieces.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 italic text-xs text-royal-ivory text-center px-4">
            <span className="text-3xl mb-2">𓅓</span>
            {t('afterlife.empty', { defaultValue: 'No souls have passed yet...' })}
          </div>
        )}

        <AnimatePresence>
          {borneOffPieces.map((piece, index) => {
            const pieceIconPath =
              piece.player === 'anubis' ? playerAnubis : playerSphinx
            const playerTokenClass =
              piece.player === 'anubis' ? 'piece-token--anubis' : 'piece-token--sphinx'

            return (
              <motion.div
                key={piece.id}
                layoutId={`piece-${piece.id}`}
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.05,
                }}
                className={cn(
                  'piece-token piece-token--afterlife relative w-10 h-10 flex items-center justify-center transition-all duration-300',
                  playerTokenClass,
                )}
              >
                <div className="piece-token__core absolute inset-[2px] flex items-center justify-center overflow-hidden">
                  <div className="piece-token__symbol-wrap piece-token__symbol-wrap--small">
                    <MaskedSvgIcon
                      src={pieceIconPath}
                      className="piece-token__symbol piece-token__symbol--cavity"
                    />
                    <MaskedSvgIcon
                      src={pieceIconPath}
                      className="piece-token__symbol piece-token__symbol--shadow"
                    />
                    <MaskedSvgIcon
                      src={pieceIconPath}
                      className="piece-token__symbol piece-token__symbol--base"
                    />
                    <MaskedSvgIcon
                      src={pieceIconPath}
                      className="piece-token__symbol piece-token__symbol--edge"
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-between w-full px-1">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-royal-gold uppercase tracking-widest font-bold mb-1 opacity-70">
            {t('hud.players.anubis')}
          </span>
          <div className="text-xl font-serif text-royal-gold font-bold">
            {formatNumber(lightPieces.length)}
          </div>
        </div>
        <div className="h-8 w-[1px] bg-royal-gold/20 self-center" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-royal-ivory uppercase tracking-widest font-bold mb-1 opacity-70">
            {t('hud.players.sphinx')}
          </span>
          <div className="text-xl font-serif text-royal-ivory font-bold">
            {formatNumber(darkPieces.length)}
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-royal-gold/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-royal-gold/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-royal-gold/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-royal-gold/40" />
    </div>
  )
}
