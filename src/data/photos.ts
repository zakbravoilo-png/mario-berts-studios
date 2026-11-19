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
  // The studio's own rooms (supplied 2026-11-19). Shown in true colour wherever a customer picks a room.
  room1: { name: 'room-1', widths: [640, 1200, 1600], ratio: 16 / 9, alt: 'Room 1: beige walls with black foam panels, a drum kit on a rug, two vocal mics, bass and guitar amps, and two speakers on stands' },
  room2: { name: 'room-2', widths: [640, 1200, 1600], ratio: 16 / 9, alt: 'Room 2: red and white striped walls, a drum kit on a patterned rug, a small guitar amp, a fan and two speakers on stands' },
  room3: { name: 'room-3', widths: [640, 1200, 1600], ratio: 16 / 9, alt: 'Room 3: purple padded walls, a drum kit on a carpeted riser, a guitar amp on a case, a wall fan and two speakers on stands' },
  roomBwWide: { name: 'room-bw-wide', widths: [960, 1920], ratio: 16 / 9, alt: 'Empty rehearsal room with a drum kit, two vocal mics on stands and amplifiers' },
  roomWarm: { name: 'room-warm', widths: [640, 1200], ratio: 1, alt: 'Rehearsal room with drum kit, microphones and amp stacks under warm light' },
  bandRehearsalStudio: { name: 'band-rehearsal-studio', widths: [640, 1200], ratio: 4 / 3, alt: 'A four-piece band rehearsing in one of the studio rooms: two guitarists, a bassist and a drummer, with mics and pedalboards on the floor' },
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
