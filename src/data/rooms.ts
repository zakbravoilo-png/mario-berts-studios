import type { Room, RoomIncludedEquipment } from '../types/domain'

/** Confirmed standard kit — included in the base rate in every room. Never an add-on. */
export const includedEquipment: RoomIncludedEquipment[] = [
  { id: 'mixer', name: 'Audio mixer', quantity: 1 },
  { id: 'guitar-amp', name: 'Guitar amplifiers', quantity: 2 },
  { id: 'bass-amp', name: 'Bass amplifier', quantity: 1 },
  { id: 'drum-kit', name: 'Drum kit', quantity: 1 },
  { id: 'mic', name: 'Microphones', quantity: 2 },
  {
    id: 'vocal-speaker',
    name: 'Vocal speakers',
    quantity: 3,
    note: 'One beside the drummer, two facing the rest of the band',
  },
]

const roomDescription = 'Placeholder — room description to be written by studio.'
const roomPhotos = ['room1', 'room2', 'room3'] as const

export const rooms: Room[] = ([1, 2, 3] as const).map((n) => ({
  id: `room-${n}`,
  name: `Room ${n}`,
  number: n,
  description: roomDescription,
  photo: roomPhotos[n - 1] ?? null,
  includedEquipment,
  active: true,
}))

export function getRoom(id: string): Room | undefined {
  return rooms.find((r) => r.id === id)
}

export function roomName(id: string): string {
  return getRoom(id)?.name ?? id
}
