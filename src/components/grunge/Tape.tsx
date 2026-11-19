import type { CSSProperties, ReactNode } from 'react'

interface TapeProps {
  className?: string
  rotate?: number
  style?: CSSProperties
}

/** Decorative strip of masking tape. Position it with utility classes (absolute). */
export function Tape({ className = '', rotate = -6, style }: TapeProps) {
  return <span aria-hidden="true" className={`tape ${className}`} style={{ transform: `rotate(${rotate}deg)`, ...style }} />
}

interface TapeLabelProps {
  children: ReactNode
  tone?: 'paper' | 'rust'
  rotate?: number
  className?: string
}

/** Readable label printed on tape — used for status labels and banners. Always pair with text, not colour alone. */
export function TapeLabel({ children, tone = 'paper', rotate = 0, className = '' }: TapeLabelProps) {
  return (
    <span
      className={`tape-label ${tone === 'rust' ? 'tape-label--rust' : ''} ${className}`}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      {children}
    </span>
  )
}
