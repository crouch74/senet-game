import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSenetStore } from '../engine/store'
import {
  lobbyStoreSelector,
  useShallowSelector,
} from '../engine/selectors'
import type { OfflineMode } from '../engine/types'
import { useBackendHealth } from '../hooks/useBackendHealth'
import { createLogger } from '../services/logger'
import { matchApi } from '../services/matchApi'
import { normalizeRoomId } from '../services/matchConfig'

interface LobbyProps {
  onStartOfflineMode: (mode: OfflineMode) => void
}

const logger = createLogger('Lobby')

export function Lobby({ onStartOfflineMode }: LobbyProps) {
  const [roomInput, setRoomInput] = useState('')
  const isBackendAvailable = useBackendHealth()
  const { joinRoom, roomJoinError, clearRoomJoinError } = useSenetStore(
    useShallowSelector(lobbyStoreSelector),
  )
  const { t } = useTranslation()

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
      const roomId = await matchApi.createRoom()
      joinRoom(roomId)
    } catch (error) {
      logger.error('Failed to create room', error)
    }
  }

  const handleOfflineStart = (mode: OfflineMode) => {
    clearRoomJoinError()
    onStartOfflineMode(mode)
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 py-20 overflow-y-auto custom-scrollbar">
      <div className="bg-[var(--ui-panel-strong-bg)] border border-royal-gold/20 rounded-lg p-8 max-w-sm w-full backdrop-blur-sm shadow-2xl shrink-0">
        <h1 className="text-4xl text-royal-gold font-serif mb-8 text-center tracking-[0.4em] drop-shadow-md">
          SENET
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
                className="bg-royal-gold hover:bg-royal-gold/90 text-[var(--ui-turn-pill-foreground)] font-bold py-3 rounded-md transition-all shadow-lg hover:shadow-royal-gold/20 cursor-pointer"
              >
                {t('lobby.create_room', 'Create New Room')}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-sand/20" />
                <span className="flex-shrink-0 mx-4 text-sand/50 text-xs uppercase tracking-wider">
                  {t('lobby.or_join', 'Or join existing room')}
                </span>
                <div className="flex-grow border-t border-sand/20" />
              </div>

              <form onSubmit={handleJoin} className="flex flex-col gap-2">
                <label
                  htmlFor="room"
                  className="text-sand/80 text-sm uppercase tracking-wider font-bold"
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
                    className="flex-1 bg-[var(--ui-input-bg)] border border-sand/30 rounded-md p-3 text-sand placeholder:text-sand/30 focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!roomInput.trim()}
                    className="bg-sand/20 hover:bg-sand/30 text-sand font-bold px-6 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {t('lobby.join', 'Join')}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="rounded-md border border-sand/20 bg-[var(--ui-panel-bg)] px-4 py-3 text-sm text-sand/75">
              {t(
                'lobby.online_unavailable',
                'Online mode is unavailable while the backend is offline.',
              )}
            </div>
          )}

          <div className="relative flex py-2 items-center mt-2">
            <div className="flex-grow border-t border-sand/20" />
            <span className="flex-shrink-0 mx-4 text-sand/50 text-xs uppercase tracking-wider">
              {t('lobby.or', 'or')}
            </span>
            <div className="flex-grow border-t border-sand/20" />
          </div>

          <button
            type="button"
            onClick={() => handleOfflineStart('play_and_pass')}
            className="bg-[var(--ui-secondary-button-bg)] border border-sand/30 hover:bg-[var(--ui-secondary-button-bg-hover)] text-sand font-bold py-3 rounded-md transition-all shadow-md cursor-pointer"
          >
            {t('lobby.play_and_pass', 'play & pass')}
          </button>

          <button
            type="button"
            onClick={() => handleOfflineStart('vs_pc')}
            className="bg-royal-blue/30 border border-royal-blue/50 hover:bg-royal-blue/45 text-royal-ivory font-bold py-3 rounded-md transition-all shadow-md cursor-pointer"
          >
            {t('lobby.vs_pc', 'vs PC')}
          </button>
        </div>
      </div>
    </div>
  )
}
