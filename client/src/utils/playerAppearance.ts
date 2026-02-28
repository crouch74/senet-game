import type { PlayerID } from '../engine/types'
import { playerAnubis, playerSphinx } from '../assets/royal'

export interface PlayerAppearance {
  iconPath: string
  pieceClassName: string
  iconClassName: string
  tokenClassName: string
  accentClassName: string
  pillClassName: string
}

const APPEARANCES: Record<PlayerID, PlayerAppearance> = {
  anubis: {
    iconPath: playerAnubis,
    pieceClassName: 'bg-royal-gold',
    iconClassName: 'bg-royal-ebony',
    tokenClassName: 'piece-token--anubis',
    accentClassName: 'bg-royal-gold',
    pillClassName: 'bg-royal-gold text-ui-turn-pill-foreground border-yellow-300/50',
  },
  sphinx: {
    iconPath: playerSphinx,
    pieceClassName: 'bg-royal-ivory',
    iconClassName: 'bg-royal-gold',
    tokenClassName: 'piece-token--sphinx',
    accentClassName: 'bg-ui-turn-pill-bg border border-royal-gold/30',
    pillClassName: 'bg-ui-turn-pill-bg text-royal-gold border-royal-gold/80',
  },
  horus: {
    iconPath: playerAnubis,
    pieceClassName: 'bg-emerald-300',
    iconClassName: 'bg-emerald-950',
    tokenClassName: 'piece-token--horus',
    accentClassName: 'bg-emerald-300',
    pillClassName: 'bg-emerald-300/20 text-emerald-200 border-emerald-300/50',
  },
  seth: {
    iconPath: playerSphinx,
    pieceClassName: 'bg-red-400',
    iconClassName: 'bg-red-950',
    tokenClassName: 'piece-token--seth',
    accentClassName: 'bg-red-400',
    pillClassName: 'bg-red-400/20 text-red-100 border-red-300/50',
  },
  osiris: {
    iconPath: playerAnubis,
    pieceClassName: 'bg-sky-300',
    iconClassName: 'bg-sky-950',
    tokenClassName: 'piece-token--osiris',
    accentClassName: 'bg-sky-300',
    pillClassName: 'bg-sky-300/20 text-sky-100 border-sky-300/50',
  },
  isis: {
    iconPath: playerSphinx,
    pieceClassName: 'bg-fuchsia-300',
    iconClassName: 'bg-fuchsia-950',
    tokenClassName: 'piece-token--isis',
    accentClassName: 'bg-fuchsia-300',
    pillClassName: 'bg-fuchsia-300/20 text-fuchsia-100 border-fuchsia-300/50',
  },
}

export const getPlayerAppearance = (player: PlayerID) => APPEARANCES[player]
