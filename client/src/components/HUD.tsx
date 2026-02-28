import { Home, Scroll } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../engine/store'
import {
  hudStoreSelector,
  useShallowSelector,
} from '../engine/selectors'
import { cn } from '../utils/cn'
import { THEMES, type ThemeId } from '../theme'
import { getDevAutoplayConfig } from './hud/devAutoplay'
import { getPlayerAppearance } from '../utils/playerAppearance'
import { getPlayerLabel } from '../utils/gameLabels'
import { LANGUAGE_OPTIONS } from '../i18n'

interface HUDProps {
  isLobby?: boolean
  onReturnToLobby?: () => void
  onBackToGames?: () => void
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

export function HUD({
  isLobby = false,
  onReturnToLobby,
  onBackToGames,
  theme,
  setTheme,
}: HUDProps) {
  const {
    currentPlayer,
    gameType,
    isAutoPlaying,
    isOnline,
    playRandomTurns,
    resetGame,
    ruleset,
    setShowGuide,
    winner,
  } = useSenetStore(useShallowSelector(hudStoreSelector))
  const { t, i18n } = useTranslation()

  const handleDevAutoplay = () => {
    if (isAutoPlaying) return

    const config = getDevAutoplayConfig()
    if (!config) return

    playRandomTurns(config.turnsCount, config.speed)
  }

  const currentPlayerAppearance = getPlayerAppearance(currentPlayer)

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-5 w-full p-4 sm:p-5 md:p-6 bg-ui-header-bg backdrop-blur-md rounded-md border-b-2 border-ui-header-border shadow-[0_20px_30px_rgba(0,0,0,0.8),inset_0_2px_10px_var(--ui-header-shadow-inset)] mb-5 md:mb-8 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-royal-gold to-transparent opacity-80" />

        <div className="flex flex-col w-full lg:w-auto">
          <div className="flex items-center gap-3">
            {onBackToGames && (
              <button
                onClick={onBackToGames}
                className="p-1.5 hover:bg-royal-gold/10 text-royal-gold/60 hover:text-royal-gold border border-royal-gold/20 rounded transition-all group"
                title={t('hud.back_to_games', { defaultValue: 'Back to Games' })}
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-royal-gold tracking-[0.2em] sm:tracking-[0.26em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold">
              {t(`games.${gameType}.title`)}
            </h1>
          </div>
          <div className="text-royal-ivory/80 text-xs sm:text-sm mt-1 uppercase tracking-[0.2em] sm:tracking-widest font-mono opacity-90">
            {t('hud.rules', { name: t(`ruleset.names.${ruleset.id}`) })}
          </div>
        </div>

        <div className="flex flex-col items-center w-full lg:w-auto lg:flex-1 my-1 sm:my-2 lg:my-0 relative">
          {!isLobby &&
            (winner ? (
              <div className="text-xl sm:text-2xl lg:text-3xl text-center font-bold text-royal-gold animate-[pulse_2s_ease-in-out_infinite] tracking-wide uppercase drop-shadow-lg">
                {t('hud.wins', { player: getPlayerLabel(t, gameType, winner) })}
              </div>
            ) : (
              <div className="flex items-center justify-center w-full sm:w-auto gap-3 sm:gap-6 p-2.5 sm:p-3 bg-ui-header-inner-bg rounded border border-royal-gold/20 shadow-inner">
                <div className="text-xs sm:text-sm text-royal-ivory/80 font-mono tracking-[0.2em] sm:tracking-widest uppercase whitespace-nowrap">
                  {t('hud.current_turn')}
                </div>
                <div
                  className={cn(
                    'px-4 sm:px-6 py-1.5 rounded-sm font-bold uppercase tracking-[0.12em] sm:tracking-widest text-xs sm:text-sm shadow-[0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300 border whitespace-nowrap',
                    currentPlayerAppearance.pillClassName,
                  )}
                >
                  {getPlayerLabel(t, gameType, currentPlayer)}
                </div>
              </div>
            ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto lg:justify-end">
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 px-3 h-10 bg-royal-gold/10 hover:bg-royal-gold/20 text-royal-gold border border-royal-gold/30 rounded-sm transition-all cursor-pointer group whitespace-nowrap grow sm:grow-0"
            title={t('legend.registry_title')}
          >
            <Scroll className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xs uppercase tracking-widest font-bold hidden sm:block">
              {t('guide.button_label')}
            </span>
          </button>

          <select
            className="bg-ui-input-bg text-royal-ivory border-[1.5px] border-royal-gold/60 rounded-sm px-3 py-1 text-sm outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold/50 h-10 font-serif tracking-wider shadow-inner hover:bg-ui-input-bg-hover transition-colors min-w-[7.5rem] grow sm:grow-0"
            value={i18n.language}
            onChange={(event) => i18n.changeLanguage(event.target.value)}
            aria-label={t('hud.language')}
          >
            {LANGUAGE_OPTIONS.map((languageOption) => (
              <option key={languageOption.value} value={languageOption.value}>
                {languageOption.label}
              </option>
            ))}
          </select>

          <select
            className="bg-ui-input-bg text-royal-ivory border-[1.5px] border-royal-gold/60 rounded-sm px-3 py-1 text-sm outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold/50 h-10 font-serif tracking-wider shadow-inner hover:bg-ui-input-bg-hover transition-colors min-w-[10.5rem] grow sm:grow-0"
            value={theme}
            onChange={(event) => setTheme(event.target.value as ThemeId)}
            aria-label={t('hud.theme')}
            title={t('hud.theme')}
          >
            {THEMES.map((themeOption) => (
              <option key={themeOption.id} value={themeOption.id}>
                {t(themeOption.labelKey)}
              </option>
            ))}
          </select>

          {!isOnline && !isLobby && (
            <button
              onClick={resetGame}
              className="px-3 sm:px-4 py-2 h-10 bg-ui-paper-surface hover:bg-ui-paper-surface-hover text-ui-paper-text border-[2px] border-royal-gold/60 rounded-sm transition-all font-serif shadow-sm text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-widest font-bold hover:shadow-[0_0_15px_var(--ui-piece-glow-anubis)] hover:scale-105 whitespace-nowrap cursor-pointer grow sm:grow-0"
            >
              {t('hud.restart_game')}
            </button>
          )}

          {onReturnToLobby && (
            <button
              onClick={onReturnToLobby}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 h-10 bg-ui-secondary-button-bg hover:bg-ui-secondary-button-bg-hover text-sand border-[2px] border-sand/20 rounded-sm transition-all font-serif shadow-sm text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-widest font-bold whitespace-nowrap cursor-pointer grow sm:grow-0"
            >
              <Home className="w-4 h-4" />
              {t('throw.return_to_lobby')}
            </button>
          )}
        </div>
      </div>

      {import.meta.env.DEV && !isOnline && !isLobby && (
        <button
          onClick={handleDevAutoplay}
          disabled={isAutoPlaying}
          className="fixed right-0 top-1/2 z-[60] -translate-y-1/2 rounded-l-sm border-[2px] border-r-0 border-royal-blue/70 bg-royal-blue/55 px-3 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-royal-ivory shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-colors hover:bg-royal-blue/75 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isAutoPlaying ? 'Dev: Auto Playing...' : 'Dev: Auto Play'}
        </button>
      )}
    </>
  )
}
