import type { ReactNode } from 'react'
import type { UrBoardSquare } from '../boardMetadata'

const PALETTE = {
  binder: '#3f2b20',
  binderSoft: '#624734',
  shellLight: '#f2e6cf',
  shellMid: '#ddc7a6',
  shellShadow: '#b99772',
  lapis: '#366c88',
  lapisDeep: '#1d4557',
  carnelian: '#bb5d39',
  carnelianDeep: '#7c311d',
}

type SvgProps = {
  prefix: string
  wear: number
}

function TileBase({
  children,
  prefix,
  wear,
}: SvgProps & { children: ReactNode }) {
  const scratchOpacity = Math.min(0.14, 0.05 + wear * 0.12)
  const wearOpacity = Math.min(0.18, 0.05 + wear * 0.14)

  return (
    <svg viewBox="0 0 100 100" className="ur-square__tile-svg" aria-hidden="true">
      <defs>
        <linearGradient id={`${prefix}-shell-base`} x1="16%" y1="8%" x2="84%" y2="100%">
          <stop offset="0%" stopColor={PALETTE.shellLight} />
          <stop offset="56%" stopColor={PALETTE.shellMid} />
          <stop offset="100%" stopColor={PALETTE.shellShadow} />
        </linearGradient>
        <linearGradient id={`${prefix}-shell-chip`} x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#fbf3e1" />
          <stop offset="100%" stopColor={PALETTE.shellShadow} />
        </linearGradient>
        <linearGradient id={`${prefix}-lapis-fill`} x1="12%" y1="10%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#4a85a3" />
          <stop offset="100%" stopColor={PALETTE.lapisDeep} />
        </linearGradient>
        <linearGradient id={`${prefix}-carnelian-fill`} x1="18%" y1="10%" x2="84%" y2="100%">
          <stop offset="0%" stopColor="#d57a52" />
          <stop offset="100%" stopColor={PALETTE.carnelianDeep} />
        </linearGradient>
      </defs>

      <rect
        x="6.5"
        y="6.5"
        width="87"
        height="87"
        rx="2.6"
        fill={`url(#${prefix}-shell-base)`}
        stroke={PALETTE.binder}
        strokeWidth="1.8"
      />
      <rect
        x="10.5"
        y="10.5"
        width="79"
        height="79"
        rx="1.8"
        fill="none"
        stroke={PALETTE.binderSoft}
        strokeOpacity="0.46"
        strokeWidth="1"
      />
      <path
        d="M14 19 C24 15, 36 14.5, 47 17"
        fill="none"
        stroke="#fff9ef"
        strokeOpacity="0.18"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M69 20 C76 21, 83 25, 87 31"
        fill="none"
        stroke={PALETTE.binder}
        strokeOpacity={wearOpacity}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M20 72 L31 62"
        fill="none"
        stroke={PALETTE.binder}
        strokeOpacity={scratchOpacity}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M58 25 L68 17"
        fill="none"
        stroke={PALETTE.binder}
        strokeOpacity={scratchOpacity}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M68 73 L79 61"
        fill="none"
        stroke="#fff8ea"
        strokeOpacity={scratchOpacity * 0.55}
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {children}

      <circle cx="17" cy="83" r="1.25" fill={PALETTE.binder} opacity={wearOpacity * 0.8} />
      <circle cx="82" cy="18" r="1.1" fill="#fff8ea" opacity={scratchOpacity * 0.65} />
      <circle cx="73" cy="83" r="0.85" fill={PALETTE.binder} opacity={wearOpacity * 0.75} />
    </svg>
  )
}

function RosetteMotif({ prefix, wear }: SvgProps) {
  return (
    <TileBase prefix={prefix} wear={wear}>
      <g transform="translate(50 50)">
        {Array.from({ length: 8 }, (_, index) => (
          <g key={index} transform={`rotate(${index * 45})`}>
            <path
              d="M0 -31 C8 -31.8 12 -24.5 11 -15 C10 -7 4 9 0 24 C-4 9 -10 -7 -11 -15 C-12 -24.5 -8 -31.8 0 -31 Z"
              fill={PALETTE.binder}
              opacity="0.18"
              transform="translate(1.1 1.4)"
            />
            <path
              d="M0 -31 C7.5 -30.6 11.2 -24.2 10.3 -15 C9.4 -7.2 3.6 8.8 0 23 C-3.8 8.8 -9.6 -7.2 -10.4 -15 C-11.2 -24.2 -7.4 -30.6 0 -31 Z"
              fill={`url(#${prefix}-shell-chip)`}
              stroke={PALETTE.binder}
              strokeWidth="1"
            />
            <path
              d="M0 -27.5 C4.5 -27.2 6.8 -23.3 6.4 -17.6 C6 -12.9 2.6 -3.8 0 6.8 C-2.4 -3.8 -5.9 -12.9 -6.4 -17.6 C-6.9 -23.2 -4.4 -27.1 0 -27.5 Z"
              fill="#fff7ea"
              opacity="0.34"
            />
            <circle
              cx="0"
              cy="-17"
              r="3.4"
              fill={`url(#${prefix}-lapis-fill)`}
              stroke={PALETTE.binder}
              strokeWidth="0.8"
            />
          </g>
        ))}
        <circle
          r="8.8"
          fill={`url(#${prefix}-carnelian-fill)`}
          stroke={PALETTE.binder}
          strokeWidth="1"
        />
        <circle cx="0" cy="0" r="4.2" fill={`url(#${prefix}-lapis-fill)`} stroke={PALETTE.binder} strokeWidth="0.8" />
        <circle cx="-2.2" cy="-2.6" r="1.5" fill="#f7e7cd" opacity="0.48" />
      </g>
    </TileBase>
  )
}

function EyeMotif({ prefix, wear }: SvgProps) {
  return (
    <TileBase prefix={prefix} wear={wear}>
      <path
        d="M17 50 C28 31 72 31.5 84 50 C71.5 68.4 28.4 68.7 17 50 Z"
        fill={PALETTE.binder}
        opacity="0.18"
        transform="translate(1.2 1.4)"
      />
      <path
        d="M16.8 50 C28.2 30.5 71.8 31 83.5 50 C71.4 69.3 28.5 69.6 16.8 50 Z"
        fill={`url(#${prefix}-shell-chip)`}
        stroke={PALETTE.binder}
        strokeWidth="1.4"
      />
      <path
        d="M27 50 C34.8 39.2 64.8 39.4 73 50 C64.8 60.7 35 60.8 27 50 Z"
        fill="#fff6e8"
        opacity="0.42"
        stroke={PALETTE.binderSoft}
        strokeOpacity="0.34"
        strokeWidth="0.8"
      />
      <circle cx="50" cy="50" r="10.8" fill={`url(#${prefix}-lapis-fill)`} stroke={PALETTE.binder} strokeWidth="1.2" />
      <circle cx="50" cy="50" r="4.6" fill={PALETTE.shellLight} stroke={PALETTE.binderSoft} strokeWidth="0.8" opacity="0.76" />
      <path
        d="M50 60 L56 69 L50 74 L44 69 Z"
        fill={`url(#${prefix}-carnelian-fill)`}
        stroke={PALETTE.binder}
        strokeWidth="0.9"
      />
      <circle cx="36.5" cy="46.5" r="1.7" fill="#fff7ea" opacity="0.42" />
    </TileBase>
  )
}

function CheckerLatticeMotif({ prefix, wear }: SvgProps) {
  const cells = [
    { x: 30, y: 24, lapis: false },
    { x: 50, y: 24, lapis: true },
    { x: 70, y: 24, lapis: false },
    { x: 30, y: 50, lapis: true },
    { x: 50, y: 50, lapis: false, carnelian: true },
    { x: 70, y: 50, lapis: true },
    { x: 30, y: 76, lapis: false },
    { x: 50, y: 76, lapis: true },
    { x: 70, y: 76, lapis: false },
  ]

  return (
    <TileBase prefix={prefix} wear={wear}>
      {cells.map((cell, index) => (
        <g key={index} transform={`translate(${cell.x} ${cell.y})`}>
          <path
            d="M0 -9.8 L9.6 0 L0 9.8 L-9.4 0 Z"
            fill={PALETTE.binder}
            opacity="0.16"
            transform="translate(1 1)"
          />
          <path
            d="M0 -9.4 L9.2 0 L0 9.4 L-9.1 0 Z"
            fill={cell.lapis ? `url(#${prefix}-lapis-fill)` : `url(#${prefix}-shell-chip)`}
            stroke={PALETTE.binder}
            strokeWidth="0.9"
          />
          <path
            d="M0 -6.2 L6 0 L0 6.2 L-6 0 Z"
            fill={cell.lapis ? '#6b9ab0' : '#fff5e5'}
            opacity="0.28"
          />
          {cell.carnelian ? (
            <circle cx="0" cy="0" r="2.4" fill={`url(#${prefix}-carnelian-fill)`} stroke={PALETTE.binder} strokeWidth="0.65" />
          ) : null}
        </g>
      ))}
      <path
        d="M20 37 L40 17 L60 37 L80 17"
        fill="none"
        stroke={PALETTE.binderSoft}
        strokeOpacity="0.42"
        strokeWidth="1"
      />
      <path
        d="M20 63 L40 43 L60 63 L80 43"
        fill="none"
        stroke={PALETTE.binderSoft}
        strokeOpacity="0.42"
        strokeWidth="1"
      />
    </TileBase>
  )
}

function StarClusterMotif({ prefix, wear }: SvgProps) {
  return (
    <TileBase prefix={prefix} wear={wear}>
      <g transform="translate(50 50)">
        {[
          'M0 -26 L6 -9 L0 1 L-6 -9 Z',
          'M26 0 L9 6 L-1 0 L9 -6 Z',
          'M0 26 L-6 9 L0 -1 L6 9 Z',
          'M-26 0 L-9 -6 L1 0 L-9 6 Z',
        ].map((d, index) => (
          <path
            key={index}
            d={d}
            fill={`url(#${prefix}-shell-chip)`}
            stroke={PALETTE.binder}
            strokeWidth="1"
          />
        ))}
        {[
          'M11 -18 L18 -11 L8 -4 L1 -11 Z',
          'M18 11 L11 18 L4 8 L11 1 Z',
          'M-11 18 L-18 11 L-8 4 L-1 11 Z',
          'M-18 -11 L-11 -18 L-4 -8 L-11 -1 Z',
        ].map((d, index) => (
          <path
            key={index}
            d={d}
            fill={`url(#${prefix}-lapis-fill)`}
            stroke={PALETTE.binder}
            strokeWidth="0.9"
          />
        ))}
        <circle r="7.4" fill={`url(#${prefix}-carnelian-fill)`} stroke={PALETTE.binder} strokeWidth="0.95" />
        <circle cx="0" cy="0" r="3.2" fill="#f8ecd7" opacity="0.42" />
        {[
          [0, -33],
          [33, 0],
          [0, 33],
          [-33, 0],
        ].map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r="3.3" fill={`url(#${prefix}-lapis-fill)`} stroke={PALETTE.binder} strokeWidth="0.75" />
        ))}
      </g>
    </TileBase>
  )
}

function SteppedChevronMotif({ prefix, wear }: SvgProps) {
  return (
    <TileBase prefix={prefix} wear={wear}>
      <path
        d="M22 24 H34 V32 H42 V40 H50 V48 H58 V40 H66 V32 H78 V24 H66 V31 H58 V39 H50 V47 H42 V39 H34 V31 H22 Z"
        fill={`url(#${prefix}-shell-chip)`}
        stroke={PALETTE.binder}
        strokeWidth="1.1"
      />
      <path
        d="M22 76 H34 V68 H42 V60 H50 V52 H58 V60 H66 V68 H78 V76 H66 V69 H58 V61 H50 V53 H42 V61 H34 V69 H22 Z"
        fill={`url(#${prefix}-shell-chip)`}
        stroke={PALETTE.binder}
        strokeWidth="1.1"
      />
      <path
        d="M28 24 H34 V30 H42 V38 H50 V46 H58 V38 H66 V30 H72"
        fill="none"
        stroke="#fff7e8"
        strokeOpacity="0.32"
        strokeWidth="0.9"
      />
      <path
        d="M28 76 H34 V70 H42 V62 H50 V54 H58 V62 H66 V70 H72"
        fill="none"
        stroke="#fff7e8"
        strokeOpacity="0.24"
        strokeWidth="0.9"
      />
      <circle cx="33" cy="50" r="3.5" fill={`url(#${prefix}-lapis-fill)`} stroke={PALETTE.binder} strokeWidth="0.8" />
      <circle cx="50" cy="50" r="4.2" fill={`url(#${prefix}-carnelian-fill)`} stroke={PALETTE.binder} strokeWidth="0.8" />
      <circle cx="67" cy="50" r="3.5" fill={`url(#${prefix}-lapis-fill)`} stroke={PALETTE.binder} strokeWidth="0.8" />
    </TileBase>
  )
}

export function UrTileMotif({ square }: { square: UrBoardSquare }) {
  const prefix = `ur-${square.id}-${square.motif}`

  if (square.motif === 'rosette') {
    return <RosetteMotif prefix={prefix} wear={square.wear} />
  }

  if (square.motif === 'eye') {
    return <EyeMotif prefix={prefix} wear={square.wear} />
  }

  if (square.motif === 'checker-lattice') {
    return <CheckerLatticeMotif prefix={prefix} wear={square.wear} />
  }

  if (square.motif === 'stepped-chevron') {
    return <SteppedChevronMotif prefix={prefix} wear={square.wear} />
  }

  return <StarClusterMotif prefix={prefix} wear={square.wear} />
}
