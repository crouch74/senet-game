export const THEME_IDS = [
  'royal',
  'moonlit-necropolis',
  'nile-papyrus',
  'temple-fresco',
  'solar-court',
  'afterlife-ember',
  'desert-storm',
  'obsidian-oracle',
  'lotus-dawn',
] as const

export type ThemeId = (typeof THEME_IDS)[number]

export const DEFAULT_THEME: ThemeId = 'royal'
export const THEME_STORAGE_KEY = 'senet_theme'

export const THEMES: ReadonlyArray<{
  id: ThemeId
  labelKey: string
}> = [
  {
    id: 'royal',
    labelKey: 'hud.theme_options.royal',
  },
  {
    id: 'moonlit-necropolis',
    labelKey: 'hud.theme_options.moonlit_necropolis',
  },
  {
    id: 'nile-papyrus',
    labelKey: 'hud.theme_options.nile_papyrus',
  },
  {
    id: 'temple-fresco',
    labelKey: 'hud.theme_options.temple_fresco',
  },
  {
    id: 'solar-court',
    labelKey: 'hud.theme_options.solar_court',
  },
  {
    id: 'afterlife-ember',
    labelKey: 'hud.theme_options.afterlife_ember',
  },
  {
    id: 'desert-storm',
    labelKey: 'hud.theme_options.desert_storm',
  },
  {
    id: 'obsidian-oracle',
    labelKey: 'hud.theme_options.obsidian_oracle',
  },
  {
    id: 'lotus-dawn',
    labelKey: 'hud.theme_options.lotus_dawn',
  },
]

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && THEME_IDS.includes(value as ThemeId)
