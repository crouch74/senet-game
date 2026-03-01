import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useShallowSelector } from '../../../engine/selectors'
import { useSenetStore } from '../../../engine/store'

const QUICK_TOUR_STEPS = [1, 2, 3, 4, 5] as const
const RULE_ITEMS = [
  'equipment',
  'turn',
  'capture',
  'rosettes',
  'bearing_off',
  'winning',
] as const

const SOURCES = [
  {
    href: 'https://www.britishmuseum.org/blog/rosettes-game-ancient-iraq',
    label: 'British Museum: The rosettes game from ancient Iraq',
  },
  {
    href: 'https://www.metmuseum.org/perspectives/playing-the-royal-game-of-ur',
    label: 'The Metropolitan Museum of Art: Playing the Royal Game of Ur',
  },
  {
    href: 'https://www.mastersofgames.com/rules/royal-game-of-ur-rules.htm',
    label: 'Masters Traditional Games: Royal Game of Ur Rules',
  },
]

export function UrRulesDrawer() {
  const { t } = useTranslation()
  const { guideSection, setGuideSection, setShowGuide, showGuide } =
    useSenetStore(useShallowSelector((state) => ({
      guideSection: state.guideSection,
      setGuideSection: state.setGuideSection,
      setShowGuide: state.setShowGuide,
      showGuide: state.showGuide,
    })))

  const modalContent = (
    <AnimatePresence>
      {showGuide ? (
        <div className="fixed inset-0 z-[9999] flex items-stretch justify-end">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ur-rules-drawer__backdrop flex-1 cursor-pointer border-0 bg-black/70 p-0 backdrop-blur-sm"
            onClick={() => setShowGuide(false)}
            aria-label={t('common.close')}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="ur-rules-drawer relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-s border-white/10 bg-[#130f0d]"
            aria-label={t('games.ur.rules.drawer_title')}
          >
            <div className="ur-rules-drawer__header flex items-start justify-between gap-4 px-6 py-5 sm:px-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#cab48b]">
                  {t('games.ur.rules.drawer_kicker')}
                </p>
                <h2 className="mt-2 font-serif text-2xl text-[#f5ead7] sm:text-3xl">
                  {t('games.ur.rules.drawer_title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="rounded-full border border-[#9d6e45]/50 bg-[#231814] p-2 text-[#e8c89b] transition-colors hover:bg-[#33211b]"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="ur-rules-drawer__tabs flex gap-2 overflow-x-auto px-6 pb-4 sm:px-8">
              {([
                ['quick_tour', t('games.ur.rules.tab_quick_tour')],
                ['rules', t('games.ur.rules.tab_rules')],
                ['attribution', t('games.ur.rules.tab_attribution')],
              ] as const).map(([section, label]) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setGuideSection(section)}
                  className={`ur-rules-drawer__tab ${
                    guideSection === section ? 'ur-rules-drawer__tab--active' : ''
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="ur-rules-drawer__body flex-1 overflow-y-auto px-6 pb-8 sm:px-8">
              {guideSection === 'attribution' ? (
                <div className="space-y-6">
                  <section className="ur-rules-drawer__section">
                    <h3 className="ur-rules-drawer__section-title">
                      {t('games.ur.attribution.title')}
                    </h3>
                    <p className="ur-rules-drawer__copy">
                      {t('games.ur.attribution.intro')}
                    </p>
                    <p className="ur-rules-drawer__copy">
                      {t('games.ur.attribution.original_artwork')}
                    </p>
                  </section>

                  <section className="ur-rules-drawer__section">
                    <h3 className="ur-rules-drawer__section-title">
                      {t('games.ur.attribution.sources_title')}
                    </h3>
                    <div className="space-y-3">
                      {SOURCES.map((source) => (
                        <a
                          key={source.href}
                          href={source.href}
                          target="_blank"
                          rel="noreferrer"
                          className="ur-rules-drawer__source"
                        >
                          <span>{source.label}</span>
                          <ExternalLink className="h-4 w-4 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </section>
                </div>
              ) : guideSection === 'rules' ? (
                <div className="space-y-5">
                  <section className="ur-rules-drawer__section">
                    <h3 className="ur-rules-drawer__section-title">
                      {t('games.ur.rules.summary_title')}
                    </h3>
                    <p className="ur-rules-drawer__copy">
                      {t('games.ur.rules.summary_body')}
                    </p>
                  </section>

                  <div className="space-y-4">
                    {RULE_ITEMS.map((item) => (
                      <section key={item} className="ur-rules-drawer__rule">
                        <h4 className="ur-rules-drawer__rule-title">
                          {t(`games.ur.rules.items.${item}.title`)}
                        </h4>
                        <p className="ur-rules-drawer__copy">
                          {t(`games.ur.rules.items.${item}.body`)}
                        </p>
                      </section>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <section className="ur-rules-drawer__section">
                    <h3 className="ur-rules-drawer__section-title">
                      {t('games.ur.quick_tour.title')}
                    </h3>
                    <p className="ur-rules-drawer__copy">
                      {t('games.ur.quick_tour.intro')}
                    </p>
                  </section>

                  <div className="space-y-3">
                    {QUICK_TOUR_STEPS.map((step) => (
                      <section key={step} className="ur-rules-drawer__tour-step">
                        <div className="ur-rules-drawer__tour-number">{step}</div>
                        <div>
                          <h4 className="ur-rules-drawer__rule-title">
                            {t(`games.ur.quick_tour.steps.${step}.title`)}
                          </h4>
                          <p className="ur-rules-drawer__copy">
                            {t(`games.ur.quick_tour.steps.${step}.body`)}
                          </p>
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
