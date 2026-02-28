import { useTranslation } from 'react-i18next'
import { CopyRoomButton } from './CopyRoomButton'

interface OnlineRoomBannerProps {
  copiedRoom: boolean
  localPlayer: 'anubis' | 'sphinx' | 'spectator' | null
  onCopyRoomId: () => void | Promise<void>
  onLeaveRoom: () => void
  roomId: string
}

export function OnlineRoomBanner({
  copiedRoom,
  localPlayer,
  onCopyRoomId,
  onLeaveRoom,
  roomId,
}: OnlineRoomBannerProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-4 flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--ui-panel-strong-bg)] border border-sand/20 rounded-lg p-3 sm:px-4 md:px-6 shadow-md backdrop-blur-sm shrink-0">
      <div className="flex flex-col">
        <span className="text-sand/60 text-xs uppercase tracking-wider font-bold mb-1">
          {t('lobby.room_number')}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-gold font-mono text-xl tracking-widest">
            {roomId}
          </span>
          <CopyRoomButton
            buttonId="copy-room-id"
            copiedRoom={copiedRoom}
            onCopy={onCopyRoomId}
          />
        </div>
      </div>

      <div className="flex flex-col sm:text-right">
        <span className="text-sand/60 text-xs uppercase tracking-wider font-bold mb-1">
          {t('lobby.you_are')}
        </span>
        <span className="text-sand font-bold text-lg capitalize">
          {localPlayer ? t(`hud.players.${localPlayer}`) : ''}
        </span>
      </div>

      <button
        onClick={onLeaveRoom}
        className="w-full sm:w-auto bg-red-900/40 hover:bg-red-900/80 text-sand px-4 py-2 rounded-md text-sm border border-red-500/30 transition-colors shadow-sm sm:ms-4 cursor-pointer"
      >
        {t('lobby.leave_room')}
      </button>
    </div>
  )
}
