import type { TFunction } from 'i18next'
import type { GameType, PlayerID, PlayerType } from '../engine/types'

type PlayerLike = PlayerID | 'spectator'

export function getPlayerLabel(
  t: TFunction,
  gameType: GameType,
  player: PlayerLike,
) {
  if (player === 'spectator') {
    return t('hud.players.spectator')
  }

  if (
    (gameType === 'hounds-and-jackals' || gameType === 'ur') &&
    (player === 'anubis' || player === 'sphinx')
  ) {
    return t(`games.${gameType}.players.${player}`, {
      defaultValue: t(`hud.players.${player}`),
    })
  }

  return t(`hud.players.${player}`)
}

export function getPieceLabel(
  t: TFunction,
  gameType: GameType,
  type: PlayerType,
) {
  if (gameType === 'mehen' && (type === 'lion' || type === 'ball')) {
    return t(`games.mehen.board.${type}`)
  }

  if (gameType === 'hounds-and-jackals' && type === 'peg') {
    return t('games.hounds-and-jackals.board.peg')
  }

  if (gameType === 'ur' && type === 'ur_token') {
    return t('games.ur.board.token', { defaultValue: 'Token' })
  }

  if (gameType === 'senet' && type === 'senet_piece') {
    return t('games.senet.board.piece', { defaultValue: 'Piece' })
  }

  return type
}
