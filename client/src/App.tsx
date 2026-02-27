import { useEffect, useRef, useState } from 'react';
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
import { Copy, Check } from 'lucide-react';
import { DEFAULT_THEME, isThemeId, THEME_STORAGE_KEY, type ThemeId } from './theme';

const ROOM_PATH_REGEX = /^\/room\/([a-z]{3}-[a-z]{3}-[a-z]{3})\/?$/i;

const getRoomCodeFromPath = (path: string) => {
  const match = path.match(ROOM_PATH_REGEX);
  return match ? match[1].toLowerCase() : null;
};

const getRoomPermalinkPath = (roomCode: string) => `/room/${roomCode.toLowerCase()}`;

const setLobbyPath = () => {
  if (window.location.pathname !== '/') {
    window.history.replaceState({}, '', '/');
  }
};

const getInitialTheme = (): ThemeId => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(savedTheme) ? savedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

function App() {
  const {
    historyLog,
    ruleset,
    isOnline,
    isConnectingToRoom,
    isWaitingForOpponent,
    roomId,
    localPlayer,
    roomJoinError,
    joinRoom,
    clearRoomJoinError,
    leaveRoom,
    winner,
    showGuide,
    setShowGuide,
    resetGame
  } = useSenetStore();
  const { t, i18n } = useTranslation();
  const [showLobby, setShowLobby] = useState(true);
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);
  const hasHandledPermalink = useRef(false);
  const showLobbyScreen = showLobby && !isOnline && !isConnectingToRoom;

  const handleReturnToLobby = () => {
    if (isOnline || isConnectingToRoom) {
      leaveRoom();
    }
    resetGame();
    setShowLobby(true);
    setLobbyPath();
  };

  const handleCopyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId).then(() => {
      setCopiedRoom(true);
      setTimeout(() => setCopiedRoom(false), 2000);
    });
  };

  useEffect(() => {
    if (hasHandledPermalink.current) return;
    hasHandledPermalink.current = true;

    const roomCodeFromUrl = getRoomCodeFromPath(window.location.pathname);
    if (!roomCodeFromUrl) return;

    clearRoomJoinError();
    joinRoom(roomCodeFromUrl);
  }, [clearRoomJoinError, joinRoom]);

  useEffect(() => {
    if (!isOnline || !roomId) return;

    const permalinkPath = getRoomPermalinkPath(roomId);
    if (window.location.pathname !== permalinkPath) {
      window.history.replaceState({}, '', permalinkPath);
    }
  }, [isOnline, roomId]);

  useEffect(() => {
    if (!roomJoinError) return;
    setLobbyPath();
  }, [roomJoinError]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar-EG' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // Ignore storage failures (private mode / restricted storage).
      }
    }
  }, [theme]);

  return (
    <div className={`min-h-screen bg-ebony text-sand flex flex-col font-sans selection:bg-gold/30 overflow-x-hidden ${i18n.language === 'ar-EG' ? 'font-arabic' : ''}`}>
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 sm:px-4 sm:py-5 md:p-8 flex flex-col relative z-10 min-h-0">
        <HUD
          isLobby={showLobbyScreen || isConnectingToRoom}
          onReturnToLobby={!showLobbyScreen && !isConnectingToRoom ? handleReturnToLobby : undefined}
          theme={theme}
          setTheme={setTheme}
        />

        <div className="flex-1 flex flex-col xl:flex-row gap-4 md:gap-6 xl:gap-8 items-stretch justify-center min-h-0">
          {!showLobbyScreen ? (
            <>
              {/* Main Game Area */}
              <div className="flex-1 min-w-0 w-full flex flex-col items-center justify-center order-2 xl:order-1 min-h-0">
                {isOnline && roomId && !isWaitingForOpponent && (
                  <div className="mb-4 flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--ui-panel-strong-bg)] border border-sand/20 rounded-lg p-3 sm:px-4 md:px-6 shadow-md backdrop-blur-sm shrink-0">
                    <div className="flex flex-col">
                      <span className="text-sand/60 text-xs uppercase tracking-wider font-bold mb-1">{t('lobby.room_number')}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gold font-mono text-xl tracking-widest">{roomId}</span>
                        <button
                          id="copy-room-id"
                          onClick={handleCopyRoomId}
                          title={t('lobby.copy_room')}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer",
                            copiedRoom
                              ? "bg-green-900/40 border-green-500/50 text-green-400"
                              : "bg-sand/10 border-sand/20 text-sand/70 hover:bg-sand/20 hover:text-sand"
                          )}
                        >
                          {copiedRoom
                            ? <><Check className="w-3.5 h-3.5" />{t('lobby.copied')}</>
                            : <><Copy className="w-3.5 h-3.5" />{t('lobby.copy')}</>
                          }
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:text-right">
                      <span className="text-sand/60 text-xs uppercase tracking-wider font-bold mb-1">{t('lobby.you_are')}</span>
                      <span className="text-sand font-bold text-lg capitalize">{localPlayer ? t(`hud.players.${localPlayer}`) : ''}</span>
                    </div>
                    <button
                      onClick={() => { leaveRoom(); setShowLobby(true); setLobbyPath(); }}
                      className="w-full sm:w-auto bg-red-900/40 hover:bg-red-900/80 text-sand px-4 py-2 rounded-md text-sm border border-red-500/30 transition-colors shadow-sm sm:ms-4 cursor-pointer"
                    >
                      {t('lobby.leave_room')}
                    </button>
                  </div>
                )}
                {/* Waiting for Opponent overlay — replaces the game area */}
                {(isOnline || isConnectingToRoom) && isWaitingForOpponent ? (
                  <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
                    <div className="flex flex-col items-center gap-8 max-w-lg w-full text-center px-6">
                      {/* Animated hourglass / soul orbs */}
                      <div className="flex gap-3 mb-2">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-royal-gold"
                            style={{
                              animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                              opacity: 0.4 + i * 0.2
                            }}
                          />
                        ))}
                      </div>

                      {/* Title */}
                      <div>
                        <h2 className="text-3xl font-serif text-royal-gold tracking-wider uppercase drop-shadow-lg mb-2">
                          {t('lobby.waiting_title')}
                        </h2>
                        <p className="text-sand/60 text-sm uppercase tracking-widest">
                          {t('lobby.waiting_subtitle')}
                        </p>
                      </div>

                      {/* Room code card */}
                      {roomId && (
                        <div className="w-full bg-[var(--ui-panel-strong-bg)] border border-royal-gold/30 rounded-lg p-5 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                          <div className="text-sand/50 text-xs uppercase tracking-widest mb-2">{t('lobby.room_number')}</div>
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <span className="text-gold font-mono text-2xl tracking-widest">{roomId}</span>
                            <button
                              id="copy-room-id-waiting"
                              onClick={handleCopyRoomId}
                              title={t('lobby.copy_room')}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer",
                                copiedRoom
                                  ? "bg-green-900/40 border-green-500/50 text-green-400"
                                  : "bg-sand/10 border-sand/20 text-sand/70 hover:bg-sand/20 hover:text-sand"
                              )}
                            >
                              {copiedRoom
                                ? <><Check className="w-3.5 h-3.5" />{t('lobby.copied')}</>
                                : <><Copy className="w-3.5 h-3.5" />{t('lobby.copy')}</>
                              }
                            </button>
                          </div>
                          <div className="border-t border-royal-gold/20 pt-4">
                            <span className="text-sand/50 text-xs uppercase tracking-widest">{t('lobby.waiting_you_are')}</span>
                            <div className={cn(
                              "mt-1 text-lg font-bold uppercase tracking-widest font-serif",
                              localPlayer === 'anubis'
                                ? 'text-royal-gold'
                                : localPlayer === 'sphinx'
                                  ? 'text-royal-ivory'
                                  : 'text-sand'
                            )}>
                              {localPlayer ? t(`hud.players.${localPlayer}`) : ''}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Leave button */}
                      <button
                        onClick={() => { leaveRoom(); setShowLobby(true); setLobbyPath(); }}
                        className="text-sand/40 hover:text-sand/70 text-xs uppercase tracking-widest underline underline-offset-4 transition-colors cursor-pointer"
                      >
                        {t('lobby.leave_room')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
                    <Board />
                    <div className="w-full max-w-5xl mt-8 md:mt-12 mb-6 md:mb-8 bg-[var(--ui-panel-bg)] border border-royal-gold/20 rounded-lg p-4 sm:p-5 md:p-6 shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row items-stretch gap-4 md:gap-6 lg:gap-8 backdrop-blur-sm">
                      <div className="flex-1 w-full flex flex-col min-w-0 lg:border-e lg:border-royal-gold/10 lg:pe-8">
                        <ThrowSticks />
                      </div>
                      <div className="w-full lg:w-auto shrink-0 lg:ps-4 flex flex-col h-full">
                        <Afterlife />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Side Panel: History & Rules Info */}
              <div className="w-full max-w-full xl:w-96 xl:min-w-[20rem] xl:max-w-[24rem] flex flex-col xl:h-full min-h-0 gap-4 md:gap-6 xl:gap-8 order-1 xl:order-2 shrink-0">
                <div className="bg-[var(--ui-panel-bg)] border-s-[2px] border-royal-gold/30 rounded-e-lg p-5 flex-1 flex flex-col min-h-0 shadow-inner overflow-hidden">
                  <h2 className="text-gold font-serif text-lg border-b border-sand/20 pb-2 mb-2 uppercase tracking-wide shrink-0">
                    {t('app.chronicle')}
                  </h2>
                  <div className="overflow-y-auto overscroll-contain flex flex-col gap-2 text-sm pr-2 custom-scrollbar h-56">
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
                                log.player === 'anubis' ? "bg-royal-gold" : "bg-royal-ebony border border-royal-gold/30"
                              )}
                              title={t(`hud.players.${log.player}`)}
                            />
                          )}
                          <span className="leading-tight break-words">{t(log.key, translatedParams)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[var(--ui-rule-bg)] border-s-[2px] border-[var(--ui-rule-border)] rounded-e-lg p-5 text-sm shadow-inner shrink-0">
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
