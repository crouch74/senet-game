import { Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'

interface CopyRoomButtonProps {
  buttonId?: string
  copiedRoom: boolean
  onCopy: () => void | Promise<void>
}

export function CopyRoomButton({
  buttonId,
  copiedRoom,
  onCopy,
}: CopyRoomButtonProps) {
  const { t } = useTranslation()

  return (
    <button
      id={buttonId}
      onClick={onCopy}
      title={t('lobby.copy_room')}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer',
        copiedRoom
          ? 'bg-green-900/40 border-green-500/50 text-green-400'
          : 'bg-sand/10 border-sand/20 text-sand/70 hover:bg-sand/20 hover:text-sand',
      )}
    >
      {copiedRoom ? (
        <>
          <Check className="w-3.5 h-3.5" />
          {t('lobby.copied')}
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {t('lobby.copy')}
        </>
      )}
    </button>
  )
}
