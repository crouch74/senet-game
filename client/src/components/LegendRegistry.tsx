import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Scroll, Crown } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * LegendRegistry Component
 * 
 * A dramatic, museum-grade panel that houses:
 * 1. The Legend of Senet (Narrative)
 * 2. Sacred Houses (Symbol Key)
 * 3. Quick Guide (Rules Overview)
 * 
 * Styled as an ivory tablet with gold trim.
 */
export function LegendContent() {
    const { t } = useTranslation();

    const sacredHouses = [
        { num: 26, icon: '𓄤', type: 'text' },
        { num: 27, icon: '/assets/royal/house_27_water_n35.svg', type: 'svg' },
        { num: 28, icon: '/assets/royal/house_28_maat_feather.svg', type: 'svg' },
        { num: 29, icon: '/assets/royal/house_29_sun_disk.svg', type: 'svg' },
        { num: 30, icon: '/assets/royal/house_30_horus_falcon.svg', type: 'svg' }
    ];

    const guideItems = [
        'objective', 'movement', 'throwing', 'capturing',
        'protection', 'blockades', 'special', 'bearing_off'
    ];

    return (
        <div className="bg-[#FFFFF0] p-8 md:p-14 text-[#1A1110] relative overflow-hidden">
            {/* Texture overlay for ivory feel */}
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')" }}
            />

            {/* Decorative Inlay Border */}
            <div className="absolute inset-4 border border-royal-gold/10 pointer-events-none" />

            {/* Section 1: THE LEGEND */}
            <section className="relative z-10 mb-16">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-px bg-royal-gold/40 mb-4" />
                    <h3 className="text-royal-gold font-serif text-2xl md:text-3xl text-center tracking-[0.2em] uppercase font-medium">
                        {t('legend.title')}
                    </h3>
                    <div className="w-24 h-[2px] bg-royal-gold/20 mt-4" />
                </div>

                <div className="space-y-6 font-serif text-base md:text-lg leading-relaxed italic text-[#1A1110]/80 max-w-xl mx-auto text-center rtl:text-right ltr:text-left">
                    <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-royal-gold first-letter:me-2 first-letter:float-left rtl:first-letter:float-right">
                        {t('legend.p1')}
                    </p>
                    <p>{t('legend.p2')}</p>
                    <p className="border-t border-royal-gold/10 pt-6 mt-6">
                        {t('legend.p3')}
                    </p>
                </div>
            </section>

            <div className="w-full flex items-center justify-center my-12 opacity-30">
                <div className="flex-1 h-px bg-royal-gold" />
                <Crown className="mx-6 w-6 h-6 text-royal-gold" />
                <div className="flex-1 h-px bg-royal-gold" />
            </div>

            {/* Section 2: SACRED HOUSES */}
            <section className="relative z-10 mb-16">
                <h3 className="text-royal-gold font-serif text-xl md:text-2xl mb-12 text-center tracking-[0.2em] font-medium uppercase">
                    {t('sacred_houses.title')}
                </h3>

                <div className="grid grid-cols-1 gap-8 max-w-lg mx-auto">
                    {sacredHouses.map((house) => (
                        <div key={house.num} className="flex items-center gap-6 group hover:translate-x-1 transition-transform duration-300">
                            <div className="shrink-0 w-16 h-16 flex items-center justify-center bg-royal-ebony/5 border-2 border-royal-gold/15 rounded-sm shadow-sm group-hover:border-royal-gold/40 transition-all duration-500 overflow-hidden relative">
                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-royal-gold/0 group-hover:bg-royal-gold/5 transition-colors" />

                                {house.type === 'text' ? (
                                    <span className="text-3xl text-royal-green drop-shadow-sm font-bold">
                                        {house.icon}
                                    </span>
                                ) : (
                                    <div
                                        className="w-10 h-10 bg-royal-gold opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                        style={{
                                            maskImage: `url(${house.icon})`,
                                            maskRepeat: 'no-repeat',
                                            maskPosition: 'center',
                                            maskSize: 'contain',
                                            WebkitMaskImage: `url(${house.icon})`,
                                            WebkitMaskRepeat: 'no-repeat',
                                            WebkitMaskPosition: 'center',
                                            WebkitMaskSize: 'contain',
                                        }}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <h4 className="font-bold text-royal-gold uppercase tracking-widest text-sm">
                                    {t(`sacred_houses.h${house.num}.title`)}
                                </h4>
                                <p className="font-serif text-[#1A1110]/70 text-sm leading-snug">
                                    {t(`sacred_houses.h${house.num}.desc`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="w-full flex items-center justify-center my-12 opacity-30">
                <div className="flex-1 h-px bg-royal-gold" />
                <Scroll className="mx-6 w-6 h-6 text-royal-gold" />
                <div className="flex-1 h-px bg-royal-gold" />
            </div>

            {/* Section 3: QUICK GUIDE */}
            <section className="relative z-10 max-w-xl mx-auto">
                <h3 className="text-royal-gold font-serif text-xl md:text-2xl mb-12 text-center tracking-[0.2em] font-medium uppercase">
                    {t('guide.title')}
                </h3>

                <ul className="space-y-6">
                    {guideItems.map((key) => (
                        <li key={key} className="flex gap-5 items-start">
                            <div className="shrink-0 mt-1.5 w-1.5 h-1.5 bg-royal-gold rotate-45" />
                            <div className="flex flex-col">
                                <span className="font-bold text-royal-gold uppercase text-[10px] tracking-widest mb-1 opacity-90">
                                    {t(`guide.labels.${key}`)}
                                </span>
                                <span className="font-serif text-[#1A1110]/80 text-sm md:text-base leading-relaxed">
                                    {t(`guide.${key}`)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Decorative Corner Ornaments - Egyptian Style */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-royal-gold/20 pointer-events-none" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-royal-gold/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-royal-gold/20 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-royal-gold/20 pointer-events-none" />
        </div>
    );
}

export function LegendRegistry() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-12 w-full max-w-2xl mx-auto px-4 pb-12">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between p-5 rounded-t-lg transition-all duration-700",
                    "bg-[#1A1110]/80 backdrop-blur-xl border border-royal-gold/40 shadow-2xl",
                    "hover:bg-[#262423] group cursor-pointer",
                    !isOpen && "rounded-lg"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-royal-gold/10 rounded-full border border-royal-gold/20 group-hover:border-royal-gold/50 transition-colors">
                        <Scroll className="w-5 h-5 text-royal-gold" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1">
                        <span className="text-royal-gold font-serif uppercase tracking-[0.3em] text-xs font-bold">
                            {t('legend.registry_subtitle', 'TOME OF KNOWLEDGE')}
                        </span>
                        <span className="text-royal-ivory/90 font-serif text-lg tracking-wider">
                            {t('legend.registry_title', 'Legend & Instructions')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-royal-gold/40 text-[10px] uppercase tracking-widest hidden sm:block">
                        {isOpen ? t('common.close', 'Close') : t('common.open', 'Open')}
                    </span>
                    {isOpen ?
                        <ChevronUp className="w-5 h-5 text-royal-gold animate-bounce" /> :
                        <ChevronDown className="w-5 h-5 text-royal-gold group-hover:translate-y-1 transition-transform" />
                    }
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-x border-b border-royal-gold/30 rounded-b-lg shadow-2xl"
                    >
                        <LegendContent />

                        {/* Shadow Fallback for Bottom */}
                        <div className="h-2 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
