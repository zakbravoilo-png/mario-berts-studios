import { useMemo } from 'react'
import { mulberry32 } from './torn'

function tornPath(seed: number, segments: number, roughness: number, base = 6): string {
  const rand = mulberry32(seed)
  const pts: string[] = []
  const step = 1000 / segments
  for (let i = 0; i <= segments; i++) {
    const x = Math.min(1000, i * step + (i > 0 && i < segments ? (rand() - 0.5) * step * 0.8 : 0))
    // mostly small jitter with occasional deep rips
    const deep = rand() > 0.82 ? rand() * roughness : 0
    const y = base + rand() * roughness * 0.45 + deep
    pts.push(`${x.toFixed(1)},${Math.min(y, 98).toFixed(1)}`)
  }
  return `M0,100 L0,${pts[0]!.split(',')[1]} L${pts.join(' L')} L1000,100 Z`
}

interface TornEdgeProps {
  /** Fill colour of the block being torn — a text-* class (fills with currentColor). */
  className?: string
  /**
   * Optional second, lighter layer peeking out behind the rip (paper fibre / backing).
   * A text-* class, e.g. "text-slate".
   */
  underClassName?: string
  /** Background behind the rip — the colour of the block above (top) or below (bottom). */
  backClassName?: string
  /** 'top' draws a rip at the top of the next block; 'bottom' flips it. */
  side?: 'top' | 'bottom'
  seed?: number
  height?: number
  segments?: number
  roughness?: number
}

/**
 * Torn-paper divider. Inline SVG strip filled with `currentColor`, so
 * `className="text-paper"` makes a paper rip. Decorative only.
 */
export function TornEdge({
  className = 'text-paper',
  underClassName,
  backClassName = '',
  side = 'top',
  seed = 7,
  height = 40,
  segments = 70,
  roughness = 85,
}: TornEdgeProps) {
  const d = useMemo(() => tornPath(seed, segments, roughness), [seed, segments, roughness])
  const under = useMemo(
    () => (underClassName ? tornPath(seed + 101, Math.round(segments * 1.3), roughness * 0.9, 0) : null),
    [underClassName, seed, segments, roughness],
  )
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      className={`pointer-events-none relative z-10 block w-full ${backClassName}`}
      style={{
        height,
        transform: side === 'bottom' ? 'scaleY(-1)' : undefined,
        marginBottom: side === 'top' ? -1 : 0,
        marginTop: side === 'bottom' ? -1 : 0,
      }}
    >
      {under && <path d={under} fill="currentColor" className={underClassName} />}
      <path d={d} fill="currentColor" className={className} />
    </svg>
  )
}
