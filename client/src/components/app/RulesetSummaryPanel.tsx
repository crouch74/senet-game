import { useTranslation } from 'react-i18next'
import type {
  GameType,
  HoundsAndJackalsConfig,
  MehenConfig,
  Ruleset,
} from '../../engine/types'
import { formatNumber } from '../../utils/format'

interface RulesetSummaryPanelProps {
  gameType: GameType
  houndsAndJackalsConfig?: HoundsAndJackalsConfig
  mehenConfig?: MehenConfig
  ruleset: Ruleset
}

export function RulesetSummaryPanel({
  gameType,
  houndsAndJackalsConfig,
  mehenConfig,
  ruleset,
}: RulesetSummaryPanelProps) {
  const { t } = useTranslation()
  const isMehen = gameType === 'mehen' && mehenConfig
  const isHoundsAndJackals =
    gameType === 'hounds-and-jackals' && houndsAndJackalsConfig

  if (isMehen) {
    return (
      <div className="bg-ui-rule-bg border-s-[2px] border-ui-rule-border rounded-e-lg p-5 text-sm shadow-inner shrink-0">
        <h3 className="text-ochre font-bold mb-2 flex items-center gap-2">
          <span>📜</span>
          {t('app.mehen_rules_title')}
        </h3>
        <p className="text-sand/80 mb-3 text-xs leading-relaxed italic border-b border-sand/20 pb-2">
          {t('ruleset.descriptions.mehen-standard')}
        </p>
        <ul className="text-sand/80 text-xs flex flex-col gap-1.5 list-none m-0 p-0">
          <li>
            <strong className="text-sand">{t('app.mehen_board_size')}</strong>{' '}
            {formatNumber(mehenConfig.boardSize)}
          </li>
          <li>
            <strong className="text-sand">{t('app.mehen_balls_per_player')}</strong>{' '}
            {formatNumber(mehenConfig.ballsPerPlayer)}
          </li>
          <li>
            <strong className="text-sand">{t('app.mehen_entry_rule')}</strong>{' '}
            {t('app.mehen_entry_from_reserve')}
          </li>
          <li>
            <strong className="text-sand">{t('app.mehen_finish_rule')}</strong>{' '}
            {t('app.mehen_exact_finish')}
          </li>
          <li>
            <strong className="text-sand">{t('app.mehen_capture_rule')}</strong>{' '}
            {t('app.mehen_send_to_start')}
          </li>
          <li>
            <strong className="text-sand">{t('app.mehen_lion_blocking')}</strong>{' '}
            {t('app.yes')}
          </li>
          <li>
            <strong className="text-sand">{t('app.mehen_safe_cells')}</strong>{' '}
            {mehenConfig.safeCells.map((cell) => formatNumber(cell)).join(', ')}
          </li>
          <li>
            <strong className="text-sand">{t('app.extra_throws')}</strong>{' '}
            {mehenConfig.extraRollValues.map((value) => formatNumber(value)).join(', ')}
          </li>
          <li>
            <strong className="text-sand">{t('app.mehen_forced_move')}</strong>{' '}
            {t('app.mehen_forced_move_value')}
          </li>
          <li>
            <strong className="text-sand">{t('app.mehen_win_condition')}</strong>{' '}
            {t('app.mehen_win_conditions.ALL_BALLS_AND_LION')}
          </li>
        </ul>
      </div>
    )
  }

  if (isHoundsAndJackals) {
    return (
      <div className="bg-ui-rule-bg border-s-[2px] border-ui-rule-border rounded-e-lg p-5 text-sm shadow-inner shrink-0">
        <h3 className="text-ochre font-bold mb-2 flex items-center gap-2">
          <span>📜</span>
          {t('app.hounds_rules_title')}
        </h3>
        <p className="text-sand/80 mb-3 text-xs leading-relaxed italic border-b border-sand/20 pb-2">
          {t('ruleset.descriptions.hounds-and-jackals-standard')}
        </p>
        <ul className="text-sand/80 text-xs flex flex-col gap-1.5 list-none m-0 p-0">
          <li>
            <strong className="text-sand">{t('app.hounds_track_length')}</strong>{' '}
            {formatNumber(houndsAndJackalsConfig.trackLength)}
          </li>
          <li>
            <strong className="text-sand">{t('app.hounds_pieces_per_player')}</strong>{' '}
            {formatNumber(houndsAndJackalsConfig.piecesPerPlayer)}
          </li>
          <li>
            <strong className="text-sand">{t('app.hounds_entry_rule')}</strong>{' '}
            {t('app.hounds_entry_any_roll')}
          </li>
          <li>
            <strong className="text-sand">{t('app.hounds_finish_rule')}</strong>{' '}
            {t('app.hounds_exact_finish')}
          </li>
          <li>
            <strong className="text-sand">{t('app.hounds_throw_mode')}</strong>{' '}
            {t('app.hounds_four_sticks')}
          </li>
          <li>
            <strong className="text-sand">{t('app.hounds_marked_holes')}</strong>{' '}
            {Object.entries(houndsAndJackalsConfig.specialHoles)
              .map(([source, specialHole]) =>
                t(
                  specialHole.type === 'good'
                    ? 'app.hounds_marked_hole_good'
                    : 'app.hounds_marked_hole_bad',
                  {
                    source: formatNumber(source),
                    target: formatNumber(specialHole.target),
                  },
                ),
              )
              .join('; ')}
          </li>
          <li>
            <strong className="text-sand">{t('app.hounds_capture_rule')}</strong>{' '}
            {t('app.no')}
          </li>
          <li>
            <strong className="text-sand">{t('app.hounds_blockade_rule')}</strong>{' '}
            {t('app.no')}
          </li>
        </ul>
      </div>
    )
  }

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
        {ruleset.id !== 'mehen-standard' && (
          <>
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
          </>
        )}
        <li>
          <strong className="text-sand">{t('app.bearing_off')}</strong>{' '}
          {ruleset.bearingOffRequirements === 'exact'
            ? t('app.requires_exact_throw')
            : t('app.any_sufficient_throw')}
        </li>
        <li>
          <strong className="text-sand">{t('app.sticks_count')}</strong>{' '}
          {formatNumber(ruleset.sticksCount ?? 4)}
        </li>
        <li>
          <strong className="text-sand">{t('app.extra_throws')}</strong>{' '}
          {ruleset.extraThrowConditions
            .map((val) => formatNumber(val))
            .join(', ')}
        </li>
      </ul>
    </div>
  )
}
