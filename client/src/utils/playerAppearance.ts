import { playerAnubis, playerSphinx } from '../assets/royal'
import type { GameType, PlayerID } from '../engine/types'

export interface PlayerAppearance {
  glowVar: string
  iconPath: string
  pieceClassName: string
  iconClassName: string
  tokenClassName: string
  accentClassName: string
  pillClassName: string
}

const svgDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const makeDualIcon = (filledPath: string, strokedPath: string, viewBox = '0 0 28 28') =>
  svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path fill="currentColor" stroke="none" d="${filledPath}"/><path d="${strokedPath}"/></svg>`,
  )

const ICONS = {
  horus: makeDualIcon(
    'M7 19.8c.9-3.3 2.9-6 6.2-8.2 2-1.3 3.7-3.2 4.5-5.5 1.6 1.3 2.4 3 2.4 5.3 0 2.6-1.2 4.8-3.3 6.4 1.8.3 3.3 1.2 4.2 2.7-4.2.2-7.7.7-10.5 1.7-1.4.5-2.6 1-3.5 1.6z',
    'M11.3 9.3 8.9 6.7m8.8.2 2-2.6M10.8 15.1c1.5-.2 2.9-.8 4-1.8m.5 3.5c.6.7 1 1.5 1.1 2.5',
  ),
  seth: makeDualIcon(
    'M8 20.5c.6-3.4 2.1-6.2 4.7-8.3 1.7-1.4 2.8-3.4 3.2-6 1.8 1 2.8 2.9 2.8 5.1l3.4-1.9-1.8 4.2c1.5.8 2.4 2 3 3.8-4-.3-7.2-.2-9.8.4-2 .5-3.8 1.4-5.5 2.7z',
    'M18.4 8.6 21.7 5m-8.5 8.1 3.1-1.9m-4.6 6.1c1-.3 2.1-.4 3.3-.3',
  ),
  osiris: makeDualIcon(
    'M13.6 4.5c2.3 0 4.2 1.8 4.2 4.2 0 1.5-.8 2.8-2 3.5v8.4h2.1v2.2H10v-2.2h2.1v-8.4a4.2 4.2 0 0 1-2.1-3.5c0-2.4 1.9-4.2 4.3-4.2z',
    'M9.6 14.2h8m-6-7.1 2 2.2 2-2.2M9.4 17.4h8.4',
  ),
  isis: makeDualIcon(
    'M14 6.1c1.6 2.2 3.5 3.8 5.9 4.9 1.8.8 3 2 3.8 3.6-2 .5-4 .4-6-.2.8 1.6 1.1 3.3.8 5.3-1.7-1.2-3.2-2.6-4.5-4.4a17.9 17.9 0 0 1-4.5 4.4c-.3-2 .1-3.8.8-5.3-2 .6-4 .7-6 .2.8-1.6 2.1-2.8 3.8-3.6 2.4-1.1 4.3-2.7 5.9-4.9z',
    'M14 7.8v9.5M10.6 10.7h6.8',
  ),
  mehenSpiral: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18.6 7.4a6.4 6.4 0 1 0 1.2 9.8c2.4-2 2.5-5.6.3-7.5-1.8-1.7-4.8-1.5-6.3.3-1.2 1.4-1.2 3.6 0 4.8 1 .9 2.5 1 3.6.2"/></svg>`,
  ),
  mehenSun: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="14" r="4.2" fill="currentColor" stroke="none"/><path d="M14 4.5v3.1M14 20.4v3.1M4.5 14h3.1M20.4 14h3.1M7.4 7.4l2.2 2.2M18.4 18.4l2.2 2.2M20.6 7.4l-2.2 2.2M9.6 18.4l-2.2 2.2"/></svg>`,
  ),
  hound: makeDualIcon(
    'M7.7 20.4c.8-3.6 2.3-6.3 5-8.5 1.9-1.6 2.8-3.2 3.4-5.6 1.6 1 2.4 2.7 2.4 4.8 1.3.3 2.3 1.1 3 2.4.7 1.3 1 2.6.9 4-3.4-.8-6.4-1.2-9.2-1.1-2 .1-3.9.7-5.5 1.8z',
    'M10.9 9.1 8.1 6.1m8.7 7.1c1-.3 1.9-.9 2.7-1.7m-4 5.1c.4.8.7 1.8.7 2.8',
  ),
  jackal: makeDualIcon(
    'M8.2 20.8c.5-3.5 1.9-6.4 4.1-8.7 1.9-1.8 3.1-4 3.8-6.4 1.8 1 2.8 2.8 2.9 5.2l4-2.2-2 4.8c1.1 1.1 1.8 2.5 2 4.4-4.1-.6-7.4-.6-10 .2-1.9.5-3.5 1.5-4.8 2.7z',
    'M18.6 8.6 22.2 4m-9.5 8 3.5-2.3m-3.8 7.4c1.1-.2 2.3-.1 3.4.3',
  ),
  shell: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path fill="currentColor" stroke="none" d="M14 4.8c4.7 0 8.8 3.1 10.2 7.7-2.8.6-5.3 1.7-7.6 3.2-2.4 1.6-4.1 3.8-5.4 6.8-4.3-1.2-7.4-5.2-7.4-9.7 0-4.4 3.3-8 10.2-8z"/><path d="M14 7.1c1.9 1.5 2.9 3.2 3.1 5.2M12.2 10.2c1.8 1.1 3 2.5 3.5 4.1m-5.7-1.4c1.7.9 2.9 2 3.8 3.4m-4.9-1.1c1.3.5 2.4 1.3 3.2 2.4"/></svg>`,
  ),
  stone: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path fill="currentColor" stroke="none" d="M9.3 7.3 16.2 5l6 5.3-1.6 8-7.1 4.7-7-3.5-1-7.1z"/><path d="M9.3 7.3 14 12.2l8.2-1.9M14 12.2l-.5 10.8M6.4 11.3l7.6.9"/></svg>`,
  ),
} as const

const BASE_APPEARANCES: Record<PlayerID, Omit<PlayerAppearance, 'iconPath'>> = {
  anubis: {
    pieceClassName: 'bg-royal-gold',
    iconClassName: 'bg-royal-ebony',
    tokenClassName: 'piece-token--anubis',
    accentClassName: 'bg-royal-gold',
    pillClassName: 'bg-royal-gold text-ui-turn-pill-foreground border-yellow-300/50',
    glowVar: 'var(--ui-piece-glow-anubis)',
  },
  sphinx: {
    pieceClassName: 'bg-royal-ivory',
    iconClassName: 'bg-royal-gold',
    tokenClassName: 'piece-token--sphinx',
    accentClassName: 'bg-ui-turn-pill-bg border border-royal-gold/30',
    pillClassName: 'bg-ui-turn-pill-bg text-royal-gold border-royal-gold/80',
    glowVar: 'var(--ui-piece-glow-sphinx)',
  },
  horus: {
    pieceClassName: 'bg-emerald-300',
    iconClassName: 'bg-emerald-950',
    tokenClassName: 'piece-token--horus',
    accentClassName: 'bg-emerald-300',
    pillClassName: 'bg-emerald-300/20 text-emerald-200 border-emerald-300/50',
    glowVar: 'rgba(132, 231, 165, 0.38)',
  },
  seth: {
    pieceClassName: 'bg-red-400',
    iconClassName: 'bg-red-950',
    tokenClassName: 'piece-token--seth',
    accentClassName: 'bg-red-400',
    pillClassName: 'bg-red-400/20 text-red-100 border-red-300/50',
    glowVar: 'rgba(229, 107, 88, 0.35)',
  },
  osiris: {
    pieceClassName: 'bg-sky-300',
    iconClassName: 'bg-sky-950',
    tokenClassName: 'piece-token--osiris',
    accentClassName: 'bg-sky-300',
    pillClassName: 'bg-sky-300/20 text-sky-100 border-sky-300/50',
    glowVar: 'rgba(108, 198, 214, 0.32)',
  },
  isis: {
    pieceClassName: 'bg-fuchsia-300',
    iconClassName: 'bg-fuchsia-950',
    tokenClassName: 'piece-token--isis',
    accentClassName: 'bg-fuchsia-300',
    pillClassName: 'bg-fuchsia-300/20 text-fuchsia-100 border-fuchsia-300/50',
    glowVar: 'rgba(212, 128, 177, 0.34)',
  },
}

const GAME_ICONS: Partial<Record<GameType, Partial<Record<PlayerID, string>>>> = {
  senet: {
    anubis: playerAnubis,
    sphinx: playerSphinx,
  },
  mehen: {
    anubis: ICONS.mehenSpiral,
    sphinx: ICONS.mehenSun,
    horus: ICONS.horus,
    seth: ICONS.seth,
    osiris: ICONS.osiris,
    isis: ICONS.isis,
  },
  'hounds-and-jackals': {
    anubis: ICONS.hound,
    sphinx: ICONS.jackal,
  },
  ur: {
    anubis: ICONS.shell,
    sphinx: ICONS.stone,
  },
}

export const getPlayerAppearance = (
  player: PlayerID,
  gameType?: GameType,
): PlayerAppearance => {
  const base = BASE_APPEARANCES[player]
  const iconPath =
    (gameType ? GAME_ICONS[gameType]?.[player] : undefined) ??
    GAME_ICONS.senet?.[player] ??
    GAME_ICONS.mehen?.[player] ??
    playerAnubis

  return {
    ...base,
    iconPath,
  }
}
