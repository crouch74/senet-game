import { useTranslation } from 'react-i18next'
import type { PlayerID, Ruleset } from '../engine/types'
import { cn } from '../utils/cn'
import { formatNumber } from '../utils/format'
import { MaskedSvgIcon } from './common/MaskedSvgIcon'
import type { HouseIcon } from './board/houseIcons'

interface SquareProps {
  currentPlayer: PlayerID
  icon: HouseIcon | null
  isActionableMove: boolean
  isHoveredTarget: boolean
  isLegalMove: boolean
  isRecentlyActivated: boolean
  number: number
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  specialInfo: Ruleset['specialSquares'][number] | undefined
}

export function Square({
  currentPlayer,
  icon,
  isActionableMove,
  isHoveredTarget,
  isLegalMove,
  isRecentlyActivated,
  number,
  onClick,
  onMouseEnter,
  onMouseLeave,
  specialInfo,
}: SquareProps) {
  const { t, i18n } = useTranslation()
  const isSpecial = number >= 26 && number <= 30

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center aspect-square group box-border',
        'bg-[var(--ui-square-base)] transition-all duration-500',
        isRecentlyActivated &&
          'z-30 bg-[var(--ui-square-active)] scale-[1.05] ring-2 ring-white/50 shadow-[0_0_40px_rgba(255,255,255,0.4)] animate-pulse',
        'border-[0.5px] border-black/80',
        'shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(0,0,0,0.4),inset_0_0_10px_rgba(0,0,0,0.7)]',
        'after:absolute after:inset-0 after:bg-gradient-to-tr after:from-black/20 after:to-white/5 after:pointer-events-none',
        isActionableMove &&
          cn(
            'cursor-pointer',
            currentPlayer === 'anubis'
              ? 'ring-1 ring-royal-gold/40 shadow-[inset_0_0_30px_rgba(212,175,55,0.2)]'
              : 'ring-1 ring-royal-ivory/40 shadow-[inset_0_0_30px_rgba(255,255,240,0.2)]',
          ),
        isHoveredTarget &&
          cn(
            'z-20 scale-[1.02] bg-[var(--ui-square-hover)]',
            currentPlayer === 'anubis'
              ? 'ring-2 ring-royal-gold shadow-[0_10px_30px_rgba(212,175,55,0.4),inset_0_0_40px_rgba(212,175,55,0.2)]'
              : 'ring-2 ring-royal-ivory shadow-[0_10px_30px_rgba(255,255,240,0.4),inset_0_0_40px_rgba(255,255,240,0.2)]',
          ),
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {isSpecial && (
        <div className="absolute inset-[3px] border-[0.5px] border-[var(--ui-square-special-border)] pointer-events-none mix-blend-overlay" />
      )}

      <div className="absolute top-1 left-[6px] text-[10px] text-royal-ivory/40 font-mono z-10 pointer-events-none">
        {formatNumber(number)}
      </div>

      {icon?.type === 'text' && (
        <div
          className={cn(
            'text-3xl opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]',
            icon.className || 'text-royal-ivory/40',
          )}
          style={icon.style}
        >
          {icon.value}
        </div>
      )}

      {icon?.type === 'svg' && (
        <div
          className={cn(
            'relative group-hover:scale-105 transition-transform duration-500 opacity-90',
            (icon.repeat || 1) > 1
              ? icon.stack
                ? 'w-[45%] h-[80%] flex flex-col items-center justify-center gap-0.5'
                : 'w-4/5 h-[45%] flex flex-row items-center justify-center gap-1'
              : 'w-3/5 h-3/5',
          )}
        >
          {Array.from({ length: icon.repeat || 1 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'relative w-full h-full',
                (icon.repeat || 1) === 1 && 'absolute inset-0',
              )}
            >
              <MaskedSvgIcon
                src={icon.value}
                className={cn(
                  'absolute inset-0 transition-all duration-700',
                  icon.backgroundClassName,
                )}
                style={
                  isLegalMove
                    ? {
                        backgroundColor: 'var(--ui-piece-legal-ring)',
                        filter:
                          'drop-shadow(0 0 5px var(--ui-piece-legal-ring))',
                      }
                    : icon.backgroundStyle
                }
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-300" />
                <div className="absolute -inset-full animate-[shimmer_3s_infinite_linear] bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 opacity-0 group-hover:opacity-100" />
              </MaskedSvgIcon>
              <MaskedSvgIcon
                src={icon.value}
                className="absolute inset-0 pointer-events-none opacity-60 mix-blend-multiply translate-y-[1.5px] blur-[0.5px] bg-black"
              />
              <MaskedSvgIcon
                src={icon.value}
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay -translate-y-[0.5px] bg-white"
              />
            </div>
          ))}
        </div>
      )}

      {isLegalMove && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-1 h-[2px] animate-pulse transition-all duration-300',
            currentPlayer === 'anubis'
              ? 'bg-gradient-to-r from-transparent via-royal-gold to-transparent shadow-[0_0_12px_rgba(212,175,55,0.8)]'
              : 'bg-gradient-to-r from-transparent via-royal-ivory to-transparent shadow-[0_0_12px_rgba(255,255,240,0.8)]',
            isHoveredTarget &&
              'h-[4px] bottom-0 opacity-100 via-white shadow-[0_0_20px_rgba(255,255,255,0.6)]',
          )}
        />
      )}

      {specialInfo && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 flex justify-center z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="w-[240px] shrink-0 p-3 bg-[var(--ui-tooltip-bg)] border-[2px] border-royal-gold shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-[var(--ui-tooltip-text)] text-xs rounded-sm text-start"
            dir={i18n.language === 'ar-EG' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center gap-2 border-b border-royal-gold/20 pb-2 mb-2">
              {icon?.type === 'svg' && (
                <img src={icon.value} alt="icon" className="w-5 h-5 opacity-80" />
              )}
              <div className="font-bold text-royal-gold drop-shadow-sm uppercase tracking-wider text-sm">
                {t(`square.names.${number}`)}
              </div>
            </div>

            <div className="mb-2">
              <div className="font-serif font-bold text-[var(--ui-tooltip-accent)] mb-0.5">
                {t('square.effect', {
                  effect: t(`square.effects.${specialInfo.effect}`),
                })}
              </div>
              {specialInfo.requiredThrow && (
                <div className="font-serif text-[var(--ui-tooltip-text)] opacity-80">
                  {t('square.requires_throw', {
                    num: formatNumber(specialInfo.requiredThrow),
                  })}
                </div>
              )}
              {!specialInfo.canBypass && (
                <div className="text-royal-blue font-bold text-[10px] uppercase mt-0.5 opacity-90">
                  {t('square.cannot_bypass')}
                </div>
              )}
            </div>

            <div className="border-t border-royal-gold/20 pt-2 mt-2">
              <div className="text-[10px] text-royal-gold font-bold uppercase tracking-widest mb-1 opacity-80">
                {t('square.lore')}
              </div>
              <div className="font-serif text-[var(--ui-tooltip-text)] opacity-70 italic leading-relaxed">
                {t(`square.contexts.${number}`)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
