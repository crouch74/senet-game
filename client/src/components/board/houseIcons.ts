import {
  house26Ankh,
  house27Water,
  house28Feather,
  house29SunDisk,
  house30Falcon,
} from '../../assets/royal'

export type HouseIcon =
  | {
      className?: string
      repeat?: number
      stack?: boolean
      type: 'text'
      value: string
    }
  | {
      backgroundClassName: string
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
        backgroundClassName: 'bg-royal-blue',
      }
    case 26:
      return {
        type: 'text',
        value: '𓄤 𓄤 𓄤',
        className: 'text-royal-green drop-shadow-[0_0_8px_rgba(55,139,110,0.6)]',
      }
    case 27:
      return {
        type: 'svg',
        value: house27Water,
        backgroundClassName: 'bg-royal-blue',
        repeat: 3,
        stack: true,
      }
    case 28:
      return {
        type: 'svg',
        value: house28Feather,
        backgroundClassName: 'bg-royal-ivory',
        repeat: 3,
      }
    case 29:
      return {
        type: 'svg',
        value: house29SunDisk,
        backgroundClassName: 'bg-royal-gold',
        repeat: 2,
        stack: true,
      }
    case 30:
      return {
        type: 'svg',
        value: house30Falcon,
        backgroundClassName: 'bg-royal-gold',
      }
    default:
      return null
  }
}
