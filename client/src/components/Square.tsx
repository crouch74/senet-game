import { useTranslation } from 'react-i18next';
import { useSenetStore } from '../engine/store';
import { cn } from '../utils/cn';

interface SquareProps {
    number: number;
}

export function Square({ number }: SquareProps) {
    const { ruleset, legalMoves } = useSenetStore();
    const { t } = useTranslation();
    const specialInfo = ruleset.specialSquares[number];

    // Is this square a legal move destination for any piece right now?
    const isLegalMove = legalMoves.some(m => m.targetSquare === number);

    const getHouseIcon = () => {
        switch (number) {
            case 15: return '𓋹'; // Ankh / Rebirth
            case 26: return '𓄤'; // Nefer / Happiness
            case 27: return '𓈗'; // Water
            case 28: return '𓏼'; // Three Truths
            case 29: return '𓏥'; // Re-Atoum
            case 30: return '𓅃'; // Horus
            default: return null;
        }
    };

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center border border-sand/30 aspect-square group",
                "bg-gradient-to-br from-ebony/40 to-ebony/80 transition-colors",
                number >= 26 && number <= 30 && "from-ochre/20 to-ebony/50 border-ochre/40",
                isLegalMove && "ring-2 ring-gold ring-inset bg-gold/20 shadow-[inset_0_0_15px_rgba(212,175,55,0.4)] cursor-pointer"
            )}
        >
            <div className="absolute top-1 left-2 text-[10px] text-sand/40 font-mono">
                {number}
            </div>

            {getHouseIcon() && (
                <div className="text-3xl text-gold/40 opacity-50 group-hover:opacity-100 transition-opacity">
                    {getHouseIcon()}
                </div>
            )}

            {/* Tooltip for special houses */}
            {specialInfo && (
                <div className="absolute bottom-full mb-2 w-48 p-2 bg-ebony border border-sand/50 text-sand text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                    <div className="font-bold text-gold">{t(`square.names.${number}`)}</div>
                    <div className="mt-1">{t('square.effect', { effect: t(`square.effects.${specialInfo.effect}`) })}</div>
                    {specialInfo.requiredThrow && <div>{t('square.requires_throw', { num: specialInfo.requiredThrow })}</div>}
                    {!specialInfo.canBypass && <div className="text-ochre mt-1">{t('square.cannot_bypass')}</div>}
                </div>
            )}
        </div>
    );
}
