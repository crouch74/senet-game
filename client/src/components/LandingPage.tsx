import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import { THEMES, type ThemeId } from '../theme'
import { Languages, Palette } from 'lucide-react'
import { LANGUAGE_OPTIONS } from '../i18n'
import type { GameType } from '../engine/types'

interface GameCardProps {
    id: GameType
    title: string
    description: string
    onClick: () => void
    disabled?: boolean
}

const GAME_CARD_ACCENTS: Record<GameType, { border: string; hoverBorder: string; glow: string; glyph: string; title: string }> = {
    senet: {
        border: 'border-royal-gold/30',
        hoverBorder: 'hover:border-royal-gold',
        glow: 'bg-[radial-gradient(circle,var(--royal-gold)_0%,transparent_70%)]',
        glyph: '𓋀',
        title: 'text-royal-gold',
    },
    mehen: {
        border: 'border-royal-blue/30',
        hoverBorder: 'hover:border-royal-blue',
        glow: 'bg-[radial-gradient(circle,var(--royal-blue)_0%,transparent_70%)]',
        glyph: '𓅓',
        title: 'text-royal-gold',
    },
    'hounds-and-jackals': {
        border: 'border-emerald-500/30',
        hoverBorder: 'hover:border-emerald-400',
        glow: 'bg-[radial-gradient(circle,rgba(67,160,71,0.9)_0%,transparent_70%)]',
        glyph: '𓃢',
        title: 'text-royal-gold',
    },
    ur: {
        border: 'border-[#2b6d8e]/40',
        hoverBorder: 'hover:border-[#d59a49]',
        glow: 'bg-[radial-gradient(circle,rgba(40,95,128,0.92)_0%,rgba(201,72,34,0.18)_42%,transparent_72%)]',
        glyph: '✹',
        title: 'text-[#e2c690]',
    },
}

function GameCard({ id, title, description, onClick, disabled }: GameCardProps) {
    const accent = GAME_CARD_ACCENTS[id]

    return (
        <motion.div
            whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={cn(
                "relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300",
                accent.border,
                accent.hoverBorder,
                "bg-ui-panel-bg",
                disabled && "opacity-50 cursor-not-allowed grayscale"
            )}
            onClick={!disabled ? onClick : undefined}
        >
            <div className="aspect-video w-full bg-ui-board-frame overflow-hidden relative">
                {/* Decorative Background */}
                <div className={cn(
                    "absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity",
                    accent.glow
                )} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn(
                        "text-6xl group-hover:scale-110 transition-transform duration-500",
                        id === 'ur' && 'text-[#f0d7a6] drop-shadow-[0_0_18px_rgba(213,154,73,0.28)]'
                    )}>
                        {accent.glyph}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <h3 className={cn("text-2xl font-serif tracking-widest uppercase mb-2", accent.title)}>
                    {title}
                </h3>
                <p className="text-royal-ivory/70 text-sm leading-relaxed font-serif italic">
                    {description}
                </p>
            </div>

            <div className={cn(
                "absolute bottom-0 left-0 h-1 transition-all duration-300 w-0 group-hover:w-full",
                id === 'senet'
                    ? "bg-royal-gold"
                    : id === 'mehen'
                        ? "bg-royal-blue"
                        : id === 'hounds-and-jackals'
                            ? "bg-emerald-400"
                            : "bg-[#d59a49]"
            )} />
        </motion.div>
    )
}

export function LandingPage({
    onSelectGame,
    theme,
    setTheme
}: {
    onSelectGame: (game: GameType) => void,
    theme: ThemeId,
    setTheme: (theme: ThemeId) => void
}) {
    const { t, i18n } = useTranslation()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-ui-app-bg text-royal-ivory overflow-hidden relative">
            {/* Top Bar for Selectors */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-end gap-4 z-50">
                <div className="flex items-center gap-2 bg-royal-ebony/60 backdrop-blur-md border border-royal-gold/20 rounded-lg p-1 px-3 shadow-xl">
                    <Languages className="w-4 h-4 text-royal-gold/70" />
                    <select
                        className="bg-transparent text-royal-ivory text-xs font-serif uppercase tracking-widest outline-none cursor-pointer p-1"
                        value={i18n.language}
                        onChange={(e) => i18n.changeLanguage(e.target.value)}
                    >
                        {LANGUAGE_OPTIONS.map((languageOption) => (
                            <option key={languageOption.value} value={languageOption.value} className="bg-royal-ebony">
                                {languageOption.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-royal-ebony/60 backdrop-blur-md border border-royal-gold/20 rounded-lg p-1 px-3 shadow-xl">
                    <Palette className="w-4 h-4 text-royal-gold/70" />
                    <select
                        className="bg-transparent text-royal-ivory text-xs font-serif uppercase tracking-widest outline-none cursor-pointer p-1"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as ThemeId)}
                    >
                        {THEMES.map((themeOption) => (
                            <option key={themeOption.id} value={themeOption.id} className="bg-royal-ebony">
                                {t(themeOption.labelKey)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 z-10"
            >
                <h1 className="text-5xl sm:text-7xl font-serif text-royal-gold tracking-[0.3em] uppercase mb-4 drop-shadow-2xl">
                    {t('landing.title', { defaultValue: 'Courts of Antiquity' })}
                </h1>
                <p className="text-royal-ivory/60 tracking-[0.5em] uppercase text-sm sm:text-lg">
                    {t('landing.subtitle', { defaultValue: 'Ancient Board Games' })}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl w-full z-10 px-4">
                <GameCard
                    id="senet"
                    title={t('games.senet.title', { defaultValue: 'Senet' })}
                    description={t('games.senet.description', { defaultValue: 'The Game of Passing. A race across 30 squares to reach the afterlife.' })}
                    onClick={() => onSelectGame('senet')}
                />
                <GameCard
                    id="mehen"
                    title={t('games.mehen.title', { defaultValue: 'Mehen' })}
                    description={t('games.mehen.description', { defaultValue: "The Tradition of the Guarding Coil. Lions and balls race inward through a sacred spiral to claim the serpent's heart." })}
                    onClick={() => onSelectGame('mehen')}
                />
                <GameCard
                    id="hounds-and-jackals"
                    title={t('games.hounds-and-jackals.title', { defaultValue: 'Hounds and Jackals' })}
                    description={t('games.hounds-and-jackals.description', { defaultValue: 'The Game of Fifty-Eight Holes. Five pegs per side race through marked jumps and setbacks toward the shen goal.' })}
                    onClick={() => onSelectGame('hounds-and-jackals')}
                />
                <GameCard
                    id="ur"
                    title={t('games.ur.title', { defaultValue: 'The Royal Game of Ur' })}
                    description={t('games.ur.description', { defaultValue: 'Seven counters race across private courts and the king’s road, where rosettes grant safety and an extra throw.' })}
                    onClick={() => onSelectGame('ur')}
                />
            </div>

            <div className="mt-16 text-royal-gold/40 font-mono text-xs tracking-widest uppercase">
                {t('landing.select_your_path', { defaultValue: 'Choose a board' })}
            </div>
        </div>
    )
}
