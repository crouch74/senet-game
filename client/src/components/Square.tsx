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

    const isLegalMove = legalMoves.some(m => m.targetSquare === number);
    const isSpecial = number >= 26 && number <= 30;

    const getHouseIcon = () => {
        switch (number) {
            case 15: return { type: 'text', val: '𓋹' };
            case 26: return { type: 'svg', val: '/assets/royal/house_28_maat_feather.svg', color: 'bg-royal-ivory/90' };
            case 27: return { type: 'svg', val: '/assets/royal/house_27_water_n35.svg', color: 'bg-royal-blue' };
            case 28: return { type: 'svg', val: '/assets/royal/house_28_maat_feather.svg', color: 'bg-royal-ivory/90' };
            case 29: return { type: 'svg', val: '/assets/royal/house_29_sun_disk.svg', color: 'bg-royal-gold' };
            case 30: return { type: 'svg', val: '/assets/royal/house_30_horus_falcon.svg', color: 'bg-royal-gold' };
            default: return null;
        }
    };

    const icon = getHouseIcon();

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center aspect-square group overflow-hidden box-border",
                "bg-[#221714] transition-all duration-500", // Ebony base
                // Thin dark border to separate squares, but Board has ivory background so we just need slight shading
                "border-[0.5px] border-black/80 shadow-[inset_0_0_10px_rgba(0,0,0,0.7)]",
                isSpecial && "shadow-[inset_0_0_15px_rgba(212,175,55,0.15)]",
                isLegalMove && "ring-1 ring-royal-gold/60 shadow-[inset_0_0_20px_rgba(255,215,0,0.2)] cursor-pointer"
            )}
        >
            {/* Number */}
            <div className="absolute top-1 left-[6px] text-[10px] text-royal-ivory/30 font-mono z-10 pointer-events-none">
                {number}
            </div>

            {/* Cartouche overlay for 26-30 */}
            {isSpecial && (
                <div className="absolute inset-[4px] border border-royal-gold/30 rounded-full pointer-events-none shadow-[inset_0_0_5px_rgba(212,175,55,0.2)]" style={{ transform: 'scale(1, 0.95)' }} />
            )}

            {/* Icon Inlay */}
            {icon && icon.type === 'text' && (
                <div className="text-3xl text-royal-ivory/40 opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {icon.val}
                </div>
            )}

            {icon && icon.type === 'svg' && (
                <div className="relative w-3/5 h-3/5 group-hover:scale-105 transition-transform duration-500">
                    <div
                        className={cn(
                            "absolute inset-0 mask-image-center transition-all duration-700",
                            icon.color,
                            isLegalMove && "bg-white" // Glow bright if legal move
                        )}
                        style={{
                            WebkitMaskImage: `url(${icon.val})`,
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            WebkitMaskSize: 'contain',
                            maskImage: `url(${icon.val})`,
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            maskSize: 'contain',
                        }}
                    >
                        {/* Shimmer/Specular effects inside the mask */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-300" />
                        <div className="absolute -inset-full animate-[shimmer_3s_infinite_linear] bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 opacity-0 group-hover:opacity-100" />
                    </div>
                    {/* Shadow/Bevel Rim underneath the inlay */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply translate-y-[1px]"
                        style={{
                            WebkitMaskImage: `url(${icon.val})`,
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            WebkitMaskSize: 'contain',
                            backgroundColor: 'black'
                        }}
                    />
                </div>
            )}

            {/* Legal Move Glow Line path overlay */}
            {isLegalMove && (
                <div className="absolute inset-x-0 bottom-1 h-[2px] bg-gradient-to-r from-transparent via-royal-ivory/70 to-transparent shadow-[0_0_8px_rgba(255,255,240,0.8)] animate-pulse" />
            )}

            {/* Luxury Tooltip */}
            {specialInfo && (
                <div className="absolute bottom-full mb-2 w-48 p-2 bg-[#fcf8ed] border-[2px] border-royal-gold shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-[#1a1110] text-xs rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="flex items-center gap-2 border-b border-royal-gold/20 pb-1 mb-1">
                        {icon && icon.type === 'svg' && (
                            <img src={icon.val} alt="icon" className="w-5 h-5 opacity-80" />
                        )}
                        <div className="font-bold text-royal-gold drop-shadow-sm uppercase tracking-wider">{t(`square.names.${number}`)}</div>
                    </div>
                    <div className="mt-1 font-serif">{t('square.effect', { effect: t(`square.effects.${specialInfo.effect}`) })}</div>
                    {specialInfo.requiredThrow && <div className="font-serif mt-1">{t('square.requires_throw', { num: specialInfo.requiredThrow })}</div>}
                    {!specialInfo.canBypass && <div className="text-royal-blue font-bold text-[10px] uppercase mt-1 opacity-80">{t('square.cannot_bypass')}</div>}
                </div>
            )}
        </div>
    );
}
