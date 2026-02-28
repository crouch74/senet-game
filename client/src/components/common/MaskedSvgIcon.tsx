import type { CSSProperties, ReactNode } from 'react'

interface MaskedSvgIconProps {
  children?: ReactNode
  className?: string
  src: string
  style?: CSSProperties
}

export function MaskedSvgIcon({
  children,
  className,
  src,
  style,
}: MaskedSvgIconProps) {
  return (
    <div
      className={className}
      style={{
        WebkitMaskImage: `url("${src}")`,
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskImage: `url("${src}")`,
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskSize: 'contain',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
