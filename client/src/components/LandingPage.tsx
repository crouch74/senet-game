import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import { THEMES, type ThemeId } from '../theme'
import { Languages, Palette } from 'lucide-react'

interface GameCardProps {
    id: 'senet' | 'mehen'
    title: string
    description: string
    onClick: () => void
    disabled?: boolean
}

function GameCard({ id, title, description, onClick, disabled }: GameCardProps) {
    return (
        <motion.div
            whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={cn(
                "relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300",
                id === 'senet'
                    ? "border-royal-gold/30 bg-ui-panel-bg hover:border-royal-gold"
                    : "border-royal-blue/30 bg-ui-panel-bg hover:border-royal-blue",
                disabled && "opacity-50 cursor-not-allowed grayscale"
            )}
            onClick={!disabled ? onClick : undefined}
        >
            <div className="aspect-video w-full bg-ui-board-frame overflow-hidden relative">
                {/* Decorative Background */}
                <div className={cn(
                    "absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity",
                    id === 'senet' ? "bg-[radial-gradient(circle,var(--royal-gold)_0%,transparent_70%)]" : "bg-[radial-gradient(circle,var(--royal-blue)_0%,transparent_70%)]"
                )} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                        {id === 'senet' ? '𓋀' : '𓅓'}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-2xl font-serif text-royal-gold tracking-widest uppercase mb-2">
                    {title}
                </h3>
                <p className="text-royal-ivory/70 text-sm leading-relaxed font-serif italic">
                    {description}
                </p>
            </div>

            <div className={cn(
                "absolute bottom-0 left-0 h-1 transition-all duration-300 w-0 group-hover:w-full",
                id === 'senet' ? "bg-royal-gold" : "bg-royal-blue"
            )} />
        </motion.div>
    )
}

export function LandingPage({
    onSelectGame,
    theme,
    setTheme
}: {
    onSelectGame: (game: 'senet' | 'mehen') => void,
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
                        <option value="en" className="bg-royal-ebony">English</option>
                        <option value="ar-EG" className="bg-royal-ebony">العربية</option>
                        <option value="fr" className="bg-royal-ebony">Français</option>
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
                    {t('landing.title', { defaultValue: 'Valley of Kings' })}
                </h1>
                <p className="text-royal-ivory/60 tracking-[0.5em] uppercase text-sm sm:text-lg">
                    {t('landing.subtitle', { defaultValue: 'Ancient Egyptian Games' })}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10 px-4">
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
            </div>

            <div className="mt-16 text-royal-gold/40 font-mono text-xs tracking-widest uppercase">
                {t('landing.select_your_path', { defaultValue: 'Choose your journey' })}
            </div>
        </div>
    )
}
