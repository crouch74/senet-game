import { useTranslation } from 'react-i18next';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';

export function HUD() {
    const { currentPlayer, ruleset, winner, changeRuleset, resetGame } = useSenetStore();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full p-4 bg-ebony/60 backdrop-blur-md rounded-lg border border-sand/20 mb-6 shadow-2xl">
            <div className="flex flex-col">
                <h1 className="text-3xl font-serif text-gold tracking-widest uppercase shadow-sm">{t('hud.senet')}</h1>
                <div className="text-sand/70 text-sm mt-1">{t('hud.rules', { name: t(`ruleset.names.${ruleset.id}`) })}</div>
                <div className="flex gap-2">
                    <select
                        className="mt-2 bg-ebony text-sand border border-sand/30 rounded px-2 py-1 text-xs outline-none focus:border-gold"
                        value={ruleset.id}
                        onChange={(e) => changeRuleset(e.target.value)}
                    >
                        <option value="museum">{t('ruleset.names.museum')}</option>
                        <option value="common">{t('ruleset.names.common')}</option>
                        <option value="custom">{t('ruleset.names.custom')}</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col items-center flex-1 my-4 md:my-0">
                {winner ? (
                    <div className="text-2xl font-bold text-gold animate-pulse">
                        {t('hud.wins', { player: t(`hud.players.${winner}`) })}
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="text-lg text-sand/80 font-medium">{t('hud.current_turn')}</div>
                        <div className={cn(
                            "px-4 py-1 rounded-full font-bold uppercase tracking-wider text-sm shadow-md transition-colors",
                            currentPlayer === 'light' ? 'bg-sand text-ebony' : 'bg-ochre text-ebony',
                        )}>
                            {t(`hud.players.${currentPlayer}`)}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <select
                    className="bg-ebony text-sand border border-sand/30 rounded px-2 py-1 text-sm outline-none focus:border-gold h-10"
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                >
                    <option value="en">English</option>
                    <option value="ar-EG">العربية</option>
                    <option value="fr">Français</option>
                </select>

                <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-transparent hover:bg-gold/20 text-gold border border-gold/50 rounded transition-all font-serif shadow-sm text-sm"
                >
                    {t('hud.restart_game')}
                </button>
            </div>
        </div>
    );
}
