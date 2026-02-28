import {
  house26Ankh,
  house27Water,
  house28Feather,
  house29SunDisk,
  house30Falcon,
} from '../../assets/royal'
import type { CSSProperties } from 'react'

export type HouseIcon =
  | {
      className?: string
      repeat?: number
      stack?: boolean
      style?: CSSProperties
      type: 'text'
      value: string
    }
  | {
      backgroundClassName?: string
      backgroundStyle?: CSSProperties
      repeat?: number
      stack?: boolean
      type: 'svg'
      value: string
    }

export const getHouseIcon = (number: number): HouseIcon | null => {
  switch (number) {
    case 15:
      return {
        type: 'svg',
        value: house26Ankh,
        // Theme tokens keep special-square symbols readable against each board skin.
        backgroundStyle: {
          backgroundColor: 'var(--ui-square-icon-water)',
          filter: 'drop-shadow(0 0 10px var(--ui-square-icon-water-shadow))',
        },
      }
    case 26:
      return {
        type: 'text',
        value: '𓄤 𓄤 𓄤',
        style: {
          color: 'var(--ui-square-icon-life)',
          textShadow: '0 0 8px var(--ui-square-icon-life-shadow)',
        },
      }
    case 27:
      return {
        type: 'svg',
        value: house27Water,
        backgroundStyle: {
          backgroundColor: 'var(--ui-square-icon-water)',
          filter: 'drop-shadow(0 0 10px var(--ui-square-icon-water-shadow))',
        },
        repeat: 3,
        stack: true,
      }
    case 28:
      return {
        type: 'svg',
        value: house28Feather,
        backgroundStyle: {
          backgroundColor: 'var(--ui-square-icon-light)',
          filter: 'drop-shadow(0 0 10px var(--ui-square-icon-light-shadow))',
        },
        repeat: 3,
      }
    case 29:
      return {
        type: 'svg',
        value: house29SunDisk,
        backgroundStyle: {
          backgroundColor: 'var(--ui-square-icon-solar)',
          filter: 'drop-shadow(0 0 10px var(--ui-square-icon-solar-shadow))',
        },
        repeat: 2,
        stack: true,
      }
    case 30:
      return {
        type: 'svg',
        value: house30Falcon,
        backgroundStyle: {
          backgroundColor: 'var(--ui-square-icon-solar)',
          filter: 'drop-shadow(0 0 10px var(--ui-square-icon-solar-shadow))',
        },
      }
    default:
      return null
  }
}
