import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../engine/store'
import {
  lobbyStoreSelector,
  useShallowSelector,
} from '../engine/selectors'
import type { GameType, OfflineMode } from '../engine/types'
import { useBackendHealth } from '../hooks/useBackendHealth'
import { createLogger } from '../services/logger'
import { matchApi } from '../services/matchApi'
import { normalizeRoomId } from '../services/matchConfig'

interface LobbyProps {
  onStartOfflineMode: (mode: OfflineMode) => void
  gameType?: GameType
}

const logger = createLogger('Lobby')

export function Lobby({ onStartOfflineMode, gameType = 'senet' }: LobbyProps) {
  const [roomInput, setRoomInput] = useState('')
  const isBackendAvailable = useBackendHealth()
  const { joinRoom, roomJoinError, clearRoomJoinError } = useSenetStore(
    useShallowSelector(lobbyStoreSelector),
  )
  const setGuideSection = useSenetStore((state) => state.setGuideSection)
  const setShowGuide = useSenetStore((state) => state.setShowGuide)
  const { t } = useTranslation()
  const triviaFacts = [
    t(`games.${gameType}.lobby.fun_facts.fact_1`),
    t(`games.${gameType}.lobby.fun_facts.fact_2`),
    t(`games.${gameType}.lobby.fun_facts.fact_3`),
  ]
  const isUrGame = gameType === 'ur'

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedRoomId = normalizeRoomId(roomInput)
    if (!normalizedRoomId) return

    clearRoomJoinError()
    joinRoom(normalizedRoomId)
  }

  const handleCreate = async () => {
    clearRoomJoinError()

    try {
      const roomId = await matchApi.createRoom(gameType)
      joinRoom(roomId)
    } catch (error) {
      logger.error('Failed to create room', error)
    }
  }

  const handleOfflineStart = (mode: OfflineMode) => {
    clearRoomJoinError()
    onStartOfflineMode(mode)
  }

  const openUrGuide = (section: 'quick_tour' | 'rules' | 'attribution') => {
    setGuideSection(section)
    setShowGuide(true)
  }

  return (
    <div className={isUrGame ? 'ur-lobby flex-1 w-full flex items-center justify-center p-4 py-16 overflow-y-auto custom-scrollbar' : 'flex-1 w-full flex items-center justify-center p-4 py-16 overflow-y-auto custom-scrollbar'}>
      <div className={isUrGame ? 'ur-lobby__layout grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]' : 'grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]'}>
        <div className={isUrGame ? 'ur-lobby__control-panel w-full p-8 shrink-0' : 'bg-ui-panel-strong-bg border border-royal-gold/20 rounded-lg p-8 w-full backdrop-blur-sm shadow-2xl shrink-0'}>
          <h1 className="text-4xl text-royal-gold font-serif mb-8 text-center tracking-[0.4em] drop-shadow-md">
            {t(`games.${gameType}.title`)}
          </h1>

          <div className="flex flex-col gap-5">
            {roomJoinError && (
              <div className="rounded-md border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                {t(`lobby.join_errors.${roomJoinError}`)}
              </div>
            )}

            {isBackendAvailable ? (
              <>
                <button
                  type="button"
                  onClick={handleCreate}
                  className={isUrGame ? 'ur-lobby__primary-button' : 'bg-royal-gold hover:bg-royal-gold/90 text-ui-turn-pill-foreground font-bold py-3 rounded-md transition-all shadow-lg hover:shadow-royal-gold/20 cursor-pointer'}
                >
                  {t('lobby.create_room', 'Create New Room')}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className={isUrGame ? 'ur-lobby__divider-line flex-grow' : 'flex-grow border-t border-sand/20'} />
                  <span className={isUrGame ? 'ur-lobby__divider-label flex-shrink-0 mx-4' : 'flex-shrink-0 mx-4 text-sand/50 text-xs uppercase tracking-wider'}>
                    {t('lobby.or_join', 'Or join existing room')}
                  </span>
                  <div className={isUrGame ? 'ur-lobby__divider-line flex-grow' : 'flex-grow border-t border-sand/20'} />
                </div>

                <form onSubmit={handleJoin} className="flex flex-col gap-2">
                  <label
                    htmlFor="room"
                    className={isUrGame ? 'ur-lobby__field-label' : 'text-sand/80 text-sm uppercase tracking-wider font-bold'}
                  >
                    {t('lobby.room_number', 'Room Code')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="room"
                      type="text"
                      value={roomInput}
                      onChange={(event) => {
                        if (roomJoinError) {
                          clearRoomJoinError()
                        }

                        setRoomInput(event.target.value)
                      }}
                      placeholder={t(
                        'lobby.room_placeholder',
                        'e.g. abc-def-ghi',
                      )}
                      className={isUrGame ? 'ur-lobby__input flex-1 p-3' : 'flex-1 bg-ui-input-bg border border-sand/30 rounded-md p-3 text-sand placeholder:text-sand/30 focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-all'}
                    />
                    <button
                      type="submit"
                      disabled={!roomInput.trim()}
                      className={isUrGame ? 'ur-lobby__secondary-button px-6 disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-sand/20 hover:bg-sand/30 text-sand font-bold px-6 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'}
                    >
                      {t('lobby.join', 'Join')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className={isUrGame ? 'ur-lobby__offline-note px-4 py-3 text-sm' : 'rounded-md border border-sand/20 bg-ui-panel-bg px-4 py-3 text-sm text-sand/75'}>
                {t(
                  'lobby.online_unavailable',
                  'Online mode is unavailable while the backend is offline.',
                )}
              </div>
            )}

            <div className="relative flex py-2 items-center mt-2">
              <div className={isUrGame ? 'ur-lobby__divider-line flex-grow' : 'flex-grow border-t border-sand/20'} />
              <span className={isUrGame ? 'ur-lobby__divider-label flex-shrink-0 mx-4' : 'flex-shrink-0 mx-4 text-sand/50 text-xs uppercase tracking-wider'}>
                {t('lobby.or', 'or')}
              </span>
              <div className={isUrGame ? 'ur-lobby__divider-line flex-grow' : 'flex-grow border-t border-sand/20'} />
            </div>

            <button
              type="button"
              onClick={() => handleOfflineStart('play_and_pass')}
              className={isUrGame ? 'ur-lobby__secondary-button' : 'bg-ui-secondary-button-bg border border-sand/30 hover:bg-ui-secondary-button-bg-hover text-sand font-bold py-3 rounded-md transition-all shadow-md cursor-pointer'}
            >
              {t('lobby.play_and_pass', 'play & pass')}
            </button>

            <button
              type="button"
              onClick={() => handleOfflineStart('vs_pc')}
              className={isUrGame ? 'ur-lobby__tertiary-button' : 'bg-royal-blue/30 border border-royal-blue/50 hover:bg-royal-blue/45 text-royal-ivory font-bold py-3 rounded-md transition-all shadow-md cursor-pointer'}
            >
              {t('lobby.vs_pc', 'vs PC')}
            </button>
          </div>
        </div>

        <section
          aria-label={
            isUrGame
              ? t('games.ur.lobby.legend_title')
              : t(`games.${gameType}.lobby.about_title`)
          }
          className={isUrGame ? 'ur-lobby__story flex flex-col gap-4' : 'flex flex-col gap-4'}
        >
          {isUrGame ? (
            <>
              <article className="ur-lobby__card ur-lobby__card--legend p-6">
                <p className="ur-lobby__kicker">
                  {t('games.ur.lobby.legend_kicker')}
                </p>
                <h2 className="ur-lobby__title mt-3">
                  {t('games.ur.lobby.legend_title')}
                </h2>
                <p className="ur-lobby__copy mt-4 text-sm leading-7">
                  {t('games.ur.lobby.legend_body')}
                </p>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="ur-lobby__fact-card px-4 py-3">
                    <dt className="ur-lobby__fact-label">
                      {t('games.ur.lobby.how_to_win_label')}
                    </dt>
                    <dd className="ur-lobby__fact-copy mt-2 leading-6">
                      {t('games.ur.lobby.how_to_win')}
                    </dd>
                  </div>
                  <div className="ur-lobby__fact-card px-4 py-3">
                    <dt className="ur-lobby__fact-label">
                      {t('games.ur.lobby.rosettes_label')}
                    </dt>
                    <dd className="ur-lobby__fact-copy mt-2 leading-6">
                      {t('games.ur.lobby.rosettes')}
                    </dd>
                  </div>
                  <div className="ur-lobby__fact-card px-4 py-3 sm:col-span-2">
                    <dt className="ur-lobby__fact-label">
                      {t('games.ur.lobby.time_label')}
                    </dt>
                    <dd className="ur-lobby__fact-copy mt-2 leading-6">
                      {t('games.ur.lobby.time_value')}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openUrGuide('quick_tour')}
                    className="ur-lobby__pill-button ur-lobby__pill-button--carnelian px-5 py-3 text-sm font-semibold"
                  >
                    {t('games.ur.lobby.learn_button')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openUrGuide('rules')}
                    className="ur-lobby__pill-button ur-lobby__pill-button--lapis px-5 py-3 text-sm font-semibold"
                  >
                    {t('games.ur.lobby.rules_button')}
                  </button>
                </div>
              </article>

              <article className="ur-lobby__card ur-lobby__card--history p-6">
                <p className="ur-lobby__kicker ur-lobby__kicker--lapis">
                  {t('games.ur.lobby.history_kicker')}
                </p>
                <h2 className="ur-lobby__title ur-lobby__title--cool mt-3">
                  {t('games.ur.lobby.history_title')}
                </h2>
                <p className="ur-lobby__copy ur-lobby__copy--cool mt-4 text-sm leading-7">
                  {t('games.ur.lobby.history_body')}
                </p>
              </article>

              <article className="ur-lobby__card ur-lobby__card--attribution p-6">
                <p className="ur-lobby__kicker">
                  {t('games.ur.lobby.attribution_kicker')}
                </p>
                <h2 className="ur-lobby__title mt-3">
                  {t('games.ur.lobby.attribution_title')}
                </h2>
                <p className="ur-lobby__copy mt-4 text-sm leading-7">
                  {t('games.ur.lobby.attribution_body')}
                </p>
                <button
                  type="button"
                  onClick={() => openUrGuide('attribution')}
                  className="ur-lobby__pill-button ur-lobby__pill-button--ghost mt-5 px-5 py-3 text-sm font-semibold"
                >
                  {t('games.ur.lobby.attribution_button')}
                </button>
              </article>
            </>
          ) : (
            <>
              <article className="rounded-lg border border-royal-gold/15 bg-ui-panel-strong-bg/90 p-6 shadow-xl backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-royal-gold/85">
                  {t(`games.${gameType}.lobby.about_kicker`)}
                </p>
                <h2 className="mt-3 font-serif text-2xl text-royal-ivory">
                  {t(`games.${gameType}.lobby.about_title`)}
                </h2>
                <p className="mt-4 text-sm leading-7 text-sand">
                  {t(`games.${gameType}.lobby.about_body`)}
                </p>
              </article>

              <article className="rounded-lg border border-sand/15 bg-ui-panel-bg/90 p-6 shadow-xl backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-sand/80">
                  {t(`games.${gameType}.lobby.history_kicker`)}
                </p>
                <h2 className="mt-3 font-serif text-2xl text-royal-ivory">
                  {t(`games.${gameType}.lobby.history_title`)}
                </h2>
                <p className="mt-4 text-sm leading-7 text-sand">
                  {t(`games.${gameType}.lobby.history_body`)}
                </p>
              </article>

              <article className="rounded-lg border border-royal-gold/20 bg-ui-panel-strong-bg p-6 shadow-xl backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-royal-gold/90">
                  {t(`games.${gameType}.lobby.fun_facts.kicker`)}
                </p>
                <h2 className="mt-3 font-serif text-2xl text-royal-ivory">
                  {t(`games.${gameType}.lobby.fun_facts.title`)}
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-sand">
                  {triviaFacts.map((fact) => (
                    <li key={fact} className="flex gap-3">
                      <span className="mt-1 text-royal-gold/95">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
