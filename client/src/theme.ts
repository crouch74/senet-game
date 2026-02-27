export const THEME_IDS = [
    'royal',
    'moonlit-necropolis',
    'nile-papyrus',
    'temple-fresco',
    'solar-court',
    'afterlife-ember'
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = 'royal';
export const THEME_STORAGE_KEY = 'senet_theme';

export const THEMES: ReadonlyArray<{
    id: ThemeId;
    labelKey: string;
    descriptionKey: string;
}> = [
    {
        id: 'royal',
        labelKey: 'hud.theme_options.royal',
        descriptionKey: 'hud.theme_descriptions.royal'
    },
    {
        id: 'moonlit-necropolis',
        labelKey: 'hud.theme_options.moonlit_necropolis',
        descriptionKey: 'hud.theme_descriptions.moonlit_necropolis'
    },
    {
        id: 'nile-papyrus',
        labelKey: 'hud.theme_options.nile_papyrus',
        descriptionKey: 'hud.theme_descriptions.nile_papyrus'
    },
    {
        id: 'temple-fresco',
        labelKey: 'hud.theme_options.temple_fresco',
        descriptionKey: 'hud.theme_descriptions.temple_fresco'
    },
    {
        id: 'solar-court',
        labelKey: 'hud.theme_options.solar_court',
        descriptionKey: 'hud.theme_descriptions.solar_court'
    },
    {
        id: 'afterlife-ember',
        labelKey: 'hud.theme_options.afterlife_ember',
        descriptionKey: 'hud.theme_descriptions.afterlife_ember'
    }
];

export const isThemeId = (value: unknown): value is ThemeId =>
    typeof value === 'string' && THEME_IDS.includes(value as ThemeId);
