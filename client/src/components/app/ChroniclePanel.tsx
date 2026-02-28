import { useTranslation } from 'react-i18next'
import type { GameType, HistoryEvent } from '../../engine/types'
import { cn } from '../../utils/cn'
import { formatNumber } from '../../utils/format'
import { getPlayerAppearance } from '../../utils/playerAppearance'
import { getPieceLabel, getPlayerLabel } from '../../utils/gameLabels'

interface ChroniclePanelProps {
  gameType: GameType
  historyLog: HistoryEvent[]
}

const PLAYER_IDS = new Set([
  'anubis',
  'sphinx',
  'horus',
  'seth',
  'osiris',
  'isis',
  'spectator',
])

const localizePlayer = (
  value: unknown,
  gameType: GameType,
  t: ReturnType<typeof useTranslation>['t'],
) => {
  if (typeof value !== 'string' || !PLAYER_IDS.has(value)) return value
  return getPlayerLabel(t, gameType, value)
}

const localizePiece = (
  value: unknown,
  gameType: GameType,
  t: ReturnType<typeof useTranslation>['t'],
) => {
  if (typeof value !== 'string') return value

  const match = value.match(
    /^(anubis|sphinx|horus|seth|osiris|isis)-(lion|ball|peg|senet_piece)(?:-(\d+))?$/,
  )
  if (!match) return value

  const [, owner, type, ordinal] = match
  const ownerLabel = getPlayerLabel(t, gameType, owner as never)
  const typeLabel = getPieceLabel(t, gameType, type as never)
  return ordinal
    ? `${ownerLabel} ${typeLabel} ${formatNumber(ordinal)}`
    : `${ownerLabel} ${typeLabel}`
}

const localizeNumberish = (value: unknown) =>
  typeof value === 'number' || typeof value === 'string'
    ? formatNumber(value)
    : value

export function ChroniclePanel({ gameType, historyLog }: ChroniclePanelProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-ui-panel-bg border-s-[2px] border-royal-gold/30 rounded-e-lg p-5 flex-1 flex flex-col min-h-0 shadow-inner overflow-hidden">
      <h2 className="text-gold font-serif text-lg border-b border-sand/20 pb-2 mb-2 uppercase tracking-wide shrink-0">
        {t('app.chronicle')}
      </h2>
      <div className="overflow-y-auto overscroll-contain flex flex-col gap-2 text-sm pr-2 custom-scrollbar h-56">
        {historyLog.slice().reverse().map((log, index) => {
          const mergedParams: Record<string, unknown> = {
            from: log.from,
            to: log.to,
            turn: log.turn,
            roll: log.roll,
            piece: log.piece ?? log.pieceId,
            player: log.player,
            ...log.params,
          }

          const translatedParams = {
            ...mergedParams,
            player: localizePlayer(mergedParams.player, gameType, t),
            piece: localizePiece(mergedParams.piece, gameType, t),
            from: localizeNumberish(mergedParams.from),
            to: localizeNumberish(mergedParams.to),
            turn: localizeNumberish(mergedParams.turn),
            roll: localizeNumberish(mergedParams.roll),
            pos: localizeNumberish(mergedParams.pos),
          }

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
                    getPlayerAppearance(log.player).accentClassName,
                  )}
                  title={getPlayerLabel(t, gameType, log.player)}
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
