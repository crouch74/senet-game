import { useState } from 'react';
import { useSenetStore } from '../engine/store';
import { useTranslation } from 'react-i18next';

interface LobbyProps {
    onPlayOffline: () => void;
}

export function Lobby({ onPlayOffline }: LobbyProps) {
    const [roomInput, setRoomInput] = useState('');
    const { joinRoom } = useSenetStore();
    const { t } = useTranslation();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomInput.trim()) {
            joinRoom(roomInput.trim());
        }
    };

    return (
        <div className="flex-1 w-full flex items-center justify-center p-4 min-h-[60vh]">
            <div className="bg-black/40 border border-sand/20 rounded-lg p-8 max-w-sm w-full backdrop-blur-sm shadow-2xl">
                <h1 className="text-4xl text-gold font-serif mb-8 text-center tracking-widest drop-shadow-md">SENET</h1>

                <form onSubmit={handleJoin} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="room" className="text-sand/80 text-sm uppercase tracking-wider font-bold">
                            {t('lobby.room_number', 'Room Number')}
                        </label>
                        <input
                            id="room"
                            type="text"
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            placeholder={t('lobby.room_placeholder', 'Enter room to join or create')}
                            className="bg-ebony/60 border border-sand/30 rounded-md p-3 text-sand placeholder:text-sand/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!roomInput.trim()}
                        className="bg-gold hover:bg-gold/90 text-ebony font-bold py-3 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-gold/20"
                    >
                        {t('lobby.join_create', 'Join / Create Room')}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-sand/20"></div>
                        <span className="flex-shrink-0 mx-4 text-sand/50 text-sm uppercase tracking-wider">{t('lobby.or', 'or')}</span>
                        <div className="flex-grow border-t border-sand/20"></div>
                    </div>

                    <button
                        type="button"
                        onClick={onPlayOffline}
                        className="bg-ebony border border-sand/30 hover:bg-sand/10 text-sand font-bold py-3 rounded-md transition-all shadow-md"
                    >
                        {t('lobby.play_offline', 'Play Offline')}
                    </button>
                </form>
            </div>
        </div>
    );
}
