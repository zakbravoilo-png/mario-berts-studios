interface NoiseOverlayProps {
  /** 0–1. */
  opacity?: number
  /** fine = light film grain; coarse = dark photocopy specks. */
  grain?: 'fine' | 'coarse'
  className?: string
}

/**
 * Grain overlay (SVG feTurbulence as a tiny data URI). Absolutely positioned;
 * parent must be `relative`. Never place it over forms, tables, prices or small text.
 */
export function NoiseOverlay({ opacity = 0.2, grain = 'fine', className = '' }: NoiseOverlayProps) {
  return <div aria-hidden="true" className={`noise ${grain === 'coarse' ? 'noise--coarse' : ''} ${className}`} style={{ opacity }} />
}

/** Both grains layered — the "high grunge" default for public display sections. */
export function Grain({ fine = 0.22, coarse = 0.35 }: { fine?: number; coarse?: number }) {
  return (
    <>
      <NoiseOverlay opacity={fine} />
      <NoiseOverlay opacity={coarse} grain="coarse" />
    </>
  )
}
