import type { ReactNode } from 'react'

interface HighlightProps {
  children: ReactNode
  /** rust swipe with paper text (5.9:1) or paper swipe with ink text. */
  tone?: 'rust' | 'paper'
  className?: string
}

/** Marker swipe behind key words (reference 01, re-coloured to the fixed palette). */
export function Highlight({ children, tone = 'rust', className = '' }: HighlightProps) {
  return <span className={`highlight ${tone === 'paper' ? 'highlight--paper' : ''} ${className}`}>{children}</span>
}
