import { useMemo } from 'react'
import { photos, photoSrc, photoSrcSet, type PhotoKey } from '../../data/photos'
import { NoiseOverlay } from './NoiseOverlay'
import { tornClipPath } from './torn'

interface DuotoneImageProps {
  photo: PhotoKey
  /** Override the registry alt text. Use "" for purely decorative use. */
  alt?: string
  /**
   * mono  = grayscale, off-white highlights, ink shadows (default)
   * rust  = rust highlights — use sparingly, red is an accent
   * natural = original colour, slightly muted
   */
  tone?: 'mono' | 'rust' | 'natural'
  /** Halftone dot screen over the photo. */
  halftone?: boolean | 'coarse'
  /** Grain on the photo. */
  grain?: boolean
  /** Seed for ragged torn edges on all sides; omit for a clean rectangle. */
  torn?: number
  /** `sizes` attribute for responsive loading. */
  sizes?: string
  priority?: boolean
  className?: string
}

/**
 * Photo frame with the studio's print treatment (reference 05): duotone,
 * halftone screen, grain and optional torn edges. All CSS/SVG.
 */
export function DuotoneImage({
  photo,
  alt,
  tone = 'mono',
  halftone = true,
  grain = true,
  torn,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  className = '',
}: DuotoneImageProps) {
  const p = photos[photo]
  const clipPath = useMemo(() => (torn === undefined ? undefined : tornClipPath(torn)), [torn])
  const toneVars =
    tone === 'rust'
      ? { ['--duo-hi' as string]: 'var(--color-rust)' }
      : tone === 'natural'
        ? undefined
        : { ['--duo-hi' as string]: 'var(--color-paper)' }

  return (
    <figure
      className={`m-0 ${tone === 'natural' ? 'relative overflow-hidden bg-ink' : 'duotone'} ${className}`}
      style={{ ...toneVars, clipPath }}
    >
      <img
        src={photoSrc(p)}
        srcSet={photoSrcSet(p)}
        sizes={sizes}
        alt={alt ?? p.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={tone === 'natural' ? 'absolute inset-0 h-full w-full object-cover saturate-[0.7] contrast-[1.1]' : undefined}
      />
      {halftone && (
        <div
          aria-hidden="true"
          className={`halftone-screen ${halftone === 'coarse' ? 'halftone-screen--coarse' : ''} absolute inset-0 z-[3] opacity-50`}
        />
      )}
      {grain && (
        <div className="absolute inset-0 z-[4]" aria-hidden="true">
          <NoiseOverlay opacity={0.3} />
          <NoiseOverlay opacity={0.35} grain="coarse" />
        </div>
      )}
    </figure>
  )
}
