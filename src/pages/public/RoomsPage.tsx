import { Link } from 'react-router'
import { ArrowRight, Check } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useTitle } from '../../components/ui/useTitle'
import { DuotoneImage, Tape } from '../../components/grunge'
import { rooms } from '../../data/rooms'
import { defaultSettings } from '../../data/settings'
import { formatPHP } from '../../utils/money'
import type { PhotoKey } from '../../data/photos'

export function RoomsPage() {
  useTitle('Rooms')
  return (
    <>
      <PageHeader eyebrow="Rooms" title="Three rooms. Same kit." photo="room1">
        Each room is booked on its own at {formatPHP(defaultSettings.roomRatePerHour)} per hour, with the standard equipment
        included.
      </PageHeader>
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
        {rooms.map((room, i) => (
          <section key={room.id} aria-labelledby={`${room.id}-title`} className="grid items-center gap-10 lg:grid-cols-2">
            <div className={`relative ${i % 2 ? 'lg:order-2' : ''}`}>
              <div className={`relative drop-shadow-[10px_10px_0_rgba(0,0,0,0.5)] ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                {room.photo && <DuotoneImage photo={room.photo as PhotoKey} tone="photo" halftone={false} grain={false} className="aspect-video w-full" sizes="(min-width: 1024px) 50vw, 100vw" />}
                <Tape className="-top-3 left-10" rotate={-6} />
              </div>
            </div>
            <div>
              <p className="eyebrow text-muted">Room {room.number} of 3</p>
              <h2 id={`${room.id}-title`} className="display mt-1 text-display-2">{room.name}</h2>
              <p className="mt-3 text-muted">{room.description}</p>
              <h3 className="mt-6 font-semibold">Included</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {room.includedEquipment.map((e) => (
                  <li key={e.id} className="flex items-start gap-2 text-paper/90">
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-rust-light" />
                    <span>
                      {e.quantity} × {e.name}
                      {e.note && <span className="block text-xs text-muted">{e.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to={`/book?room=${room.id}`} className="btn btn-primary mt-8">
                Book {room.name} <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
