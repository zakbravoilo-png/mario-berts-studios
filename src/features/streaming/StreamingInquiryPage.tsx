import { useState, type FormEvent } from 'react'
import { RadioTower } from 'lucide-react'
import { useDemoState } from '../../services/demoStore'
import { createStreamingInquiry } from '../../services/actions'
import { useNow } from '../booking/useNow'
import { useCurrentCustomer, ownsRecord } from '../../services/accounts'
import { CustomerFields } from '../booking/CustomerFields'
import { emptyCustomer, validateCustomer, type CustomerErrors, type CustomerForm } from '../booking/customerSchema'
import { PortalHeader } from '../../components/ui/PortalHeader'
import { Callout } from '../../components/ui/Callout'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusLabel } from '../../components/ui/StatusLabel'
import { TextArea, TextField } from '../../components/ui/Field'
import { formatPHP } from '../../utils/money'
import { formatDate, todayManila } from '../../utils/time'

export function StreamingInquiryPage({ guest = false }: { guest?: boolean }) {
  const s = useDemoState()
  const me = useCurrentCustomer()
  const now = useNow()
  const rate = s.settings.streamingRatePerHour
  const [ev, setEv] = useState({ eventDate: '', estimatedHours: '2', eventLocation: '', description: '' })
  const [contact, setContact] = useState<CustomerForm>(() => (guest || !me ? emptyCustomer() : { name: me.name, email: me.email, phone: me.phone, bandName: me.bandName ?? '', notes: '' }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cErrors, setCErrors] = useState<CustomerErrors>({})
  const [sent, setSent] = useState<string | null>(null)
  const hours = Number(ev.estimatedHours)
  const mine = me ? s.streaming.filter((x) => ownsRecord(me, x)) : []

  function submit(e: FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!ev.eventDate) errs.eventDate = 'Choose the event date.'
    else if (ev.eventDate < todayManila(now)) errs.eventDate = 'The date has already passed.'
    if (!Number.isFinite(hours) || hours < 1 || hours > 12 || !Number.isInteger(hours)) errs.estimatedHours = 'Enter whole hours between 1 and 12.'
    if (!ev.eventLocation.trim()) errs.eventLocation = 'Where is the gig?'
    if (ev.description.trim().length < 5) errs.description = 'Add a short description of the event.'
    const ce = validateCustomer(contact)
    setErrors(errs)
    setCErrors(ce)
    if (Object.keys(errs).length || Object.keys(ce).length) return
    const r = createStreamingInquiry({
      eventDate: ev.eventDate,
      estimatedHours: hours,
      eventLocation: ev.eventLocation.trim(),
      description: ev.description.trim(),
      customer: { name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone.trim(), bandName: contact.bandName?.trim() || undefined },
      customerId: guest || !me ? 'guest' : me.id,
    })
    if (r.ok) setSent(r.value.reference)
  }

  return (
    <>
      <PortalHeader title="Live gig streaming" eyebrow={guest ? 'Inquiry · no account needed · demo' : 'Inquiry · demo'} description={<>{formatPHP(rate)} per hour. Packages, equipment and platforms are to be confirmed by the studio — this is an inquiry, not a booking.</>} />
      {sent ? (
        <Callout tone="success" title={`Inquiry ${sent} sent (demo)`}>The studio will get back to you. In this prototype, the demo admin can mark it as responded.</Callout>
      ) : (
        <form noValidate onSubmit={submit} className="grid max-w-3xl gap-5 sm:grid-cols-2">
          <TextField label="Event date" type="date" min={todayManila(now)} value={ev.eventDate} onChange={(e) => setEv({ ...ev, eventDate: e.target.value })} error={errors.eventDate} />
          <TextField label="Estimated hours" type="number" min={1} max={12} step={1} inputMode="numeric" value={ev.estimatedHours} onChange={(e) => setEv({ ...ev, estimatedHours: e.target.value })} error={errors.estimatedHours} />
          <TextField className="sm:col-span-2" label="Venue / location" value={ev.eventLocation} onChange={(e) => setEv({ ...ev, eventLocation: e.target.value })} error={errors.eventLocation} />
          <TextArea className="sm:col-span-2" label="About the event" value={ev.description} onChange={(e) => setEv({ ...ev, description: e.target.value })} error={errors.description} hint="Bands, expected set times, anything the studio should know." />
          <div className="border border-slate bg-ink p-4 sm:col-span-2">
            <p className="text-sm text-muted">Estimate</p>
            <p className="font-mono text-2xl font-bold" aria-live="polite">
              {Number.isInteger(hours) && hours > 0 ? `${hours} × ${formatPHP(rate)} = ${formatPHP(hours * rate)}` : '—'}
            </p>
            <p className="mt-1 text-xs text-muted">Estimate only. Final scope and price to be confirmed by the studio.</p>
          </div>
          <div className="sm:col-span-2">
            <h2 className="mb-4 font-display text-xl tracking-wide">Your contact details</h2>
            <CustomerFields value={contact} errors={cErrors} onChange={setContact} bandLabel="Band or organiser" notesLabel="Anything else" />
          </div>
          <button type="submit" className="btn btn-primary justify-self-start">Send inquiry</button>
        </form>
      )}
      {!guest && (
      <section aria-labelledby="past-title" className="mt-12">
        <h2 id="past-title" className="font-display text-2xl tracking-wide">Your streaming inquiries</h2>
        <div className="mt-4 space-y-3">
          {mine.length === 0 ? (
            <EmptyState icon={RadioTower} title="No inquiries yet" />
          ) : (
            mine.map((x) => (
              <article key={x.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-mono font-bold">{x.reference}</p>
                  <p className="text-sm">{formatDate(x.eventDate)} · {x.estimatedHours} hrs · {x.eventLocation}</p>
                  <p className="text-sm text-muted">Estimate {formatPHP(x.estimatedPrice)}</p>
                </div>
                <StatusLabel status={x.status} variant="plain" />
              </article>
            ))
          )}
        </div>
      </section>
      )}
    </>
  )
}
