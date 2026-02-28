import { useTranslation } from 'react-i18next'
import type { Ruleset } from '../../engine/types'
import { formatNumber } from '../../utils/format'

interface RulesetSummaryPanelProps {
  ruleset: Ruleset
}

export function RulesetSummaryPanel({
  ruleset,
}: RulesetSummaryPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-ui-rule-bg border-s-[2px] border-ui-rule-border rounded-e-lg p-5 text-sm shadow-inner shrink-0">
      <h3 className="text-ochre font-bold mb-2 flex items-center gap-2">
        <span>📜</span>
        {t('app.rules_title', { name: t(`ruleset.names.${ruleset.id}`) })}
      </h3>
      <p className="text-sand/80 mb-3 text-xs leading-relaxed italic border-b border-sand/20 pb-2">
        {t(`ruleset.descriptions.${ruleset.id}`)}
      </p>
      <ul className="text-sand/80 text-xs flex flex-col gap-1.5 list-none m-0 p-0">
        <li>
          <strong className="text-sand">{t('app.capture_mode')}</strong>{' '}
          {ruleset.captureMode === 'swap'
            ? t('app.swap_positions')
            : t('app.forward_only')}
        </li>
        <li>
          <strong className="text-sand">{t('app.protected_adjacency')}</strong>{' '}
          {ruleset.protectedAdjacency
            ? t('app.yes_pieces', {
                num: formatNumber(ruleset.protectedAdjacencyCount),
              })
            : t('app.no')}
        </li>
        <li>
          <strong className="text-sand">{t('app.blockades')}</strong>{' '}
          {ruleset.blockadeLength > 0
            ? t('app.yes_pieces', { num: formatNumber(ruleset.blockadeLength) })
            : t('app.no')}
        </li>
        <li>
          <strong className="text-sand">{t('app.bearing_off')}</strong>{' '}
          {ruleset.bearingOffRequirements === 'exact'
            ? t('app.requires_exact_throw')
            : t('app.any_sufficient_throw')}
        </li>
      </ul>
    </div>
  )
}
