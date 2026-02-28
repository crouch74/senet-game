import { useTranslation } from 'react-i18next'
import { Crown, Scroll } from 'lucide-react'
import {
  house27Water,
  house28Feather,
  house29SunDisk,
  house30Falcon,
} from '../assets/royal'
import type { GameType } from '../engine/types'

interface LegendContentProps {
  gameType: GameType
}

interface RegistryItem {
  descKey: string
  icon: string
  id: string
  titleKey: string
  type: 'svg' | 'text'
}

const GUIDE_ITEMS: Record<GameType, string[]> = {
  senet: [
    'objective',
    'movement',
    'throwing',
    'capturing',
    'protection',
    'blockades',
    'special',
    'bearing_off',
  ],
  mehen: [
    'objective',
    'players',
    'opening',
    'setup',
    'entry',
    'turn',
    'movement',
    'throwing',
    'pieces',
    'capturing',
    'protection',
    'safe_spaces',
    'blocking',
    'finishing',
    'no_legal_move',
    'clarifications',
    'tie_rule',
    'winning',
  ],
  'hounds-and-jackals': [
    'objective',
    'players',
    'setup',
    'entry',
    'movement',
    'throwing',
    'marked_holes',
    'good_jumps',
    'bad_jumps',
    'stacking',
    'finishing',
    'blocked_turns',
    'winning',
    'reconstruction_note',
  ],
}

const REGISTRY_SECTIONS: Record<GameType, { items: RegistryItem[]; titleKey: string }> = {
  senet: {
    titleKey: 'games.senet.sacred_houses.title',
    items: [
      {
        id: 'h26',
        icon: '𓄤',
        type: 'text',
        titleKey: 'games.senet.sacred_houses.h26.title',
        descKey: 'games.senet.sacred_houses.h26.desc',
      },
      {
        id: 'h27',
        icon: house27Water,
        type: 'svg',
        titleKey: 'games.senet.sacred_houses.h27.title',
        descKey: 'games.senet.sacred_houses.h27.desc',
      },
      {
        id: 'h28',
        icon: house28Feather,
        type: 'svg',
        titleKey: 'games.senet.sacred_houses.h28.title',
        descKey: 'games.senet.sacred_houses.h28.desc',
      },
      {
        id: 'h29',
        icon: house29SunDisk,
        type: 'svg',
        titleKey: 'games.senet.sacred_houses.h29.title',
        descKey: 'games.senet.sacred_houses.h29.desc',
      },
      {
        id: 'h30',
        icon: house30Falcon,
        type: 'svg',
        titleKey: 'games.senet.sacred_houses.h30.title',
        descKey: 'games.senet.sacred_houses.h30.desc',
      },
    ],
  },
  mehen: {
    titleKey: 'games.mehen.sacred_coils.title',
    items: [
      {
        id: 'reserve',
        icon: '□',
        type: 'text',
        titleKey: 'games.mehen.sacred_coils.reserve.title',
        descKey: 'games.mehen.sacred_coils.reserve.desc',
      },
      {
        id: 'safe',
        icon: '◈',
        type: 'text',
        titleKey: 'games.mehen.sacred_coils.safe.title',
        descKey: 'games.mehen.sacred_coils.safe.desc',
      },
      {
        id: 'lion',
        icon: '𓃭',
        type: 'text',
        titleKey: 'games.mehen.sacred_coils.lion.title',
        descKey: 'games.mehen.sacred_coils.lion.desc',
      },
      {
        id: 'heart',
        icon: house29SunDisk,
        type: 'svg',
        titleKey: 'games.mehen.sacred_coils.heart.title',
        descKey: 'games.mehen.sacred_coils.heart.desc',
      },
    ],
  },
  'hounds-and-jackals': {
    titleKey: 'games.hounds-and-jackals.marked_holes.title',
    items: [
      {
        id: 'good',
        icon: 'nfr',
        type: 'text',
        titleKey: 'games.hounds-and-jackals.marked_holes.good.title',
        descKey: 'games.hounds-and-jackals.marked_holes.good.desc',
      },
      {
        id: 'bad',
        icon: '↘',
        type: 'text',
        titleKey: 'games.hounds-and-jackals.marked_holes.bad.title',
        descKey: 'games.hounds-and-jackals.marked_holes.bad.desc',
      },
      {
        id: 'reserve',
        icon: '𓎰',
        type: 'text',
        titleKey: 'games.hounds-and-jackals.marked_holes.reserve.title',
        descKey: 'games.hounds-and-jackals.marked_holes.reserve.desc',
      },
      {
        id: 'goal',
        icon: '◎',
        type: 'text',
        titleKey: 'games.hounds-and-jackals.marked_holes.goal.title',
        descKey: 'games.hounds-and-jackals.marked_holes.goal.desc',
      },
    ],
  },
}

function RegistryIcon({ icon, type }: Pick<RegistryItem, 'icon' | 'type'>) {
  if (type === 'text') {
    return (
      <span className="text-3xl text-royal-green drop-shadow-sm font-bold uppercase">
        {icon}
      </span>
    )
  }

  return (
    <div
      className="w-10 h-10 bg-royal-gold opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
      style={{
        maskImage: `url("${icon}")`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskImage: `url("${icon}")`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
      }}
    />
  )
}

export function LegendContent({ gameType }: LegendContentProps) {
  const { t } = useTranslation()
  const guideItems = GUIDE_ITEMS[gameType]
  const registrySection = REGISTRY_SECTIONS[gameType]

  return (
    <div className="legend-content-surface bg-ui-legend-paper p-8 md:p-14 text-ui-paper-text relative overflow-hidden">
      <div className="absolute inset-4 border border-royal-gold/10 pointer-events-none" />

      <section className="relative z-10 mb-16">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-px bg-royal-gold/40 mb-4" />
          <h3 className="text-ui-paper-text font-serif text-3xl md:text-4xl text-center tracking-[0.16em] uppercase font-semibold drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">
            {t(`games.${gameType}.legend.title`)}
          </h3>
          <div className="w-24 h-[2px] bg-royal-gold/20 mt-4" />
        </div>

        <div className="space-y-6 font-serif text-lg md:text-xl leading-relaxed italic text-ui-paper-text opacity-90 max-w-2xl mx-auto text-center rtl:text-right ltr:text-left">
          <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-royal-gold first-letter:me-2 first-letter:float-left rtl:first-letter:float-right">
            {t(`games.${gameType}.legend.p1`)}
          </p>
          <p>{t(`games.${gameType}.legend.p2`)}</p>
          <p className="border-t border-royal-gold/10 pt-6 mt-6">
            {t(`games.${gameType}.legend.p3`)}
          </p>
        </div>
      </section>

      <div className="w-full flex items-center justify-center my-12 opacity-30">
        <div className="flex-1 h-px bg-royal-gold" />
        <Crown className="mx-6 w-6 h-6 text-royal-gold" />
        <div className="flex-1 h-px bg-royal-gold" />
      </div>

      <section className="relative z-10 mb-16">
        <h3 className="text-ui-paper-text font-serif text-2xl md:text-3xl mb-12 text-center tracking-[0.16em] font-semibold uppercase">
          {t(registrySection.titleKey)}
        </h3>

        <div className="grid grid-cols-1 gap-8 max-w-lg mx-auto">
          {registrySection.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-6 group hover:translate-x-1 transition-transform duration-300"
            >
              <div className="shrink-0 w-16 h-16 flex items-center justify-center bg-royal-ebony/5 border-2 border-royal-gold/15 rounded-sm shadow-sm group-hover:border-royal-gold/40 transition-all duration-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-royal-gold/0 group-hover:bg-royal-gold/5 transition-colors" />
                <RegistryIcon icon={item.icon} type={item.type} />
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-ui-paper-text uppercase tracking-[0.18em] text-base">
                  {t(item.titleKey)}
                </h4>
                <p className="font-serif text-ui-paper-text opacity-80 text-base leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="w-full flex items-center justify-center my-12 opacity-30">
        <div className="flex-1 h-px bg-royal-gold" />
        <Scroll className="mx-6 w-6 h-6 text-royal-gold" />
        <div className="flex-1 h-px bg-royal-gold" />
      </div>

      <section className="relative z-10 max-w-xl mx-auto">
        <h3 className="text-ui-paper-text font-serif text-3xl md:text-4xl mb-12 text-center tracking-[0.16em] font-semibold uppercase">
          {t(`games.${gameType}.guide.title`)}
        </h3>

        <ul className="space-y-8">
          {guideItems.map((key) => (
            <li key={key} className="flex gap-5 items-start">
              <div className="shrink-0 mt-2 w-2 h-2 bg-royal-gold rotate-45" />
              <div className="flex flex-col">
                <span className="font-bold text-ui-paper-text uppercase text-sm tracking-[0.18em] mb-2 opacity-90">
                  {t(`games.${gameType}.guide.labels.${key}`)}
                </span>
                <span className="font-serif text-ui-paper-text opacity-90 text-lg md:text-xl leading-relaxed">
                  {t(`games.${gameType}.guide.${key}`)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-royal-gold/20 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-royal-gold/20 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-royal-gold/20 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-royal-gold/20 pointer-events-none" />
    </div>
  )
}
