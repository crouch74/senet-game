import { Scroll } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThrowSticksState } from '../../../hooks/useThrowSticksState'
import {
  useShallowSelector,
} from '../../../engine/selectors'
import { useSenetStore } from '../../../engine/store'
import { getPlayerLabel } from '../../../utils/gameLabels'
import { cn } from '../../../utils/cn'

const ROLLING_PATTERN = [true, false, true, false]
const UR_ROSETTES = new Set([4, 8, 14])

function UrDie({
  isMarked,
  isRolling,
  rotationDeg,
}: {
  isMarked: boolean
  isRolling: boolean
  rotationDeg: number
}) {
  return (
    <div
      className={cn(
        'ur-die',
        isMarked && 'ur-die--marked',
        isRolling && 'ur-die--rolling',
      )}
      style={{ transform: `rotate(${rotationDeg}deg)` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="ur-die__svg">
        <path
          d="M50 9 L90 79 L10 79 Z"
          style={{
            fill: '#e7dcc5',
            stroke: '#6f5239',
            strokeWidth: 2,
          }}
        />
        <path
          d="M50 21 L78 71 L22 71 Z"
          style={{
            fill: '#c9ad82',
            opacity: 0.92,
          }}
        />
        <circle
          cx="50"
          cy="56"
          r="9"
          style={{
            fill: isMarked
              ? '#2d6988'
              : '#3c2d22',
            stroke: isMarked
              ? '#173a4d'
              : '#211812',
            strokeWidth: 1.5,
          }}
        />
        <circle
          cx="44"
          cy="48"
          r="2.3"
          style={{ fill: 'rgba(255,255,255,0.32)' }}
        />
      </svg>
    </div>
  )
}

export function StatusPanel() {
  const { t } = useTranslation()
  const {
    board,
    currentPlayer,
    currentThrow,
    gameType,
    hoveredPieceId,
    isAutoRolling,
    legalMoves,
    moveError,
    setGuideSection,
    setShowGuide,
    throwSticks,
    winner,
    lastMove,
  } = useSenetStore(useShallowSelector((state) => ({
    board: state.board,
    currentPlayer: state.currentPlayer,
    currentThrow: state.currentThrow,
    gameType: state.gameType,
    hoveredPieceId: state.hoveredPieceId,
    isAutoRolling: state.isAutoRolling,
    legalMoves: state.legalMoves,
    moveError: state.moveError,
    setGuideSection: state.setGuideSection,
    setShowGuide: state.setShowGuide,
    throwSticks: state.throwSticks,
    winner: state.winner,
    lastMove: state.lastMove,
  })))

  const { handleThrow, isMyTurn, isThrowing } = useThrowSticksState({
    currentPlayer,
    currentThrow,
    isAutoRolling,
    throwSticks,
    winner,
    sticksCount: 4,
  })

  const activeMove = hoveredPieceId
    ? legalMoves.find((move) => move.pieceId === hoveredPieceId)
    : null

  const diceFaces = isThrowing
    ? ROLLING_PATTERN
    : currentThrow?.binaryDice ?? [false, false, false, false]

  const shellReserve = board.filter(
    (piece) => piece.player === 'anubis' && piece.position === 0,
  ).length
  const shellBorneOff = board.filter(
    (piece) => piece.player === 'anubis' && piece.position === 15,
  ).length
  const stoneReserve = board.filter(
    (piece) => piece.player === 'sphinx' && piece.position === 0,
  ).length
  const stoneBorneOff = board.filter(
    (piece) => piece.player === 'sphinx' && piece.position === 15,
  ).length
  const lastMovedPiece = lastMove
    ? board.find((piece) => piece.id === lastMove.pieceId)
    : null
  const showExtraTurnBadge = Boolean(
    lastMove &&
      lastMovedPiece &&
      lastMovedPiece.player === currentPlayer &&
      UR_ROSETTES.has(lastMove.to),
  )
  const dieRotations = diceFaces.map(
    (isMarked, index) =>
      ((currentThrow?.value ?? 0) * 3 + index * 7 + (isMarked ? -4 : 5)) % 18 - 9,
  )

  const hint =
    moveError
      ? t(`games.ur.illegal.${moveError}`)
      : winner
        ? t('games.ur.status.match_complete')
        : !currentThrow
          ? isMyTurn
            ? t('games.ur.status.roll_prompt')
            : t('games.ur.status.wait_prompt')
          : currentThrow.value === 0
            ? t('games.ur.status.zero_prompt')
            : activeMove
              ? activeMove.targetSquare === 15
                ? t('games.ur.status.active_target_bear_off')
                : t('games.ur.status.active_target', {
                    square: activeMove.targetSquare,
                  })
              : t('games.ur.status.choose_token')

  const turnLabel =
    isMyTurn && !winner
      ? t('games.ur.status.your_turn')
      : t('throw.turn', {
          player: getPlayerLabel(t, gameType, currentPlayer),
        })

  return (
    <aside className="ur-status-panel h-full p-5 backdrop-blur-sm sm:p-6">
      <div className="ur-status-panel__header">
        <p className="ur-status-panel__kicker">
          {t('games.ur.status.kicker')}
        </p>
        <h2 className="ur-status-panel__turn">
          {turnLabel}
        </h2>
      </div>

      <div className="ur-status-panel__dice-wrap">
        <div className="ur-status-panel__dice-summary">
          <div className="ur-status-panel__total">
            <span className="ur-status-panel__total-label">
              {t('games.ur.status.total')}
            </span>
            <span className="ur-status-panel__total-value">
              {currentThrow?.value ?? 0}
            </span>
          </div>

          <div className="ur-status-panel__dice" dir="ltr">
            {diceFaces.map((isMarked, index) => (
              <UrDie
                key={index}
                isMarked={isMarked}
                isRolling={isThrowing}
                rotationDeg={dieRotations[index]}
              />
            ))}
          </div>
        </div>

        {showExtraTurnBadge ? (
          <div className="ur-status-panel__badge">
            <span className="ur-status-panel__badge-rosette" aria-hidden="true" />
            <span>{t('games.ur.status.extra_turn_badge')}</span>
          </div>
        ) : null}

        {!currentThrow ? (
          <button
            type="button"
            onClick={handleThrow}
            disabled={!isMyTurn || Boolean(winner) || isThrowing}
            className="ur-status-panel__throw"
          >
            {t('games.ur.status.throw_button')}
          </button>
        ) : null}
      </div>

      <div className={cn('ur-status-panel__hint', moveError && 'ur-status-panel__hint--error')}>
        {hint}
      </div>

      <div className="ur-status-panel__counts">
        <section className="ur-status-panel__count-card ur-status-panel__count-card--shell">
          <h3>{t('games.ur.players.anubis')}</h3>
          <p>
            {t('games.ur.status.reserve')}: <strong>{shellReserve}</strong>
          </p>
          <p>
            {t('games.ur.status.borne_off')}: <strong>{shellBorneOff}</strong>
          </p>
        </section>
        <section className="ur-status-panel__count-card ur-status-panel__count-card--stone">
          <h3>{t('games.ur.players.sphinx')}</h3>
          <p>
            {t('games.ur.status.reserve')}: <strong>{stoneReserve}</strong>
          </p>
          <p>
            {t('games.ur.status.borne_off')}: <strong>{stoneBorneOff}</strong>
          </p>
        </section>
      </div>

      <button
        type="button"
        onClick={() => {
          setGuideSection('rules')
          setShowGuide(true)
        }}
        className="ur-status-panel__rules"
      >
        <Scroll className="h-4 w-4" />
        <span>{t('games.ur.status.rules_button')}</span>
      </button>
    </aside>
  )
}
