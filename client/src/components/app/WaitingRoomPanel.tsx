import { useTranslation } from 'react-i18next'
import type { LocalRole } from '../../engine/network'
import { cn } from '../../utils/cn'
import { CopyRoomButton } from './CopyRoomButton'
import { getPlayerAppearance } from '../../utils/playerAppearance'

interface WaitingRoomPanelProps {
  copiedRoom: boolean
  localPlayer: LocalRole | null
  onCopyRoomId: () => void | Promise<void>
  onLeaveRoom: () => void
  roomId: string | null
}

export function WaitingRoomPanel({
  copiedRoom,
  localPlayer,
  onCopyRoomId,
  onLeaveRoom,
  roomId,
}: WaitingRoomPanelProps) {
  const { t } = useTranslation()
  const playerAppearance =
    localPlayer && localPlayer !== 'spectator'
      ? getPlayerAppearance(localPlayer)
      : null

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
      <div className="flex flex-col items-center gap-8 max-w-lg w-full text-center px-6">
        <div className="flex gap-3 mb-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full bg-royal-gold"
              style={{
                animation: `pulse 1.5s ease-in-out ${index * 0.3}s infinite`,
                opacity: 0.4 + index * 0.2,
              }}
            />
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-serif text-royal-gold tracking-wider uppercase drop-shadow-lg mb-2">
            {t('lobby.waiting_title')}
          </h2>
          <p className="text-sand/60 text-sm uppercase tracking-widest">
            {t('lobby.waiting_subtitle')}
          </p>
        </div>

        {roomId && (
          <div className="w-full bg-ui-panel-strong-bg border border-royal-gold/30 rounded-lg p-5 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="text-sand/50 text-xs uppercase tracking-widest mb-2">
              {t('lobby.room_number')}
            </div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-gold font-mono text-2xl tracking-widest">
                {roomId}
              </span>
              <CopyRoomButton
                buttonId="copy-room-id-waiting"
                copiedRoom={copiedRoom}
                onCopy={onCopyRoomId}
              />
            </div>
            <div className="border-t border-royal-gold/20 pt-4">
              <span className="text-sand/50 text-xs uppercase tracking-widest">
                {t('lobby.waiting_you_are')}
              </span>
              <div
                className={cn(
                  'mt-1 text-lg font-bold uppercase tracking-widest font-serif',
                  playerAppearance ? playerAppearance.pillClassName : 'text-sand',
                )}
              >
                {localPlayer ? t(`hud.players.${localPlayer}`) : ''}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onLeaveRoom}
          className="text-sand/40 hover:text-sand/70 text-xs uppercase tracking-widest underline underline-offset-4 transition-colors cursor-pointer"
        >
          {t('lobby.leave_room')}
        </button>
      </div>
    </div>
  )
}
