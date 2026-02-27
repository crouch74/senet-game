import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Board } from './components/Board';
import { HUD } from './components/HUD';
import { ThrowSticks } from './components/ThrowSticks';
import { Afterlife } from './components/Afterlife';
import { Lobby } from './components/Lobby';
import { GameOver } from './components/GameOver';
import { GuideModal } from './components/GuideModal';
import { useSenetStore } from './engine/store';
import { cn } from './utils/cn';
import { formatNumber } from './utils/format';

function App() {
  const { historyLog, ruleset, isOnline, roomId, localPlayer, leaveRoom, winner, showGuide, setShowGuide } = useSenetStore();
  const { t, i18n } = useTranslation();
  const [showLobby, setShowLobby] = useState(true);

  const handleReturnToLobby = () => {
    if (isOnline) {
      leaveRoom();
    }
    setShowLobby(true);
  };

  // Auto-hide lobby when playing online
  useEffect(() => {
    if (isOnline) {
      setShowLobby(false);
    }
  }, [isOnline]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar-EG' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <div className={`h-screen bg-ebony text-sand flex flex-col font-sans selection:bg-gold/30 overflow-hidden ${i18n.language === 'ar-EG' ? 'font-arabic' : ''}`}>
      {/* Background thematic elements */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sand via-ebony to-ebony" />
      <div className="noise-overlay" />

      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
      {winner && <GameOver onReturnToLobby={handleReturnToLobby} />}

      {/* SVG Filters for micro-imperfections */}
      <svg aria-hidden="true" className="sr-only">
        <filter id="jitter">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
          <feOffset dx="0.5" dy="0.5" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
        </filter>
      </svg>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col relative z-10 min-h-0">
        <HUD isLobby={showLobby} />

        <div className="flex-1 flex flex-col xl:flex-row gap-8 items-stretch justify-center min-h-0">
          {(!showLobby || isOnline) ? (
            <>
              {/* Main Game Area */}
              <div className="flex-1 w-full flex flex-col items-center justify-center order-2 xl:order-1 min-h-0">
                {isOnline && roomId && (
                  <div className="mb-4 flex items-center justify-between w-full max-w-5xl bg-black/40 border border-sand/20 rounded-lg p-3 px-6 shadow-md backdrop-blur-sm shrink-0">
                    <div className="flex flex-col">
                      <span className="text-sand/60 text-xs uppercase tracking-wider font-bold mb-1">Room</span>
                      <span className="text-gold font-mono text-xl">{roomId}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-sand/60 text-xs uppercase tracking-wider font-bold mb-1">You Are</span>
                      <span className="text-sand font-bold text-lg capitalize">{localPlayer ? t(`app.players.${localPlayer}`, { defaultValue: localPlayer }) : ''}</span>
                    </div>
                    <button
                      onClick={() => { leaveRoom(); setShowLobby(true); }}
                      className="bg-red-900/40 hover:bg-red-900/80 text-sand px-4 py-2 rounded-md text-sm border border-red-500/30 transition-colors shadow-sm ml-4 cursor-pointer"
                    >
                      Leave Room
                    </button>
                  </div>
                )}
                <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
                  <Board />
                  <div className="w-full max-w-5xl mt-12 mb-8 bg-black/30 border border-royal-gold/20 rounded-lg p-6 shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-stretch gap-8 backdrop-blur-sm">
                    <div className="flex-1 w-full md:w-auto flex flex-col border-e border-royal-gold/10 md:pe-8">
                      <ThrowSticks />
                    </div>
                    <div className="shrink-0 md:ps-4 flex flex-col h-full">
                      <Afterlife />
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Panel: History & Rules Info */}
              <div className="w-full xl:w-96 flex flex-col h-full min-h-0 gap-8 order-1 xl:order-2 shrink-0">
                <div className="bg-black/20 border-s-[2px] border-royal-gold/30 rounded-e-lg p-5 flex-1 flex flex-col min-h-0 shadow-inner overflow-hidden">
                  <h2 className="text-gold font-serif text-lg border-b border-sand/20 pb-2 mb-2 uppercase tracking-wide shrink-0">
                    {t('app.chronicle')}
                  </h2>
                  <div className="overflow-y-auto flex-1 flex flex-col gap-2 text-sm pr-2 custom-scrollbar min-h-0">
                    {historyLog.slice().reverse().map((log, i) => {
                      const translatedParams = log.params?.player
                        ? { ...log.params, player: t(`hud.players.${log.params.player}`) }
                        : log.params;
                      return (
                        <div key={i} className="text-sand/80 font-mono flex gap-2 border-b border-sand/5 pb-1 items-start">
                          <span className="opacity-70 text-xs mt-0.5 shrink-0" dir="ltr">{formatNumber((historyLog.length - i).toString().padStart(3, '0'))}</span>
                          {log.player && (
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-[0_0_5px_rgba(0,0,0,0.5)]",
                                log.player === 'light' ? "bg-royal-gold" : "bg-royal-ebony border border-royal-gold/30"
                              )}
                              title={t(`hud.players.${log.player}`)}
                            />
                          )}
                          <span className="leading-tight">{t(log.key, translatedParams)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-ochre/5 border-s-[2px] border-ochre/40 rounded-e-lg p-5 text-sm shadow-inner shrink-0">
                  <h3 className="text-ochre font-bold mb-2 flex items-center gap-2">
                    <span>📜</span> {t('app.rules_title', { name: t(`ruleset.names.${ruleset.id}`) })}
                  </h3>
                  <p className="text-sand/80 mb-3 text-xs leading-relaxed italic border-b border-sand/20 pb-2">
                    {t(`ruleset.descriptions.${ruleset.id}`)}
                  </p>
                  <ul className="text-sand/80 text-xs flex flex-col gap-1.5 list-none m-0 p-0">
                    <li><strong className="text-sand">{t('app.capture_mode')}</strong> {ruleset.captureMode === 'swap' ? t('app.swap_positions') : t('app.forward_only')}</li>
                    <li><strong className="text-sand">{t('app.protected_adjacency')}</strong> {ruleset.protectedAdjacency ? t('app.yes_pieces', { num: formatNumber(ruleset.protectedAdjacencyCount) }) : t('app.no')}</li>
                    <li><strong className="text-sand">{t('app.blockades')}</strong> {ruleset.blockadeLength > 0 ? t('app.yes_pieces', { num: formatNumber(ruleset.blockadeLength) }) : t('app.no')}</li>
                    <li><strong className="text-sand">{t('app.bearing_off')}</strong> {ruleset.bearingOffRequirements === 'exact' ? t('app.requires_exact_throw') : t('app.any_sufficient_throw')}</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <Lobby onPlayOffline={() => setShowLobby(false)} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
