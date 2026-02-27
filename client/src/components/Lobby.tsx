import { useState } from 'react';
import { useSenetStore } from '../engine/store';
import { useTranslation } from 'react-i18next';

interface LobbyProps {
    onPlayOffline: () => void;
}

export function Lobby({ onPlayOffline }: LobbyProps) {
    const [roomInput, setRoomInput] = useState('');
    const { joinRoom, roomJoinError, clearRoomJoinError } = useSenetStore();
    const { t } = useTranslation();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        const normalizedRoomId = roomInput.trim().toLowerCase();
        if (normalizedRoomId) {
            clearRoomJoinError();
            joinRoom(normalizedRoomId);
        }
    };

    const handleCreate = async () => {
        clearRoomJoinError();
        try {
            const res = await fetch('/api/match/create', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                joinRoom(data.room_id);
            } else {
                console.error('Failed to create room:', res.statusText);
            }
        } catch (error) {
            console.error('Failed to create room:', error);
        }
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4 py-20 overflow-y-auto custom-scrollbar">
            <div className="bg-black/40 border border-royal-gold/20 rounded-lg p-8 max-w-sm w-full backdrop-blur-sm shadow-2xl shrink-0">
                <h1 className="text-4xl text-royal-gold font-serif mb-8 text-center tracking-[0.4em] drop-shadow-md">SENET</h1>

                <div className="flex flex-col gap-5">
                    {roomJoinError && (
                        <div className="rounded-md border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                            {t(`lobby.join_errors.${roomJoinError}`)}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="bg-royal-gold hover:bg-royal-gold/90 text-royal-ebony font-bold py-3 rounded-md transition-all shadow-lg hover:shadow-royal-gold/20 cursor-pointer"
                    >
                        {t('lobby.create_room', 'Create New Room')}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-sand/20"></div>
                        <span className="flex-shrink-0 mx-4 text-sand/50 text-xs uppercase tracking-wider">{t('lobby.or_join', 'Or join existing room')}</span>
                        <div className="flex-grow border-t border-sand/20"></div>
                    </div>

                    <form onSubmit={handleJoin} className="flex flex-col gap-2">
                        <label htmlFor="room" className="text-sand/80 text-sm uppercase tracking-wider font-bold">
                            {t('lobby.room_number', 'Room Code')}
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="room"
                                type="text"
                                value={roomInput}
                                onChange={(e) => {
                                    if (roomJoinError) {
                                        clearRoomJoinError();
                                    }
                                    setRoomInput(e.target.value);
                                }}
                                placeholder={t('lobby.room_placeholder', 'e.g. abc-def-ghi')}
                                className="flex-1 bg-royal-ebony/60 border border-sand/30 rounded-md p-3 text-sand placeholder:text-sand/30 focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-all"
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

                    <div className="relative flex py-2 items-center mt-2">
                        <div className="flex-grow border-t border-sand/20"></div>
                        <span className="flex-shrink-0 mx-4 text-sand/50 text-xs uppercase tracking-wider">{t('lobby.or', 'or')}</span>
                        <div className="flex-grow border-t border-sand/20"></div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            clearRoomJoinError();
                            onPlayOffline();
                        }}
                        className="bg-royal-ebony border border-sand/30 hover:bg-royal-gold/10 text-sand font-bold py-3 rounded-md transition-all shadow-md cursor-pointer"
                    >
                        {t('lobby.play_offline', 'Play Offline')}
                    </button>
                </div>
            </div>
        </div>
    );
}

