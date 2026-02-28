export const THEME_IDS = [
  'royal',
  'moonlit-necropolis',
  'nile-papyrus',
  'color-blind',
  'amethyst-canopy',
  'red-oasis',
  'obsidian-eclipse',
  'turquoise-tomb',
  'sahara-mirage',
  'jade-sarcophagus',
  'lapis-lazuli',
  'copper-patina',
  'malachite-carnelian',
  'celestial-cartouche',
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
      id: 'color-blind',
      labelKey: 'hud.theme_options.color_blind',
    },
    {
      id: 'amethyst-canopy',
      labelKey: 'hud.theme_options.amethyst_canopy',
    },
    {
      id: 'red-oasis',
      labelKey: 'hud.theme_options.red_oasis',
    },
    {
      id: 'obsidian-eclipse',
      labelKey: 'hud.theme_options.obsidian_eclipse',
    },
    {
      id: 'turquoise-tomb',
      labelKey: 'hud.theme_options.turquoise_tomb',
    },
    {
      id: 'sahara-mirage',
      labelKey: 'hud.theme_options.sahara_mirage',
    },
    {
      id: 'jade-sarcophagus',
      labelKey: 'hud.theme_options.jade_sarcophagus',
    },
    {
      id: 'lapis-lazuli',
      labelKey: 'hud.theme_options.lapis_lazuli',
    },
    {
      id: 'copper-patina',
      labelKey: 'hud.theme_options.copper_patina',
    },
    {
      id: 'malachite-carnelian',
      labelKey: 'hud.theme_options.malachite_carnelian',
    },
    {
      id: 'celestial-cartouche',
      labelKey: 'hud.theme_options.celestial_cartouche',
    },
  ]

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && THEME_IDS.includes(value as ThemeId)
