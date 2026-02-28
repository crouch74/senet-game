import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../../../engine/store'
import {
  afterlifeSelector,
  useShallowSelector,
} from '../../../engine/selectors'
import { cn } from '../../../utils/cn'
import { formatNumber } from '../../../utils/format'
import { MaskedSvgIcon } from '../../../components/common/MaskedSvgIcon'
import { getPlayerAppearance } from '../../../utils/playerAppearance'

export function Afterlife() {
  const { board, boardSize, gameType } = useSenetStore(
    useShallowSelector(afterlifeSelector),
  )
  const { t } = useTranslation()

  const finishedPosition = gameType === 'mehen' ? (boardSize ?? 60) : 31
  const finishedPieces = board.filter((piece) => piece.position === finishedPosition)
  const players = [...new Set(board.map((piece) => piece.player))]

  return (
    <div className="flex flex-col items-center p-4 bg-ui-header-inner-bg backdrop-blur-md rounded-sm border-[2px] border-royal-gold/40 shadow-[0_15px_35px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden w-full sm:w-64 max-w-full h-full min-h-56 group transition-all duration-500 hover:border-royal-gold/60">
      <h3 className="text-royal-gold font-serif text-sm font-bold tracking-[0.3em] uppercase mb-4 border-b border-royal-gold/20 pb-2 w-full text-center">
        {t(`afterlife.${gameType}.title`, {
          defaultValue: t('afterlife.title', { defaultValue: 'Afterlife' }),
        })}
      </h3>

      <div className="flex-1 w-full bg-ui-panel-strong-bg rounded-sm p-4 shadow-inner flex flex-wrap content-start gap-3 relative overflow-y-auto custom-scrollbar">
        {finishedPieces.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 italic text-xs text-royal-ivory text-center px-4">
            <span className="text-3xl mb-2">{gameType === 'mehen' ? '𓆙' : '𓅓'}</span>
            {t(`afterlife.${gameType}.empty`, {
              defaultValue: t('afterlife.empty', { defaultValue: 'No souls have passed yet...' }),
            })}
          </div>
        )}

        <AnimatePresence>
          {finishedPieces.map((piece, index) => {
            const appearance = getPlayerAppearance(piece.player)

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
                  appearance.tokenClassName,
                )}
              >
                <div className="piece-token__core absolute inset-[2px] flex items-center justify-center overflow-hidden">
                  <div className="piece-token__symbol-wrap piece-token__symbol-wrap--small">
                    <MaskedSvgIcon
                      src={appearance.iconPath}
                      className="piece-token__symbol piece-token__symbol--cavity"
                    />
                    <MaskedSvgIcon
                      src={appearance.iconPath}
                      className="piece-token__symbol piece-token__symbol--shadow"
                    />
                    <MaskedSvgIcon
                      src={appearance.iconPath}
                      className="piece-token__symbol piece-token__symbol--base"
                    />
                    <MaskedSvgIcon
                      src={appearance.iconPath}
                      className="piece-token__symbol piece-token__symbol--edge"
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid w-full grid-cols-2 md:grid-cols-3 gap-3 px-1">
        {players.map((player) => {
          const playerCount = finishedPieces.filter((piece) => piece.player === player).length
          const appearance = getPlayerAppearance(player)

          return (
            <div key={player} className="flex flex-col items-center">
              <div className="mb-1 flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', appearance.accentClassName)} />
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 text-center text-sand">
                  {t(`hud.players.${player}`)}
                </span>
              </div>
              <div className="text-xl font-serif text-royal-ivory font-bold">
                {formatNumber(playerCount)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-royal-gold/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-royal-gold/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-royal-gold/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-royal-gold/40" />
    </div>
  )
}
