import type { LessonLevel, LessonType, ShopCategory } from '../types/domain'

export const lessonTypes: { id: LessonType; label: string }[] = [
  { id: 'drums', label: 'Drums' },
  { id: 'guitar', label: 'Guitar' },
  { id: 'bass', label: 'Bass' },
  { id: 'keyboard', label: 'Keyboard' },
  { id: 'piano', label: 'Piano' },
  { id: 'voice', label: 'Voice' },
]

export const lessonLevels: { id: LessonLevel; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
]

export function lessonLabel(id: LessonType): string {
  return lessonTypes.find((l) => l.id === id)?.label ?? id
}
export function levelLabel(id: LessonLevel): string {
  return lessonLevels.find((l) => l.id === id)?.label ?? id
}

/** Shop categories (confirmed by the user). */
export const shopCategories: { id: ShopCategory; label: string }[] = [
  { id: 'acoustic-strings', label: 'Acoustic guitar strings' },
  { id: 'electric-strings', label: 'Electric guitar strings' },
  { id: 'bass-strings', label: 'Electric bass strings' },
  { id: 'drumsticks', label: 'Drumsticks' },
]

/**
 * Studio contact details — provided by the user on 2026-11-16.
 * Phone provided by the user (2026-11-16). The Facebook/Messenger page link has NOT been provided: keep it null
 * (shown as "to be provided"). Never invent them.
 */
export const studioContact: {
  address: string | null
  mapUrl: string | null
  phone: string | null
  /** tel: link target in international format. */
  phoneHref: string | null
  email: string | null
  /** Preferred contact channel. */
  messenger: { label: string; url: string | null }
  socials: { label: string; url: string }[]
} = {
  address: 'L40 Blk 2 Dama De Noche St., Don Francisco Village, Jaro, Iloilo City, Philippines 5000',
  mapUrl: 'https://www.bing.com/maps?cp=10.7273924781~122.56593&lvl=17',
  phone: '0921 265 1898',
  phoneHref: 'tel:+639212651898',
  email: 'mario.bertstudios@gmail.com',
  messenger: { label: 'Facebook Messenger', url: null },
  socials: [],
}
