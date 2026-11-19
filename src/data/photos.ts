/**
 * Photos supplied by the user (2026-11-16). Optimized from `photo-sources/` by
 * `node scripts/optimize-images.mjs` into `public/images/<name>-<width>.webp`.
 *
 * RIGHTS TO CONFIRM before publishing: source/licence of each photo, consent of the
 * people shown, and visible brand logos (drum/amp makers). See public/images/CREDITS.md.
 */
export interface Photo {
  name: string
  widths: number[]
  /** Intrinsic aspect ratio (w / h) of the source. */
  ratio: number
  alt: string
}

export const photos = {
  roomBwWide: { name: 'room-bw-wide', widths: [960, 1920], ratio: 16 / 9, alt: 'Empty rehearsal room with a drum kit, two vocal mics on stands and amplifiers' },
  roomWarm: { name: 'room-warm', widths: [640, 1200], ratio: 1, alt: 'Rehearsal room with drum kit, microphones and amp stacks under warm light' },
  bandRehearsal: { name: 'band-rehearsal', widths: [640, 1200], ratio: 4 / 3, alt: 'A band rehearsing: bassist, drummer and guitarist singing into a mic' },
  rehearsalFisheye: { name: 'rehearsal-fisheye', widths: [640, 1200], ratio: 3 / 4, alt: 'Fisheye view of a guitarist seated mid-rehearsal with the singer and drummer behind' },
  gearGuitars: { name: 'gear-guitars', widths: [640, 1200], ratio: 3 / 2, alt: 'Acoustic and electric guitars, a bass and a keyboard on stands in sunlight' },
  drumsStripes: { name: 'drums-stripes', widths: [640, 1200], ratio: 1, alt: 'Drum kit with cymbals in front of a striped wall' },
  liveBw: { name: 'live-bw', widths: [640, 1200], ratio: 3 / 2, alt: 'Black-and-white shot of a guitarist thrashing during a live set' },
  liveBlue: { name: 'live-blue', widths: [640, 1200], ratio: 3 / 2, alt: 'Bassist and guitarist playing a live gig under blue light' },
} satisfies Record<string, Photo>

export type PhotoKey = keyof typeof photos

export function photoSrc(p: Photo, width?: number): string {
  const w = width ?? p.widths[p.widths.length - 1]!
  return `/images/${p.name}-${w}.webp`
}

export function photoSrcSet(p: Photo): string {
  return p.widths.map((w) => `/images/${p.name}-${w}.webp ${w}w`).join(', ')
}
