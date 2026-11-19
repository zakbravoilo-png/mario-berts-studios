import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { findByReferenceAndPhone } from '../../services/actions'
import { useTitle } from '../../components/ui/useTitle'
import { TextField } from '../../components/ui/Field'
import { Callout } from '../../components/ui/Callout'
import { LessonDetail, RehearsalDetail } from '../portal/ReservationDetailPage'

/**
 * Guest access: look up a booking with its reference + the contact number used.
 * Keeps the phone number out of the URL (privacy). Demo-grade check only.
 */
export function FindBookingPage() {
  useTitle('Find my booking')
  const s = useDemoState()
  const [params] = useSearchParams()
  const [ref, setRef] = useState(params.get('ref') ?? '')
  const [phone, setPhone] = useState('')
  const [found, setFound] = useState<{ kind: 'rehearsal' | 'lesson'; id: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function lookup(e: FormEvent) {
    e.preventDefault()
    if (!ref.trim() || !phone.trim()) return setError('Enter both your booking reference and your contact number.')
    const r = findByReferenceAndPhone(ref, phone)
    if (!r) {
      setFound(null)
      return setError('No booking matches that reference and contact number. Check both and try again.')
    }
    setError(null)
    setFound(r)
  }

  const back = { to: '/my-booking', label: 'Look up another booking' }
  const booking = found?.kind === 'rehearsal' ? s.bookings.find((b) => b.id === found.id) : undefined
  const lesson = found?.kind === 'lesson' ? s.lessons.find((l) => l.id === found.id) : undefined

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      {booking ? (
        <div onClickCapture={(e) => { if ((e.target as HTMLElement).closest(`a[href="${back.to}"]`)) setFound(null) }}>
          <RehearsalDetail booking={booking} back={back} />
        </div>
      ) : lesson ? (
        <div onClickCapture={(e) => { if ((e.target as HTMLElement).closest(`a[href="${back.to}"]`)) setFound(null) }}>
          <LessonDetail lesson={lesson} back={back} instructorName={s.instructors.find((i) => i.id === lesson.instructorId)?.displayName ?? 'Instructor'} />
        </div>
      ) : (
        <>
          <p className="eyebrow text-muted">No account needed</p>
          <h1 className="display mt-2 text-display-2">Find my booking</h1>
          <p className="mt-3 max-w-xl text-paper/90">Enter the reference from your confirmation (like MBS-2611-0042) and the contact number you booked with.</p>
          <form noValidate onSubmit={lookup} className="mt-8 grid max-w-xl gap-5 sm:grid-cols-2">
            <TextField label="Booking reference" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="MBS-…" autoComplete="off" />
            <TextField label="Contact number" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button type="submit" className="btn btn-primary justify-self-start sm:col-span-2">
              <Search aria-hidden="true" className="size-5" /> Find booking
            </button>
          </form>
          {error && <Callout tone="error" title={error} className="mt-6 max-w-xl" />}
          <Callout tone="demo" title="Demo lookup" className="mt-8 max-w-xl">
            A real system would also send a one-time code to your phone or email before showing a booking. Have an account?{' '}
            <Link to="/portal/reservations" className="underline">Go to the customer portal</Link>.
          </Callout>
        </>
      )}
    </div>
  )
}
