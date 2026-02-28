import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Board } from './components/Board'
import { HUD } from './components/HUD'
import { ThrowSticks } from './components/ThrowSticks'
import { Afterlife } from './components/Afterlife'
import { Lobby } from './components/Lobby'
import { GameOver } from './components/GameOver'
import { GuideModal } from './components/GuideModal'
import {
  appStoreSelector,
  useShallowSelector,
} from './engine/selectors'
import { useSenetStore } from './engine/store'
import { type ThemeId } from './theme'
import { applyTheme, getInitialTheme } from './app/themePersistence'
import { useComputerTurn } from './app/useComputerTurn'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useRoomClipboard } from './hooks/useRoomClipboard'
import { ChroniclePanel } from './components/app/ChroniclePanel'
import { OnlineRoomBanner } from './components/app/OnlineRoomBanner'
import { RulesetSummaryPanel } from './components/app/RulesetSummaryPanel'
import { WaitingRoomPanel } from './components/app/WaitingRoomPanel'

function App() {
  const {
    clearRoomJoinError,
    currentPlayer,
    historyLog,
    isAutoPlaying,
    isAutoRolling,
    isConnectingToRoom,
    isOnline,
    isWaitingForOpponent,
    joinRoom,
    leaveRoom,
    localPlayer,
    offlineMode,
    playRandomTurns,
    resetGame,
    roomId,
    roomJoinError,
    ruleset,
    setOfflineMode,
    setShowGuide,
    showGuide,
    winner,
  } = useSenetStore(useShallowSelector(appStoreSelector))
  const { i18n } = useTranslation()
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme)
  const { copiedRoom, copyRoomId } = useRoomClipboard(roomId)
  const {
    handleLeaveRoom,
    handleReturnToLobby,
    handleStartOfflineMode,
    showLobbyScreen,
  } = useAppNavigation({
    clearRoomJoinError,
    isConnectingToRoom,
    isOnline,
    joinRoom,
    leaveRoom,
    offlineMode,
    resetGame,
    roomId,
    roomJoinError,
    setOfflineMode,
  })

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar-EG' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useComputerTurn({
    currentPlayer,
    enabled:
      !showLobbyScreen &&
      !isOnline &&
      !isConnectingToRoom &&
      offlineMode === 'vs_pc',
    isAutoPlaying,
    isAutoRolling,
    playRandomTurns,
    winner,
  })

  return (
    <div
      className={`min-h-screen bg-ebony text-sand flex flex-col font-sans selection:bg-gold/30 overflow-x-hidden ${i18n.language === 'ar-EG' ? 'lang-ar font-arabic' : ''}`}
    >
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sand via-ebony to-ebony" />
      <div className="noise-overlay" />

      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
      {winner && <GameOver onReturnToLobby={handleReturnToLobby} />}

      <svg aria-hidden="true" className="sr-only">
        <filter id="jitter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="1"
            result="noise"
          />
          <feOffset dx="0.5" dy="0.5" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
        </filter>
      </svg>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 sm:px-4 sm:py-5 md:p-8 flex flex-col relative z-10 min-h-0">
        <HUD
          isLobby={showLobbyScreen || isConnectingToRoom}
          onReturnToLobby={
            !showLobbyScreen && !isConnectingToRoom
              ? handleReturnToLobby
              : undefined
          }
          theme={theme}
          setTheme={setTheme}
        />

        <div className="flex-1 flex flex-col xl:flex-row gap-4 md:gap-6 xl:gap-8 items-stretch justify-center min-h-0">
          {!showLobbyScreen ? (
            <>
              <div className="flex-1 min-w-0 w-full flex flex-col items-center justify-center order-2 xl:order-1 min-h-0">
                {isOnline && roomId && !isWaitingForOpponent && (
                  <OnlineRoomBanner
                    copiedRoom={copiedRoom}
                    localPlayer={localPlayer}
                    onCopyRoomId={copyRoomId}
                    onLeaveRoom={handleLeaveRoom}
                    roomId={roomId}
                  />
                )}

                {(isOnline || isConnectingToRoom) && isWaitingForOpponent ? (
                  <WaitingRoomPanel
                    copiedRoom={copiedRoom}
                    localPlayer={localPlayer}
                    onCopyRoomId={copyRoomId}
                    onLeaveRoom={handleLeaveRoom}
                    roomId={roomId}
                  />
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

              <div className="w-full max-w-full xl:w-96 xl:min-w-[20rem] xl:max-w-[24rem] flex flex-col xl:h-full min-h-0 gap-4 md:gap-6 xl:gap-8 order-1 xl:order-2 shrink-0">
                <ChroniclePanel historyLog={historyLog} />
                <RulesetSummaryPanel ruleset={ruleset} />
              </div>
            </>
          ) : (
            <Lobby onStartOfflineMode={handleStartOfflineMode} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
