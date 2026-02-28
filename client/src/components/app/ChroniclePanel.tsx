import { useTranslation } from 'react-i18next'
import type { HistoryEvent } from '../../engine/types'
import { cn } from '../../utils/cn'
import { formatNumber } from '../../utils/format'

interface ChroniclePanelProps {
  historyLog: HistoryEvent[]
}

export function ChroniclePanel({ historyLog }: ChroniclePanelProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-[var(--ui-panel-bg)] border-s-[2px] border-royal-gold/30 rounded-e-lg p-5 flex-1 flex flex-col min-h-0 shadow-inner overflow-hidden">
      <h2 className="text-gold font-serif text-lg border-b border-sand/20 pb-2 mb-2 uppercase tracking-wide shrink-0">
        {t('app.chronicle')}
      </h2>
      <div className="overflow-y-auto overscroll-contain flex flex-col gap-2 text-sm pr-2 custom-scrollbar h-56">
        {historyLog.slice().reverse().map((log, index) => {
          const translatedParams = log.params?.player
            ? { ...log.params, player: t(`hud.players.${log.params.player}`) }
            : log.params

          return (
            <div
              key={`${log.key}-${index}`}
              className="text-sand/80 font-mono flex gap-2 border-b border-sand/5 pb-1 items-start"
            >
              <span className="opacity-70 text-xs mt-0.5 shrink-0" dir="ltr">
                {formatNumber((historyLog.length - index).toString().padStart(3, '0'))}
              </span>
              {log.player && (
                <span
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-[0_0_5px_rgba(0,0,0,0.5)]',
                    log.player === 'anubis'
                      ? 'bg-royal-gold'
                      : 'bg-royal-ebony border border-royal-gold/30',
                  )}
                  title={t(`hud.players.${log.player}`)}
                />
              )}
              <span className="leading-tight break-words">
                {t(log.key, translatedParams)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
