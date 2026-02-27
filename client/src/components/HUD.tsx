import { useTranslation } from 'react-i18next';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';
import { Scroll } from 'lucide-react';

export function HUD({ isLobby = false }: { isLobby?: boolean }) {
    const { currentPlayer, ruleset, winner, resetGame, isOnline, setShowGuide } = useSenetStore();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full p-6 bg-[#2a1b18]/60 backdrop-blur-md rounded-md border-b-2 border-royal-gold/40 shadow-[0_20px_30px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(212,175,55,0.1)] mb-8 relative">
            {/* Top decorative trim */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-royal-gold to-transparent opacity-80" />

            <div className="flex flex-col">
                <h1 className="text-4xl font-serif text-royal-gold tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold">{t('hud.senet')}</h1>
                <div className="text-royal-ivory/80 text-sm mt-1 uppercase tracking-widest font-mono opacity-90">{t('hud.rules', { name: t(`ruleset.names.${ruleset.id}`) })}</div>
            </div>

            <div className="flex flex-col items-center flex-1 my-6 md:my-0 relative">
                {!isLobby && (
                    winner ? (
                        <div className="text-3xl font-bold text-royal-gold animate-[pulse_2s_ease-in-out_infinite] tracking-wider uppercase drop-shadow-lg">
                            {t('hud.wins', { player: t(`hud.players.${winner}`) })}
                        </div>
                    ) : (
                        <div className="flex items-center gap-6 p-3 bg-[#1a1110]/50 rounded border border-royal-gold/20 shadow-inner">
                            <div className="text-sm text-royal-ivory/80 font-mono tracking-widest uppercase">{t('hud.current_turn')}</div>
                            <div className={cn(
                                "px-6 py-1.5 rounded-sm font-bold uppercase tracking-widest text-sm shadow-[0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300 border",
                                currentPlayer === 'anubis'
                                    ? 'bg-royal-gold text-[#1a1110] border-yellow-300/50'
                                    : 'bg-[#1a1110] text-royal-gold border-royal-gold/80',
                            )}>
                                {t(`hud.players.${currentPlayer}`)}
                            </div>
                        </div>
                    )
                )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <button
                    onClick={() => setShowGuide(true)}
                    className="flex items-center gap-2 px-3 h-10 bg-royal-gold/10 hover:bg-royal-gold/20 text-royal-gold border border-royal-gold/30 rounded-sm transition-all cursor-pointer group whitespace-nowrap"
                    title={t('legend.registry_title')}
                >
                    <Scroll className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-serif text-xs uppercase tracking-widest font-bold hidden sm:block">
                        {t('guide.button_label')}
                    </span>
                </button>

                <select
                    className="bg-[#1a1110] text-royal-ivory border-[1.5px] border-royal-gold/60 rounded-sm px-3 py-1 text-sm outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold/50 h-10 font-serif tracking-wider shadow-inner hover:bg-[#2a1b18] transition-colors"
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                >
                    <option value="en">English</option>
                    <option value="ar-EG">العربية</option>
                    <option value="fr">Français</option>
                </select>

                <div className="flex flex-col items-center md:items-end w-full gap-2">
                    {!isOnline && !isLobby && (
                        <>
                            {import.meta.env.DEV && (
                                <button
                                    onClick={() => {
                                        const count = prompt('How many turns to play?', '10');
                                        if (count === null) return;
                                        const parsed = parseInt(count, 10);
                                        if (!isNaN(parsed) && parsed > 0) {
                                            useSenetStore.getState().playRandomTurns(parsed);
                                        }
                                    }}
                                    className="w-full md:w-auto px-6 py-2 bg-purple-900/50 hover:bg-purple-800 text-royal-ivory border-[2px] border-purple-500/60 rounded-sm transition-all font-serif shadow-sm text-xs uppercase tracking-widest font-bold"
                                >
                                    Dev: Auto Play
                                </button>
                            )}
                            <button
                                onClick={resetGame}
                                className="w-full md:w-auto px-6 py-2 bg-[#fcf8ed] hover:bg-white text-[#1a1110] border-[2px] border-royal-gold/60 rounded-sm transition-all font-serif shadow-sm text-sm uppercase tracking-widest font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:scale-105"
                            >
                                {t('hud.restart_game')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
